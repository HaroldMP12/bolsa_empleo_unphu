using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.DTOs;
using BolsaEmpleoUnphu.API.Extensions;
using BolsaEmpleoUnphu.API.Services;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VacantesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;
    private readonly IRecomendacionService _recomendacionService;

    public VacantesController(BolsaEmpleoUnphuContext context, IRecomendacionService recomendacionService)
    {
        _context = context;
        _recomendacionService = recomendacionService;
    }

    // GET: api/vacantes
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<VacanteResponseDto>>> GetVacantes(
        int page = 1, 
        int pageSize = 10,
        int? categoriaId = null,
        string? ubicacion = null,
        string? search = null,
        decimal? salarioMin = null,
        decimal? salarioMax = null)
    {
        var query = _context.Vacantes
            .Include(v => v.Empresa)
            .Include(v => v.Categoria)
            .Include(v => v.PreguntasVacantes)
            .Where(v => v.FechaCierre > DateTime.Now) // Solo vacantes activas
            .AsQueryable();

        // Filtros
        if (categoriaId.HasValue)
            query = query.Where(v => v.CategoriaID == categoriaId.Value);
            
        if (!string.IsNullOrEmpty(ubicacion))
            query = query.Where(v => v.Ubicacion!.Contains(ubicacion));
            
        if (!string.IsNullOrEmpty(search))
            query = query.Where(v => v.TituloVacante.Contains(search) || 
                                   v.Descripcion.Contains(search) ||
                                   v.Empresa.NombreEmpresa.Contains(search));
                                   
        if (salarioMin.HasValue)
            query = query.Where(v => v.Salario >= salarioMin.Value);
            
        if (salarioMax.HasValue)
            query = query.Where(v => v.Salario <= salarioMax.Value);

        // Contar total
        var totalRecords = await query.CountAsync();

        // Paginación
        var vacantes = await query
            .OrderByDescending(v => v.FechaPublicacion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<VacanteResponseDto>
        {
            Data = vacantes.Select(v => v.ToResponseDto()),
            TotalRecords = totalRecords,
            Page = page,
            PageSize = pageSize
        };
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
        // Validación 7: Solo empresas activas pueden crear vacantes
        var empresa = await _context.Empresas.Include(e => e.Usuario).FirstOrDefaultAsync(e => e.EmpresaID == vacanteDto.EmpresaID);
        if (empresa == null)
            return BadRequest("La empresa no existe");
            
        if (!empresa.Usuario.Estado)
            return BadRequest("Solo empresas activas pueden crear vacantes");
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
        
        // Agregar preguntas si existen
        if (vacanteDto.Preguntas != null && vacanteDto.Preguntas.Any())
        {
            foreach (var preguntaDto in vacanteDto.Preguntas)
            {
                var pregunta = new PreguntasVacantesModel
                {
                    VacanteID = vacante.VacanteID,
                    Pregunta = preguntaDto.Pregunta,
                    Tipo = preguntaDto.Tipo,
                    Requerida = preguntaDto.Requerida,
                    Opciones = preguntaDto.Opciones
                };
                _context.PreguntasVacantes.Add(pregunta);
            }
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetVacante), new { id = vacante.VacanteID }, vacante);
    }

    // PUT: api/vacantes/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Empresa,Admin")]
    public async Task<IActionResult> PutVacante(int id, UpdateVacanteDto vacanteDto)
    {
        if (id != vacanteDto.VacanteID)
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
                
            if (vacanteDto.EmpresaID != empresa.EmpresaID)
                return StatusCode(403, "Solo puedes editar vacantes de tu empresa");
        }

        // Buscar la vacante existente
        var vacante = await _context.Vacantes.FindAsync(id);
        if (vacante == null)
            return NotFound();

        // Actualizar propiedades desde el DTO
        vacante.EmpresaID = vacanteDto.EmpresaID;
        vacante.TituloVacante = vacanteDto.TituloVacante;
        vacante.Descripcion = vacanteDto.Descripcion;
        vacante.Requisitos = vacanteDto.Requisitos;
        vacante.FechaCierre = vacanteDto.FechaCierre;
        vacante.Ubicacion = vacanteDto.Ubicacion;
        vacante.TipoContrato = vacanteDto.TipoContrato;
        vacante.Jornada = vacanteDto.Jornada;
        vacante.Modalidad = vacanteDto.Modalidad;
        vacante.Salario = vacanteDto.Salario;
        vacante.CantidadVacantes = vacanteDto.CantidadVacantes;
        vacante.CategoriaID = vacanteDto.CategoriaID;
        vacante.FechaModificacion = DateTime.Now;
        
        // Actualizar preguntas
        // Primero eliminar preguntas existentes
        var preguntasExistentes = await _context.PreguntasVacantes
            .Where(p => p.VacanteID == id)
            .ToListAsync();
        _context.PreguntasVacantes.RemoveRange(preguntasExistentes);
        
        // Agregar nuevas preguntas
        if (vacanteDto.Preguntas != null && vacanteDto.Preguntas.Any())
        {
            foreach (var preguntaDto in vacanteDto.Preguntas)
            {
                var pregunta = new PreguntasVacantesModel
                {
                    VacanteID = id,
                    Pregunta = preguntaDto.Pregunta,
                    Tipo = preguntaDto.Tipo,
                    Requerida = preguntaDto.Requerida,
                    Opciones = preguntaDto.Opciones
                };
                _context.PreguntasVacantes.Add(pregunta);
            }
        }

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
                return StatusCode(403, "Solo puedes eliminar vacantes de tu empresa");
        }

        try
        {
            // Usar transacción para asegurar consistencia
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // 1. Eliminar respuestas de postulaciones relacionadas con esta vacante
                await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM RespuestasPostulaciones WHERE PostulacionID IN (SELECT PostulacionID FROM Postulaciones WHERE VacanteID = {0})", id);

                // 2. Eliminar respuestas relacionadas con preguntas de esta vacante
                await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM RespuestasPostulaciones WHERE PreguntaID IN (SELECT PreguntaID FROM PreguntasVacantes WHERE VacanteID = {0})", id);

                // 3. Eliminar postulaciones
                await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM Postulaciones WHERE VacanteID = {0}", id);

                // 4. Eliminar preguntas de la vacante
                await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM PreguntasVacantes WHERE VacanteID = {0}", id);

                // 5. Eliminar la vacante
                await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM Vacantes WHERE VacanteID = {0}", id);

                await transaction.CommitAsync();
                return NoContent();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al eliminar la vacante: {ex.Message}");
        }
    }

    // GET: api/vacantes/activas
    [HttpGet("activas")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<VacanteResponseDto>>> GetVacantesActivas(
        int page = 1, 
        int pageSize = 10,
        int? categoriaId = null,
        string? ubicacion = null)
    {
        var query = _context.Vacantes
            .Include(v => v.Empresa)
            .Include(v => v.Categoria)
            .Include(v => v.PreguntasVacantes)
            .Where(v => v.FechaCierre > DateTime.Now)
            .AsQueryable();

        if (categoriaId.HasValue)
            query = query.Where(v => v.CategoriaID == categoriaId.Value);
            
        if (!string.IsNullOrEmpty(ubicacion))
            query = query.Where(v => v.Ubicacion!.Contains(ubicacion));

        var totalRecords = await query.CountAsync();
        var vacantes = await query
            .OrderByDescending(v => v.FechaPublicacion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<VacanteResponseDto>
        {
            Data = vacantes.Select(v => v.ToResponseDto()),
            TotalRecords = totalRecords,
            Page = page,
            PageSize = pageSize
        };
    }

    // GET: api/vacantes/empresa/{empresaId}
    [HttpGet("empresa/{empresaId}")]
    [Authorize(Roles = "Empresa,Admin")]
    public async Task<ActionResult<PagedResult<VacanteResponseDto>>> GetVacantesPorEmpresa(
        int empresaId,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Vacantes
            .Include(v => v.Empresa)
            .Include(v => v.Categoria)
            .Include(v => v.PreguntasVacantes)
            .Where(v => v.EmpresaID == empresaId)
            .AsQueryable();

        var totalRecords = await query.CountAsync();
        var vacantes = await query
            .OrderByDescending(v => v.FechaPublicacion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<VacanteResponseDto>
        {
            Data = vacantes.Select(v => v.ToResponseDto()),
            TotalRecords = totalRecords,
            Page = page,
            PageSize = pageSize
        };
    }

    // GET: api/vacantes/estadisticas
    [HttpGet("estadisticas")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> GetEstadisticasVacantes()
    {
        var totalVacantes = await _context.Vacantes.CountAsync();
        var vacantesActivas = await _context.Vacantes.CountAsync(v => v.FechaCierre > DateTime.Now);
        var vacantesVencidas = totalVacantes - vacantesActivas;
        var totalPostulaciones = await _context.Postulaciones.CountAsync();
        
        var vacantesPopulares = await _context.Vacantes
            .Include(v => v.Empresa)
            .Include(v => v.Postulaciones)
            .Where(v => v.FechaCierre > DateTime.Now)
            .OrderByDescending(v => v.Postulaciones.Count)
            .Take(5)
            .Select(v => new {
                v.VacanteID,
                v.TituloVacante,
                NombreEmpresa = v.Empresa.NombreEmpresa,
                TotalPostulaciones = v.Postulaciones.Count
            })
            .ToListAsync();

        return new {
            TotalVacantes = totalVacantes,
            VacantesActivas = vacantesActivas,
            VacantesVencidas = vacantesVencidas,
            TotalPostulaciones = totalPostulaciones,
            VacantesPopulares = vacantesPopulares
        };
    }

    // GET: api/vacantes/recomendadas
    [HttpGet("recomendadas")]
    [Authorize(Roles = "Estudiante,Egresado")]
    public async Task<ActionResult<IEnumerable<VacanteResponseDto>>> GetVacantesRecomendadas()
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var vacantesRecomendadas = await _recomendacionService.GetVacantesRecomendadasAsync(usuarioId);
        
        return Ok(vacantesRecomendadas.Select(v => v.ToResponseDto()));
    }



    private bool VacanteExists(int id)
    {
        return _context.Vacantes.Any(e => e.VacanteID == id);
    }
}