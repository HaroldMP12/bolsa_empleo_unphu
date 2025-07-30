using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InformacionesAcademicasController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public InformacionesAcademicasController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/informacionesacademicas
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InformacionesAcademicasModel>>> GetInformacionesAcademicas()
    {
        return await _context.InformacionesAcademicas
            .Include(i => i.Usuario)
            .ToListAsync();
    }

    // GET: api/informacionesacademicas/5
    [HttpGet("{id}")]
    public async Task<ActionResult<InformacionesAcademicasModel>> GetInformacionAcademica(int id)
    {
        var informacionAcademica = await _context.InformacionesAcademicas
            .Include(i => i.Usuario)
            .FirstOrDefaultAsync(i => i.InfoAcademicaID == id);

        if (informacionAcademica == null)
        {
            return NotFound();
        }

        return informacionAcademica;
    }

    // POST: api/informacionesacademicas
    [HttpPost]
    public async Task<ActionResult<InformacionesAcademicasModel>> PostInformacionAcademica(InformacionesAcademicasModel informacionAcademica)
    {
        _context.InformacionesAcademicas.Add(informacionAcademica);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInformacionAcademica), new { id = informacionAcademica.InfoAcademicaID }, informacionAcademica);
    }

    // PUT: api/informacionesacademicas/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutInformacionAcademica(int id, InformacionesAcademicasModel informacionAcademica)
    {
        if (id != informacionAcademica.InfoAcademicaID)
        {
            return BadRequest();
        }

        _context.Entry(informacionAcademica).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!InformacionAcademicaExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/informacionesacademicas/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInformacionAcademica(int id)
    {
        var informacionAcademica = await _context.InformacionesAcademicas.FindAsync(id);
        if (informacionAcademica == null)
        {
            return NotFound();
        }

        _context.InformacionesAcademicas.Remove(informacionAcademica);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool InformacionAcademicaExists(int id)
    {
        return _context.InformacionesAcademicas.Any(e => e.InfoAcademicaID == id);
    }
}