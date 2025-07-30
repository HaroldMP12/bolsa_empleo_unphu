using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RespuestasPostulacionesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public RespuestasPostulacionesController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/respuestaspostulaciones
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RespuestasPostulacionesModel>>> GetRespuestasPostulaciones()
    {
        return await _context.RespuestasPostulaciones
            .Include(r => r.Postulacion)
            .Include(r => r.Pregunta)
            .ToListAsync();
    }

    // GET: api/respuestaspostulaciones/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RespuestasPostulacionesModel>> GetRespuestaPostulacion(int id)
    {
        var respuestaPostulacion = await _context.RespuestasPostulaciones
            .Include(r => r.Postulacion)
            .Include(r => r.Pregunta)
            .FirstOrDefaultAsync(r => r.RespuestaID == id);

        if (respuestaPostulacion == null)
        {
            return NotFound();
        }

        return respuestaPostulacion;
    }

    // POST: api/respuestaspostulaciones
    [HttpPost]
    public async Task<ActionResult<RespuestasPostulacionesModel>> PostRespuestaPostulacion(RespuestasPostulacionesModel respuestaPostulacion)
    {
        _context.RespuestasPostulaciones.Add(respuestaPostulacion);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRespuestaPostulacion), new { id = respuestaPostulacion.RespuestaID }, respuestaPostulacion);
    }

    // PUT: api/respuestaspostulaciones/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutRespuestaPostulacion(int id, RespuestasPostulacionesModel respuestaPostulacion)
    {
        if (id != respuestaPostulacion.RespuestaID)
        {
            return BadRequest();
        }

        _context.Entry(respuestaPostulacion).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RespuestaPostulacionExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/respuestaspostulaciones/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRespuestaPostulacion(int id)
    {
        var respuestaPostulacion = await _context.RespuestasPostulaciones.FindAsync(id);
        if (respuestaPostulacion == null)
        {
            return NotFound();
        }

        _context.RespuestasPostulaciones.Remove(respuestaPostulacion);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool RespuestaPostulacionExists(int id)
    {
        return _context.RespuestasPostulaciones.Any(e => e.RespuestaID == id);
    }
}