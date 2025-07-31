using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public CategoriasController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/categorias
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<CategoriasModel>>> GetCategorias()
    {
        return await _context.Categorias
            .Include(c => c.CategoriaPadre)
            .ToListAsync();
    }

    // GET: api/categorias/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoriasModel>> GetCategoria(int id)
    {
        var categoria = await _context.Categorias
            .Include(c => c.CategoriaPadre)
            .Include(c => c.CategoriasHijas)
            .Include(c => c.Vacantes)
            .FirstOrDefaultAsync(c => c.CategoriaID == id);

        if (categoria == null)
        {
            return NotFound();
        }

        return categoria;
    }

    // POST: api/categorias
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CategoriasModel>> PostCategoria(CategoriasModel categoria)
    {
        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategoria), new { id = categoria.CategoriaID }, categoria);
    }

    // PUT: api/categorias/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCategoria(int id, CategoriasModel categoria)
    {
        if (id != categoria.CategoriaID)
        {
            return BadRequest();
        }

        _context.Entry(categoria).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CategoriaExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/categorias/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategoria(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
        {
            return NotFound();
        }

        _context.Categorias.Remove(categoria);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CategoriaExists(int id)
    {
        return _context.Categorias.Any(e => e.CategoriaID == id);
    }
}