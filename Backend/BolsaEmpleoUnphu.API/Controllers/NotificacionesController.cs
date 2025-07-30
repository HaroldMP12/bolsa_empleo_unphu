using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificacionesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public NotificacionesController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    // GET: api/notificaciones
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificacionesModel>>> GetNotificaciones()
    {
        return await _context.Notificaciones
            .Include(n => n.Usuario)
            .ToListAsync();
    }

    // GET: api/notificaciones/5
    [HttpGet("{id}")]
    public async Task<ActionResult<NotificacionesModel>> GetNotificacion(int id)
    {
        var notificacion = await _context.Notificaciones
            .Include(n => n.Usuario)
            .FirstOrDefaultAsync(n => n.NotificacionID == id);

        if (notificacion == null)
        {
            return NotFound();
        }

        return notificacion;
    }

    // POST: api/notificaciones
    [HttpPost]
    public async Task<ActionResult<NotificacionesModel>> PostNotificacion(NotificacionesModel notificacion)
    {
        notificacion.FechaEnvio = DateTime.Now;
        _context.Notificaciones.Add(notificacion);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNotificacion), new { id = notificacion.NotificacionID }, notificacion);
    }

    // PUT: api/notificaciones/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutNotificacion(int id, NotificacionesModel notificacion)
    {
        if (id != notificacion.NotificacionID)
        {
            return BadRequest();
        }

        _context.Entry(notificacion).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!NotificacionExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/notificaciones/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotificacion(int id)
    {
        var notificacion = await _context.Notificaciones.FindAsync(id);
        if (notificacion == null)
        {
            return NotFound();
        }

        _context.Notificaciones.Remove(notificacion);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool NotificacionExists(int id)
    {
        return _context.Notificaciones.Any(e => e.NotificacionID == id);
    }
}