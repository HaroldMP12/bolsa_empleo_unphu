using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmpresasController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public EmpresasController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/empresas
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmpresasModel>>> GetEmpresas()
    {
        return await _context.Empresas
            .Include(e => e.Usuario)
            .ToListAsync();
    }

    // GET: api/empresas/5
    [HttpGet("{id}")]
    public async Task<ActionResult<EmpresasModel>> GetEmpresa(int id)
    {
        var empresa = await _context.Empresas
            .Include(e => e.Usuario)
            .Include(e => e.Vacantes)
            .FirstOrDefaultAsync(e => e.EmpresaID == id);

        if (empresa == null)
        {
            return NotFound();
        }

        return empresa;
    }

    // POST: api/empresas
    [HttpPost]
    public async Task<ActionResult<EmpresasModel>> PostEmpresa(EmpresasModel empresa)
    {
        _context.Empresas.Add(empresa);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmpresa), new { id = empresa.EmpresaID }, empresa);
    }

    // PUT: api/empresas/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutEmpresa(int id, EmpresasModel empresa)
    {
        if (id != empresa.EmpresaID)
        {
            return BadRequest();
        }

        _context.Entry(empresa).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!EmpresaExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/empresas/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmpresa(int id)
    {
        var empresa = await _context.Empresas.FindAsync(id);
        if (empresa == null)
        {
            return NotFound();
        }

        _context.Empresas.Remove(empresa);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool EmpresaExists(int id)
    {
        return _context.Empresas.Any(e => e.EmpresaID == id);
    }
}