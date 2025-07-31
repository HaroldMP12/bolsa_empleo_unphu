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
[Authorize]
public class EmpresasController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public EmpresasController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/empresas
    [HttpGet]
    [Authorize(Roles = "Admin")]
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
    [Authorize(Roles = "Empresa,Admin")]
    public async Task<ActionResult<EmpresasModel>> PostEmpresa(CreateEmpresaDto empresaDto)
    {
        // Validación 11: RNC único por empresa
        var existeRNC = await _context.Empresas.AnyAsync(e => e.RNC == empresaDto.RNC);
        if (existeRNC)
            return BadRequest("Ya existe una empresa con este RNC");

        // Validación 12: Un usuario solo puede tener una empresa
        var existeEmpresa = await _context.Empresas.AnyAsync(e => e.UsuarioID == empresaDto.UsuarioID);
        if (existeEmpresa)
            return BadRequest("Este usuario ya tiene una empresa asociada");

        // Validación 13: Solo usuarios tipo "Empresa" pueden crear empresas (excepto Admin)
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin")
        {
            var usuario = await _context.Usuarios.Include(u => u.Rol).FirstOrDefaultAsync(u => u.UsuarioID == empresaDto.UsuarioID);
            if (usuario == null)
                return BadRequest("El usuario no existe");
                
            if (usuario.Rol.NombreRol != "Empresa")
                return BadRequest("Solo usuarios tipo Empresa pueden crear empresas");
        }
        // Crear el modelo desde el DTO
        var empresa = new EmpresasModel
        {
            UsuarioID = empresaDto.UsuarioID,
            NombreEmpresa = empresaDto.NombreEmpresa,
            RNC = empresaDto.RNC,
            Sector = empresaDto.Sector,
            TelefonoEmpresa = empresaDto.TelefonoEmpresa,
            Direccion = empresaDto.Direccion,
            SitioWeb = empresaDto.SitioWeb,
            Descripcion = empresaDto.Descripcion,
            Observaciones = empresaDto.Observaciones,
            ImagenLogo = empresaDto.ImagenLogo,
            ImagenPortada = empresaDto.ImagenPortada,
            CantidadEmpleados = empresaDto.CantidadEmpleados
        };

        _context.Empresas.Add(empresa);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmpresa), new { id = empresa.EmpresaID }, empresa);
    }

    // PUT: api/empresas/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutEmpresa(int id, UpdateEmpresaDto empresaDto)
    {
        if (id != empresaDto.EmpresaID)
        {
            return BadRequest();
        }

        // Buscar empresa existente
        var empresa = await _context.Empresas.FindAsync(id);
        if (empresa == null)
            return NotFound();

        // Actualizar propiedades desde el DTO
        empresa.UsuarioID = empresaDto.UsuarioID;
        empresa.NombreEmpresa = empresaDto.NombreEmpresa;
        empresa.RNC = empresaDto.RNC;
        empresa.Sector = empresaDto.Sector;
        empresa.TelefonoEmpresa = empresaDto.TelefonoEmpresa;
        empresa.Direccion = empresaDto.Direccion;
        empresa.SitioWeb = empresaDto.SitioWeb;
        empresa.Descripcion = empresaDto.Descripcion;
        empresa.Observaciones = empresaDto.Observaciones;
        empresa.ImagenLogo = empresaDto.ImagenLogo;
        empresa.ImagenPortada = empresaDto.ImagenPortada;
        empresa.CantidadEmpleados = empresaDto.CantidadEmpleados;

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