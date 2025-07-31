using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.DTOs;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VacantesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public VacantesController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/vacantes
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<VacantesModel>>> GetVacantes()
    {
        return await _context.Vacantes
            .Include(v => v.Empresa)
            .Include(v => v.Categoria)
            .ToListAsync();
    }

    // GET: api/vacantes/5
    [HttpGet("{id}")]
    public async Task<ActionResult<VacantesModel>> GetVacante(int id)
    {
        var vacante = await _context.Vacantes
            .Include(v => v.Empresa)
            .Include(v => v.Categoria)
            .Include(v => v.Postulaciones)
            .Include(v => v.PreguntasVacantes)
            .FirstOrDefaultAsync(v => v.VacanteID == id);

        if (vacante == null)
        {
            return NotFound();
        }

        return vacante;
    }

    // POST: api/vacantes
    [HttpPost]
    [Authorize(Roles = "Empresa,Admin")]
    public async Task<ActionResult<VacantesModel>> PostVacante(CreateVacanteDto vacanteDto)
    {
        // Crear el modelo desde el DTO
        var vacante = new VacantesModel
        {
            EmpresaID = vacanteDto.EmpresaID,
            TituloVacante = vacanteDto.TituloVacante,
            Descripcion = vacanteDto.Descripcion,
            Requisitos = vacanteDto.Requisitos,
            FechaCierre = vacanteDto.FechaCierre,
            Ubicacion = vacanteDto.Ubicacion,
            TipoContrato = vacanteDto.TipoContrato,
            Jornada = vacanteDto.Jornada,
            Modalidad = vacanteDto.Modalidad,
            Salario = vacanteDto.Salario,
            CantidadVacantes = vacanteDto.CantidadVacantes,
            CategoriaID = vacanteDto.CategoriaID,
            FechaPublicacion = DateTime.Now
        };

        _context.Vacantes.Add(vacante);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVacante), new { id = vacante.VacanteID }, vacante);
    }

    // PUT: api/vacantes/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Empresa,Admin")]
    public async Task<IActionResult> PutVacante(int id, VacantesModel vacante)
    {
        if (id != vacante.VacanteID)
        {
            return BadRequest();
        }

        // Validación 3: Solo tu empresa puede editar sus vacantes (excepto Admin)
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin")
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var empresa = await _context.Empresas.FirstOrDefaultAsync(e => e.UsuarioID == usuarioId);
            
            if (empresa == null)
                return BadRequest("No tienes una empresa asociada");
                
            if (vacante.EmpresaID != empresa.EmpresaID)
                return Forbid("Solo puedes editar vacantes de tu empresa");
        }

        vacante.FechaModificacion = DateTime.Now;
        _context.Entry(vacante).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!VacanteExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/vacantes/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Empresa,Admin")]
    public async Task<IActionResult> DeleteVacante(int id)
    {
        var vacante = await _context.Vacantes.FindAsync(id);
        if (vacante == null)
        {
            return NotFound();
        }

        // Validación 3: Solo tu empresa puede eliminar sus vacantes (excepto Admin)
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin")
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var empresa = await _context.Empresas.FirstOrDefaultAsync(e => e.UsuarioID == usuarioId);
            
            if (empresa == null)
                return BadRequest("No tienes una empresa asociada");
                
            if (vacante.EmpresaID != empresa.EmpresaID)
                return Forbid("Solo puedes eliminar vacantes de tu empresa");
        }

        _context.Vacantes.Remove(vacante);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool VacanteExists(int id)
    {
        return _context.Vacantes.Any(e => e.VacanteID == id);
    }
}