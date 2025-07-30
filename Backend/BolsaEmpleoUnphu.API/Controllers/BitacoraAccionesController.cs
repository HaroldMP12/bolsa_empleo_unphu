using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BitacoraAccionesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public BitacoraAccionesController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/bitacoraacciones
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BitacoraAccionesModel>>> GetBitacoraAcciones()
    {
        return await _context.BitacoraAcciones
            .Include(b => b.Usuario)
            .ToListAsync();
    }

    // GET: api/bitacoraacciones/5
    [HttpGet("{id}")]
    public async Task<ActionResult<BitacoraAccionesModel>> GetBitacoraAccion(int id)
    {
        var bitacoraAccion = await _context.BitacoraAcciones
            .Include(b => b.Usuario)
            .FirstOrDefaultAsync(b => b.RegistroID == id);

        if (bitacoraAccion == null)
        {
            return NotFound();
        }

        return bitacoraAccion;
    }

    // POST: api/bitacoraacciones
    [HttpPost]
    public async Task<ActionResult<BitacoraAccionesModel>> PostBitacoraAccion(BitacoraAccionesModel bitacoraAccion)
    {
        bitacoraAccion.FechaAccion = DateTime.Now;
        _context.BitacoraAcciones.Add(bitacoraAccion);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBitacoraAccion), new { id = bitacoraAccion.RegistroID }, bitacoraAccion);
    }

    // PUT: api/bitacoraacciones/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutBitacoraAccion(int id, BitacoraAccionesModel bitacoraAccion)
    {
        if (id != bitacoraAccion.RegistroID)
        {
            return BadRequest();
        }

        _context.Entry(bitacoraAccion).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!BitacoraAccionExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/bitacoraacciones/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBitacoraAccion(int id)
    {
        var bitacoraAccion = await _context.BitacoraAcciones.FindAsync(id);
        if (bitacoraAccion == null)
        {
            return NotFound();
        }

        _context.BitacoraAcciones.Remove(bitacoraAccion);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool BitacoraAccionExists(int id)
    {
        return _context.BitacoraAcciones.Any(e => e.RegistroID == id);
    }
}