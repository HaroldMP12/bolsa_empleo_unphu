using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.DTOs;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PerfilesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public PerfilesController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/perfiles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PerfilesModel>>> GetPerfiles()
    {
        return await _context.Perfiles
            .Include(p => p.Usuario)
            .Include(p => p.Carrera)
            .ToListAsync();
    }

    // GET: api/perfiles/usuario/5
    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<PerfilesModel?>> GetPerfilByUsuario(int usuarioId)
    {
        var perfil = await _context.Perfiles
            .Include(p => p.Usuario)
            .Include(p => p.Carrera)
            .FirstOrDefaultAsync(p => p.UsuarioID == usuarioId);

        return Ok(perfil); // Devuelve null si no existe, no 404
    }

    // GET: api/perfiles/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PerfilesModel>> GetPerfil(int id)
    {
        var perfil = await _context.Perfiles
            .Include(p => p.Usuario)
            .Include(p => p.Carrera)
            .FirstOrDefaultAsync(p => p.PerfilID == id);

        if (perfil == null)
        {
            return NotFound();
        }

        return perfil;
    }

    // POST: api/perfiles
    [HttpPost]
    [Authorize(Roles = "Estudiante,Egresado,Admin")]
    public async Task<ActionResult<PerfilesModel>> PostPerfil(CreatePerfilDto perfilDto)
    {
        // Crear el modelo desde el DTO
        var perfil = new PerfilesModel
        {
            UsuarioID = perfilDto.UsuarioID,
            TipoPerfil = perfilDto.TipoPerfil,
            Matricula = perfilDto.Matricula,
            CarreraID = perfilDto.CarreraID,
            Semestre = perfilDto.Semestre,
            FechaIngreso = perfilDto.FechaIngreso,
            TituloObtenido = perfilDto.TituloObtenido,
            FechaEgreso = perfilDto.FechaEgreso,
            AñoGraduacion = perfilDto.AñoGraduacion,
            UrlImagen = perfilDto.UrlImagen,
            Resumen = perfilDto.Resumen,
            RedesSociales = perfilDto.RedesSociales,
            FechaNacimiento = perfilDto.FechaNacimiento,
            Direccion = perfilDto.Direccion,
            PromedioAcademico = perfilDto.PromedioAcademico
        };

        _context.Perfiles.Add(perfil);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPerfil), new { id = perfil.PerfilID }, perfil);
    }

    // PUT: api/perfiles/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPerfil(int id, UpdatePerfilDto perfilDto)
    {
        if (id != perfilDto.PerfilID)
        {
            return BadRequest();
        }

        // Validación 9: Solo puedes editar tu propio perfil (excepto Admin)
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin")
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            if (perfilDto.UsuarioID != usuarioId)
                return StatusCode(403, "Solo puedes editar tu propio perfil");
        }

        // Buscar perfil existente
        var perfil = await _context.Perfiles.FindAsync(id);
        if (perfil == null)
            return NotFound();

        // Actualizar propiedades desde el DTO
        perfil.UsuarioID = perfilDto.UsuarioID;
        perfil.TipoPerfil = perfilDto.TipoPerfil;
        perfil.Matricula = perfilDto.Matricula;
        perfil.CarreraID = perfilDto.CarreraID;
        perfil.Semestre = perfilDto.Semestre;
        perfil.FechaIngreso = perfilDto.FechaIngreso;
        perfil.TituloObtenido = perfilDto.TituloObtenido;
        perfil.FechaEgreso = perfilDto.FechaEgreso;
        perfil.AñoGraduacion = perfilDto.AñoGraduacion;
        perfil.UrlImagen = perfilDto.UrlImagen;
        perfil.Resumen = perfilDto.Resumen;
        perfil.RedesSociales = perfilDto.RedesSociales;
        perfil.FechaNacimiento = perfilDto.FechaNacimiento;
        perfil.Direccion = perfilDto.Direccion;
        perfil.PromedioAcademico = perfilDto.PromedioAcademico;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Perfil actualizado exitosamente" });
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PerfilExists(id))
            {
                return NotFound();
            }
            throw;
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al actualizar el perfil", error = ex.Message });
        }
    }

    // DELETE: api/perfiles/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePerfil(int id)
    {
        var perfil = await _context.Perfiles.FindAsync(id);
        if (perfil == null)
        {
            return NotFound();
        }

        _context.Perfiles.Remove(perfil);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PerfilExists(int id)
    {
        return _context.Perfiles.Any(e => e.PerfilID == id);
    }
}