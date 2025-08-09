using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.DTOs;
using BolsaEmpleoUnphu.API.Services;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MensajesController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;
    private readonly INotificacionService _notificacionService;

    public MensajesController(BolsaEmpleoUnphuContext context, INotificacionService notificacionService)
    {
        _context = context;
        _notificacionService = notificacionService;
    }

    // GET: api/mensajes/conversaciones
    [HttpGet("conversaciones")]
    public async Task<ActionResult<IEnumerable<ConversacionResponseDto>>> GetConversaciones()
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var conversaciones = await _context.Conversaciones
            .Include(c => c.Empresa)
            .Include(c => c.Candidato)
            .Include(c => c.Vacante)
            .Include(c => c.Mensajes.OrderByDescending(m => m.FechaEnvio).Take(1))
            .Where(c => c.EmpresaID == usuarioId || c.CandidatoID == usuarioId)
            .OrderByDescending(c => c.UltimoMensaje ?? c.FechaCreacion)
            .ToListAsync();

        var result = conversaciones.Select(c => new ConversacionResponseDto
        {
            ConversacionID = c.ConversacionID,
            EmpresaID = c.EmpresaID,
            CandidatoID = c.CandidatoID,
            VacanteID = c.VacanteID,
            FechaCreacion = c.FechaCreacion,
            UltimoMensaje = c.UltimoMensaje,
            Estado = c.Estado,
            NombreEmpresa = c.Empresa.NombreCompleto,
            NombreCandidato = c.Candidato.NombreCompleto,
            TituloVacante = c.Vacante?.TituloVacante,
            MensajesNoLeidos = c.Mensajes.Count(m => m.ReceptorID == usuarioId && !m.Leido),
            UltimoMensajeObj = c.Mensajes.FirstOrDefault() != null ? new MensajeResponseDto
            {
                MensajeID = c.Mensajes.First().MensajeID,
                Contenido = c.Mensajes.First().Contenido,
                FechaEnvio = c.Mensajes.First().FechaEnvio,
                EmisorID = c.Mensajes.First().EmisorID,
                NombreEmisor = c.Mensajes.First().EmisorID == c.EmpresaID ? c.Empresa.NombreCompleto : c.Candidato.NombreCompleto
            } : null
        });

        return Ok(result);
    }

    // GET: api/mensajes/conversacion/{id}
    [HttpGet("conversacion/{id}")]
    public async Task<ActionResult<IEnumerable<MensajeResponseDto>>> GetMensajesConversacion(int id)
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var conversacion = await _context.Conversaciones
            .FirstOrDefaultAsync(c => c.ConversacionID == id && 
                                    (c.EmpresaID == usuarioId || c.CandidatoID == usuarioId));
        
        if (conversacion == null)
            return NotFound();

        var mensajes = await _context.Mensajes
            .Include(m => m.Emisor)
            .Include(m => m.Receptor)
            .Where(m => m.ConversacionID == id)
            .OrderBy(m => m.FechaEnvio)
            .ToListAsync();

        // Marcar mensajes como leídos
        var mensajesNoLeidos = mensajes.Where(m => m.ReceptorID == usuarioId && !m.Leido);
        foreach (var mensaje in mensajesNoLeidos)
        {
            mensaje.Leido = true;
        }
        await _context.SaveChangesAsync();

        var result = mensajes.Select(m => new MensajeResponseDto
        {
            MensajeID = m.MensajeID,
            ConversacionID = m.ConversacionID,
            EmisorID = m.EmisorID,
            ReceptorID = m.ReceptorID,
            Contenido = m.Contenido,
            FechaEnvio = m.FechaEnvio,
            Leido = m.Leido,
            TipoMensaje = m.TipoMensaje,
            NombreEmisor = m.Emisor.NombreCompleto,
            NombreReceptor = m.Receptor.NombreCompleto
        });

        return Ok(result);
    }

    // POST: api/mensajes
    [HttpPost]
    public async Task<ActionResult<MensajeResponseDto>> EnviarMensaje(CreateMensajeDto mensajeDto)
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        // Determinar quién es empresa y quién candidato
        var emisor = await _context.Usuarios.Include(u => u.Rol).FirstOrDefaultAsync(u => u.UsuarioID == usuarioId);
        var receptor = await _context.Usuarios.Include(u => u.Rol).FirstOrDefaultAsync(u => u.UsuarioID == mensajeDto.ReceptorID);
        
        if (emisor == null || receptor == null)
            return BadRequest("Usuario no encontrado");

        int empresaId, candidatoId;
        if (emisor.Rol.NombreRol == "Empresa")
        {
            empresaId = usuarioId;
            candidatoId = mensajeDto.ReceptorID;
        }
        else
        {
            empresaId = mensajeDto.ReceptorID;
            candidatoId = usuarioId;
        }

        // Buscar o crear conversación
        var conversacion = await _context.Conversaciones
            .FirstOrDefaultAsync(c => c.EmpresaID == empresaId && 
                                    c.CandidatoID == candidatoId && 
                                    c.VacanteID == mensajeDto.VacanteID);

        if (conversacion == null)
        {
            conversacion = new ConversacionesModel
            {
                EmpresaID = empresaId,
                CandidatoID = candidatoId,
                VacanteID = mensajeDto.VacanteID,
                FechaCreacion = DateTime.Now,
                Estado = "activa"
            };
            _context.Conversaciones.Add(conversacion);
            await _context.SaveChangesAsync();
        }

        // Crear mensaje
        var mensaje = new MensajesModel
        {
            ConversacionID = conversacion.ConversacionID,
            EmisorID = usuarioId,
            ReceptorID = mensajeDto.ReceptorID,
            Contenido = mensajeDto.Contenido,
            TipoMensaje = mensajeDto.TipoMensaje,
            FechaEnvio = DateTime.Now,
            Leido = false
        };

        _context.Mensajes.Add(mensaje);
        
        // Actualizar último mensaje de la conversación
        conversacion.UltimoMensaje = DateTime.Now;
        
        await _context.SaveChangesAsync();

        // Enviar notificación
        await _notificacionService.EnviarNotificacionAsync(
            mensajeDto.ReceptorID,
            $"Nuevo mensaje de {emisor.NombreCompleto}",
            "mensaje"
        );

        var result = new MensajeResponseDto
        {
            MensajeID = mensaje.MensajeID,
            ConversacionID = mensaje.ConversacionID,
            EmisorID = mensaje.EmisorID,
            ReceptorID = mensaje.ReceptorID,
            Contenido = mensaje.Contenido,
            FechaEnvio = mensaje.FechaEnvio,
            Leido = mensaje.Leido,
            TipoMensaje = mensaje.TipoMensaje,
            NombreEmisor = emisor.NombreCompleto,
            NombreReceptor = receptor.NombreCompleto
        };

        return CreatedAtAction(nameof(GetMensajesConversacion), new { id = conversacion.ConversacionID }, result);
    }

    // GET: api/mensajes/no-leidos
    [HttpGet("no-leidos")]
    public async Task<ActionResult<int>> GetMensajesNoLeidos()
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var count = await _context.Mensajes
            .CountAsync(m => m.ReceptorID == usuarioId && !m.Leido);
        
        return Ok(count);
    }
}