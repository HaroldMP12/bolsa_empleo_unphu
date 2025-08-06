using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.DTOs;
using BolsaEmpleoUnphu.API.Extensions;
using BolsaEmpleoUnphu.API.Services;
using BCrypt.Net;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;
    private readonly INotificacionService _notificacionService;

    public UsuariosController(BolsaEmpleoUnphuContext context, INotificacionService notificacionService)
    {
        _context = context;
        _notificacionService = notificacionService;
    }

    // GET: api/usuarios
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResult<UsuarioResponseDto>>> GetUsuarios(
        int page = 1, 
        int pageSize = 10,
        int? rolId = null,
        string? search = null,
        bool? estado = null)
    {
        var query = _context.Usuarios
            .Include(u => u.Rol)
            .AsQueryable();

        // Filtros
        if (rolId.HasValue)
            query = query.Where(u => u.RolID == rolId.Value);
            
        if (!string.IsNullOrEmpty(search))
            query = query.Where(u => u.NombreCompleto.Contains(search) || 
                                   u.Correo.Contains(search));
                                   
        if (estado.HasValue)
            query = query.Where(u => u.Estado == estado.Value);

        // Contar total
        var totalRecords = await query.CountAsync();

        // Paginación
        var usuarios = await query
            .OrderBy(u => u.NombreCompleto)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<UsuarioResponseDto>
        {
            Data = usuarios.Select(u => u.ToResponseDto()),
            TotalRecords = totalRecords,
            Page = page,
            PageSize = pageSize
        };
    }

    // GET: api/usuarios/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UsuariosModel>> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .Include(u => u.Perfil)
            .FirstOrDefaultAsync(u => u.UsuarioID == id);

        if (usuario == null)
        {
            return NotFound();
        }

        return usuario;
    }

    // POST: api/usuarios
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<UsuariosModel>> PostUsuario(CreateUsuarioDto usuarioDto)
    {
        // Validación 10: Email único al registrarse
        var existeEmail = await _context.Usuarios.AnyAsync(u => u.Correo == usuarioDto.Correo);
        if (existeEmail)
            return BadRequest("Ya existe un usuario con este correo electrónico");

        // Determinar estado inicial según el rol
        string estadoAprobacion = "Aprobado"; // Por defecto aprobado
        bool estadoActivo = true;
        
        // Si es empresa (RolID = 3), requiere aprobación
        if (usuarioDto.RolID == 3)
        {
            estadoAprobacion = "Pendiente";
            estadoActivo = false; // Inactivo hasta aprobación
        }

        // Crear el modelo desde el DTO
        var usuario = new UsuariosModel
        {
            NombreCompleto = usuarioDto.NombreCompleto,
            Correo = usuarioDto.Correo,
            Contraseña = BCrypt.Net.BCrypt.HashPassword(usuarioDto.Contraseña),
            Telefono = usuarioDto.Telefono,
            Estado = estadoActivo,
            EstadoAprobacion = estadoAprobacion,
            RolID = usuarioDto.RolID,
            FechaRegistro = DateTime.Now
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        
        // Simulación de notificaciones
        if (usuarioDto.RolID == 3)
        {
            Console.WriteLine($"[SIMULACIÓN] Email enviado a admin: Nueva empresa pendiente de aprobación");
            Console.WriteLine($"[SIMULACIÓN] Empresa: {usuario.NombreCompleto} ({usuario.Correo})");
        }

        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.UsuarioID }, usuario);
    }

    // PUT: api/usuarios/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUsuario(int id, UpdateUsuarioDto usuarioDto)
    {
        if (id != usuarioDto.UsuarioID)
        {
            return BadRequest();
        }

        // Buscar usuario existente
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound();

        // Actualizar propiedades desde el DTO
        usuario.NombreCompleto = usuarioDto.NombreCompleto;
        usuario.Correo = usuarioDto.Correo;
        usuario.Telefono = usuarioDto.Telefono;
        usuario.Estado = usuarioDto.Estado;
        usuario.RolID = usuarioDto.RolID;
        usuario.FechaUltimaActualización = DateTime.Now;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UsuarioExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/usuarios/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return NotFound();
        }

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/usuarios/5/aprobar
    [HttpPost("{id}/aprobar")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AprobarEmpresa(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound();
            
        if (usuario.RolID != 3)
            return BadRequest("Solo se pueden aprobar empresas");
            
        if (usuario.EstadoAprobacion == "Aprobado")
            return BadRequest("La empresa ya está aprobada");

        usuario.EstadoAprobacion = "Aprobado";
        usuario.Estado = true;
        usuario.FechaUltimaActualización = DateTime.Now;
        
        await _context.SaveChangesAsync();
        
        // Obtener información de la empresa
        var empresa = await _context.Empresas.FirstOrDefaultAsync(e => e.UsuarioID == id);
        var nombreEmpresa = empresa?.NombreEmpresa ?? usuario.NombreCompleto;
        
        // Enviar notificación de aprobación
        await _notificacionService.EnviarNotificacionAprobacionEmpresaAsync(id, nombreEmpresa, true);
        
        return Ok(new { message = "Empresa aprobada exitosamente" });
    }
    
    // POST: api/usuarios/5/rechazar
    [HttpPost("{id}/rechazar")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RechazarEmpresa(int id, [FromBody] string motivo = "")
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
            return NotFound();
            
        if (usuario.RolID != 3)
            return BadRequest("Solo se pueden rechazar empresas");

        usuario.EstadoAprobacion = "Rechazado";
        usuario.Estado = false;
        usuario.FechaUltimaActualización = DateTime.Now;
        
        await _context.SaveChangesAsync();
        
        // Obtener información de la empresa
        var empresa = await _context.Empresas.FirstOrDefaultAsync(e => e.UsuarioID == id);
        var nombreEmpresa = empresa?.NombreEmpresa ?? usuario.NombreCompleto;
        
        // Enviar notificación de rechazo
        await _notificacionService.EnviarNotificacionAprobacionEmpresaAsync(id, nombreEmpresa, false);
        
        return Ok(new { message = "Empresa rechazada" });
    }

    private bool UsuarioExists(int id)
    {
        return _context.Usuarios.Any(e => e.UsuarioID == id);
    }
}