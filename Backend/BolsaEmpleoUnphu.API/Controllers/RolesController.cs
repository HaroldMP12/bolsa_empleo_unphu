using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public RolesController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/roles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RolesModel>>> GetRoles()
    {
        return await _context.Roles.ToListAsync();
    }

    // GET: api/roles/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RolesModel>> GetRol(int id)
    {
        var rol = await _context.Roles
            .Include(r => r.Usuarios)
            .FirstOrDefaultAsync(r => r.RolID == id);

        if (rol == null)
        {
            return NotFound();
        }

        return rol;
    }

    // POST: api/roles
    [HttpPost]
    public async Task<ActionResult<RolesModel>> PostRol(RolesModel rol)
    {
        _context.Roles.Add(rol);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRol), new { id = rol.RolID }, rol);
    }

    // PUT: api/roles/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutRol(int id, RolesModel rol)
    {
        if (id != rol.RolID)
        {
            return BadRequest();
        }

        _context.Entry(rol).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RolExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/roles/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRol(int id)
    {
        var rol = await _context.Roles.FindAsync(id);
        if (rol == null)
        {
            return NotFound();
        }

        _context.Roles.Remove(rol);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool RolExists(int id)
    {
        return _context.Roles.Any(e => e.RolID == id);
    }
}