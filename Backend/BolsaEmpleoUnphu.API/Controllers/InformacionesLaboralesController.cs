using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InformacionesLaboralesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public InformacionesLaboralesController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/informacioneslaborales
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InformacionesLaboralesModel>>> GetInformacionesLaborales()
    {
        return await _context.InformacionesLaborales
            .Include(i => i.Usuario)
            .ToListAsync();
    }

    // GET: api/informacioneslaborales/5
    [HttpGet("{id}")]
    public async Task<ActionResult<InformacionesLaboralesModel>> GetInformacionLaboral(int id)
    {
        var informacionLaboral = await _context.InformacionesLaborales
            .Include(i => i.Usuario)
            .FirstOrDefaultAsync(i => i.InfoLaboralID == id);

        if (informacionLaboral == null)
        {
            return NotFound();
        }

        return informacionLaboral;
    }

    // POST: api/informacioneslaborales
    [HttpPost]
    public async Task<ActionResult<InformacionesLaboralesModel>> PostInformacionLaboral(InformacionesLaboralesModel informacionLaboral)
    {
        _context.InformacionesLaborales.Add(informacionLaboral);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInformacionLaboral), new { id = informacionLaboral.InfoLaboralID }, informacionLaboral);
    }

    // PUT: api/informacioneslaborales/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutInformacionLaboral(int id, InformacionesLaboralesModel informacionLaboral)
    {
        if (id != informacionLaboral.InfoLaboralID)
        {
            return BadRequest();
        }

        _context.Entry(informacionLaboral).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!InformacionLaboralExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/informacioneslaborales/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInformacionLaboral(int id)
    {
        var informacionLaboral = await _context.InformacionesLaborales.FindAsync(id);
        if (informacionLaboral == null)
        {
            return NotFound();
        }

        _context.InformacionesLaborales.Remove(informacionLaboral);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool InformacionLaboralExists(int id)
    {
        return _context.InformacionesLaborales.Any(e => e.InfoLaboralID == id);
    }
}