using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PreguntasVacantesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public PreguntasVacantesController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/preguntasvacantes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PreguntasVacantesModel>>> GetPreguntasVacantes()
    {
        return await _context.PreguntasVacantes
            .Include(p => p.Vacante)
            .ToListAsync();
    }

    // GET: api/preguntasvacantes/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PreguntasVacantesModel>> GetPreguntaVacante(int id)
    {
        var preguntaVacante = await _context.PreguntasVacantes
            .Include(p => p.Vacante)
            .Include(p => p.RespuestasPostulaciones)
            .FirstOrDefaultAsync(p => p.PreguntaID == id);

        if (preguntaVacante == null)
        {
            return NotFound();
        }

        return preguntaVacante;
    }

    // POST: api/preguntasvacantes
    [HttpPost]
    public async Task<ActionResult<PreguntasVacantesModel>> PostPreguntaVacante(PreguntasVacantesModel preguntaVacante)
    {
        _context.PreguntasVacantes.Add(preguntaVacante);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPreguntaVacante), new { id = preguntaVacante.PreguntaID }, preguntaVacante);
    }

    // PUT: api/preguntasvacantes/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPreguntaVacante(int id, PreguntasVacantesModel preguntaVacante)
    {
        if (id != preguntaVacante.PreguntaID)
        {
            return BadRequest();
        }

        _context.Entry(preguntaVacante).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PreguntaVacanteExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/preguntasvacantes/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePreguntaVacante(int id)
    {
        var preguntaVacante = await _context.PreguntasVacantes.FindAsync(id);
        if (preguntaVacante == null)
        {
            return NotFound();
        }

        _context.PreguntasVacantes.Remove(preguntaVacante);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PreguntaVacanteExists(int id)
    {
        return _context.PreguntasVacantes.Any(e => e.PreguntaID == id);
    }
}