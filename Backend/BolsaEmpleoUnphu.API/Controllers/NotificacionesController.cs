using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.Services;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificacionesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;
    private readonly INotificacionService _notificacionService;

    public NotificacionesController(BolsaEmpleoUnphuContext context, INotificacionService notificacionService)
    {
        _context = context;
        _notificacionService = notificacionService;
    }

    // GET: api/notificaciones
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificacionesModel>>> GetNotificaciones()
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        return await _context.Notificaciones
            .Where(n => n.UsuarioID == usuarioId)
            .OrderByDescending(n => n.FechaEnvio)
            .ToListAsync();
    }

    // GET: api/notificaciones/no-leidas
    [HttpGet("no-leidas")]
    public async Task<ActionResult<IEnumerable<NotificacionesModel>>> GetNotificacionesNoLeidas()
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        return await _context.Notificaciones
            .Where(n => n.UsuarioID == usuarioId && !n.Estado)
            .OrderByDescending(n => n.FechaEnvio)
            .ToListAsync();
    }

    // GET: api/notificaciones/contador
    [HttpGet("contador")]
    public async Task<ActionResult<object>> GetContadorNoLeidas()
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var contador = await _context.Notificaciones
            .CountAsync(n => n.UsuarioID == usuarioId && !n.Estado);
            
        return new { noLeidas = contador };
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

    // PUT: api/notificaciones/{id}/marcar-leida
    [HttpPut("{id}/marcar-leida")]
    public async Task<IActionResult> MarcarComoLeida(int id)
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        await _notificacionService.MarcarComoLeidaAsync(id, usuarioId);
        return NoContent();
    }

    // PUT: api/notificaciones/marcar-todas-leidas
    [HttpPut("marcar-todas-leidas")]
    public async Task<IActionResult> MarcarTodasComoLeidas()
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var notificaciones = await _context.Notificaciones
            .Where(n => n.UsuarioID == usuarioId && !n.Estado)
            .ToListAsync();
            
        foreach (var notificacion in notificaciones)
        {
            notificacion.Estado = true;
        }
        
        await _context.SaveChangesAsync();
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

    // POST: api/notificaciones/test
    [HttpPost("test")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> TestNotification()
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        await _notificacionService.EnviarNotificacionAsync(usuarioId, "Esta es una notificación de prueba del sistema", "Test");
        return Ok(new { message = "Notificación de prueba enviada" });
    }

    private bool NotificacionExists(int id)
    {
        return _context.Notificaciones.Any(e => e.NotificacionID == id);
    }
}