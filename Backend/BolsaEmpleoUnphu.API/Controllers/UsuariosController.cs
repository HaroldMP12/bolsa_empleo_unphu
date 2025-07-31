using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
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
    public async Task<ActionResult<UsuariosModel>> PostUsuario(UsuariosModel usuario)
    {
        usuario.Contraseña = BCrypt.Net.BCrypt.HashPassword(usuario.Contraseña);
        usuario.FechaRegistro = DateTime.Now;
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.UsuarioID }, usuario);
    }

    // PUT: api/usuarios/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUsuario(int id, UsuariosModel usuario)
    {
        if (id != usuario.UsuarioID)
        {
            return BadRequest();
        }

        usuario.FechaUltimaActualización = DateTime.Now;
        _context.Entry(usuario).State = EntityState.Modified;

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