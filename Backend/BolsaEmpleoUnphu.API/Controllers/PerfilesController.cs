using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<ActionResult<PerfilesModel>> PostPerfil(PerfilesModel perfil)
    {
        _context.Perfiles.Add(perfil);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPerfil), new { id = perfil.PerfilID }, perfil);
    }

    // PUT: api/perfiles/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPerfil(int id, PerfilesModel perfil)
    {
        if (id != perfil.PerfilID)
        {
            return BadRequest();
        }

        _context.Entry(perfil).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PerfilExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
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