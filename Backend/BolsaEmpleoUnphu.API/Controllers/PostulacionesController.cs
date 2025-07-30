using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<ActionResult<PostulacionesModel>> PostPostulacion(PostulacionesModel postulacion)
    {
        postulacion.FechaPostulacion = DateTime.Now;
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