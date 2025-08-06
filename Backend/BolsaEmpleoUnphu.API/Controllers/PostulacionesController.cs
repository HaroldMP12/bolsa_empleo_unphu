using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.DTOs;
using BolsaEmpleoUnphu.API.Extensions;
using BolsaEmpleoUnphu.API.Services;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostulacionesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;
    private readonly INotificacionService _notificacionService;

    public PostulacionesController(BolsaEmpleoUnphuContext context, INotificacionService notificacionService)
    {
        _context = context;
        _notificacionService = notificacionService;
    }

    // GET: api/postulaciones
    [HttpGet]
    public async Task<ActionResult<PagedResult<PostulacionResponseDto>>> GetPostulaciones(
        int page = 1, 
        int pageSize = 10,
        int? vacanteId = null,
        int? usuarioId = null,
        string? estado = null)
    {
        var query = _context.Postulaciones
            .Include(p => p.Usuario)
            .Include(p => p.Vacante)
            .AsQueryable();

        // Filtros
        if (vacanteId.HasValue)
            query = query.Where(p => p.VacanteID == vacanteId.Value);
            
        if (usuarioId.HasValue)
            query = query.Where(p => p.UsuarioID == usuarioId.Value);
            
        if (!string.IsNullOrEmpty(estado))
            query = query.Where(p => p.Estado == estado);

        // Contar total
        var totalRecords = await query.CountAsync();

        // Paginación
        var postulaciones = await query
            .OrderByDescending(p => p.FechaPostulacion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<PostulacionResponseDto>
        {
            Data = postulaciones.Select(p => p.ToResponseDto()),
            TotalRecords = totalRecords,
            Page = page,
            PageSize = pageSize
        };
    }

    // GET: api/postulaciones/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PostulacionesModel>> GetPostulacion(int id)
    {
        var postulacion = await _context.Postulaciones
            .Include(p => p.Usuario)
            .Include(p => p.Vacante)
            .Include(p => p.RespuestasPostulaciones)
            .FirstOrDefaultAsync(p => p.PostulacionID == id);

        if (postulacion == null)
        {
            return NotFound();
        }

        return postulacion;
    }

    // POST: api/postulaciones
    [HttpPost]
    [Authorize(Roles = "Estudiante,Egresado")]
    public async Task<ActionResult<PostulacionesModel>> PostPostulacion(CreatePostulacionDto postulacionDto)
    {
        // Validación 1: No postularse dos veces
        var existePostulacion = await _context.Postulaciones
            .AnyAsync(p => p.VacanteID == postulacionDto.VacanteID && 
                          p.UsuarioID == postulacionDto.UsuarioID);
        
        if (existePostulacion)
            return BadRequest("Ya te postulaste a esta vacante");

        // Validación 2: Vacante no vencida
        var vacante = await _context.Vacantes.FindAsync(postulacionDto.VacanteID);
        if (vacante == null)
            return BadRequest("La vacante no existe");
            
        if (vacante.FechaCierre < DateTime.Now)
            return BadRequest("Esta vacante ya cerró");

        // Validación 4: Solo estudiantes/egresados pueden postularse
        var usuario = await _context.Usuarios.Include(u => u.Rol).FirstOrDefaultAsync(u => u.UsuarioID == postulacionDto.UsuarioID);
        if (usuario == null)
            return BadRequest("El usuario no existe");
            
        if (usuario.Rol.NombreRol != "Estudiante" && usuario.Rol.NombreRol != "Egresado")
            return BadRequest("Solo estudiantes y egresados pueden postularse");

        // Validación 5: Usuario debe tener perfil completo
        var perfil = await _context.Perfiles.FirstOrDefaultAsync(p => p.UsuarioID == postulacionDto.UsuarioID);
        if (perfil == null)
            return BadRequest("Debes completar tu perfil antes de postularte");
            
        if (string.IsNullOrEmpty(perfil.Resumen))
            return BadRequest("Tu perfil debe tener un resumen antes de postularte");

        // Crear el modelo desde el DTO
        var postulacion = new PostulacionesModel
        {
            VacanteID = postulacionDto.VacanteID,
            UsuarioID = postulacionDto.UsuarioID,
            Observaciones = postulacionDto.Observaciones,
            FechaPostulacion = DateTime.Now,
            Estado = "Pendiente"
        };

        _context.Postulaciones.Add(postulacion);
        await _context.SaveChangesAsync();

        // Enviar notificación a la empresa
        var empresa = await _context.Empresas.FirstOrDefaultAsync(e => e.EmpresaID == vacante.EmpresaID);
        if (empresa != null)
        {
            await _notificacionService.EnviarNotificacionPostulacionAsync(
                empresa.UsuarioID, 
                usuario.NombreCompleto, 
                vacante.TituloVacante);
        }

        return CreatedAtAction(nameof(GetPostulacion), new { id = postulacion.PostulacionID }, postulacion);
    }

    // PUT: api/postulaciones/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPostulacion(int id, PostulacionesModel postulacion)
    {
        Console.WriteLine($"[PUT POSTULACION] ID: {id}, Nuevo Estado: {postulacion.Estado}");
        
        if (id != postulacion.PostulacionID)
        {
            return BadRequest();
        }

        var postulacionAnterior = await _context.Postulaciones
            .Include(p => p.Vacante)
            .FirstOrDefaultAsync(p => p.PostulacionID == id);
            
        if (postulacionAnterior == null)
        {
            return NotFound();
        }

        var estadoAnterior = postulacionAnterior.Estado;
        Console.WriteLine($"[PUT POSTULACION] Estado anterior: {estadoAnterior}, Nuevo: {postulacion.Estado}");
        
        _context.Entry(postulacionAnterior).CurrentValues.SetValues(postulacion);

        try
        {
            await _context.SaveChangesAsync();
            
            // Enviar notificación si cambió el estado
            if (estadoAnterior != postulacion.Estado)
            {
                Console.WriteLine($"[PUT POSTULACION] Enviando notificación a usuario {postulacion.UsuarioID}");
                await _notificacionService.EnviarNotificacionCambioEstadoAsync(
                    postulacion.UsuarioID, 
                    postulacionAnterior.Vacante.TituloVacante, 
                    postulacion.Estado);
            }
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PostulacionExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // PUT: api/postulaciones/cambiar-estado
    [HttpPut("cambiar-estado")]
    public async Task<IActionResult> CambiarEstadoPostulacion([FromBody] CambiarEstadoDto dto)
    {
        Console.WriteLine($"[CAMBIAR ESTADO] UsuarioID: {dto.UsuarioID}, Vacante: {dto.TituloVacante}, Nuevo Estado: {dto.NuevoEstado}");
        
        // Enviar notificación directamente
        await _notificacionService.EnviarNotificacionCambioEstadoAsync(
            dto.UsuarioID, 
            dto.TituloVacante, 
            dto.NuevoEstado);
        
        return Ok(new { message = "Notificación enviada exitosamente" });
    }

    public class CambiarEstadoDto
    {
        public int UsuarioID { get; set; }
        public string TituloVacante { get; set; } = string.Empty;
        public string NuevoEstado { get; set; } = string.Empty;
    }

    // DELETE: api/postulaciones/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePostulacion(int id)
    {
        var postulacion = await _context.Postulaciones.FindAsync(id);
        if (postulacion == null)
        {
            return NotFound();
        }

        _context.Postulaciones.Remove(postulacion);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PostulacionExists(int id)
    {
        return _context.Postulaciones.Any(e => e.PostulacionID == id);
    }
}