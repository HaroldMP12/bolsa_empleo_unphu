using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.DTOs;
using BCrypt.Net;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public UsuariosController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/usuarios
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UsuariosModel>>> GetUsuarios()
    {
        return await _context.Usuarios
            .Include(u => u.Rol)
            .ToListAsync();
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

        // Crear el modelo desde el DTO
        var usuario = new UsuariosModel
        {
            NombreCompleto = usuarioDto.NombreCompleto,
            Correo = usuarioDto.Correo,
            Contraseña = BCrypt.Net.BCrypt.HashPassword(usuarioDto.Contraseña),
            Telefono = usuarioDto.Telefono,
            Estado = usuarioDto.Estado,
            RolID = usuarioDto.RolID,
            FechaRegistro = DateTime.Now
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

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

    private bool UsuarioExists(int id)
    {
        return _context.Usuarios.Any(e => e.UsuarioID == id);
    }
}