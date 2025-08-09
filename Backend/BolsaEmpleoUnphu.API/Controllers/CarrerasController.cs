using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarrerasController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public CarrerasController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/carreras
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CarrerasModel>>> GetCarreras()
    {
        return await _context.Carreras
            .Include(c => c.Perfiles)
            .ToListAsync();
    }

    // GET: api/carreras/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CarrerasModel>> GetCarrera(int id)
    {
        var carrera = await _context.Carreras
            .Include(c => c.Perfiles)
            .FirstOrDefaultAsync(c => c.CarreraID == id);

        if (carrera == null)
        {
            return NotFound();
        }

        return carrera;
    }

    // POST: api/carreras
    [HttpPost]
    public async Task<ActionResult<CarrerasModel>> PostCarrera(CarrerasModel carrera)
    {
        _context.Carreras.Add(carrera);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCarrera), new { id = carrera.CarreraID }, carrera);
    }

    // PUT: api/carreras/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCarrera(int id, CarrerasModel carrera)
    {
        if (id != carrera.CarreraID)
        {
            return BadRequest();
        }

        _context.Entry(carrera).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CarreraExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/carreras/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCarrera(int id)
    {
        var carrera = await _context.Carreras.FindAsync(id);
        if (carrera == null)
        {
            return NotFound();
        }

        _context.Carreras.Remove(carrera);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CarreraExists(int id)
    {
        return _context.Carreras.Any(e => e.CarreraID == id);
    }
}