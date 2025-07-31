using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.DTOs;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostulacionesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public PostulacionesController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/postulaciones
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PostulacionesModel>>> GetPostulaciones()
    {
        return await _context.Postulaciones
            .Include(p => p.Usuario)
            .Include(p => p.Vacante)
            .ToListAsync();
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

        return CreatedAtAction(nameof(GetPostulacion), new { id = postulacion.PostulacionID }, postulacion);
    }

    // PUT: api/postulaciones/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPostulacion(int id, PostulacionesModel postulacion)
    {
        if (id != postulacion.PostulacionID)
        {
            return BadRequest();
        }

        _context.Entry(postulacion).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
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