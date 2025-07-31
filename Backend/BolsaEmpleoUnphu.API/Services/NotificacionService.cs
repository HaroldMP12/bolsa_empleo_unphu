using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.Hubs;

namespace BolsaEmpleoUnphu.API.Services;

public class NotificacionService : INotificacionService
{
    private readonly BolsaEmpleoUnphuContext _context;
    private readonly IHubContext<NotificacionesHub> _hubContext;

    public NotificacionService(BolsaEmpleoUnphuContext context, IHubContext<NotificacionesHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task EnviarNotificacionAsync(int usuarioId, string mensaje, string? referenciaTipo = null)
    {
        var notificacion = new NotificacionesModel
        {
            UsuarioID = usuarioId,
            Mensaje = mensaje,
            FechaEnvio = DateTime.Now,
            Estado = false,
            ReferenciaTipo = referenciaTipo
        };

        _context.Notificaciones.Add(notificacion);
        await _context.SaveChangesAsync();

        // Enviar notificación en tiempo real
        await _hubContext.Clients.Group($"User_{usuarioId}")
            .SendAsync("NuevaNotificacion", new
            {
                notificacion.NotificacionID,
                notificacion.Mensaje,
                notificacion.FechaEnvio,
                notificacion.ReferenciaTipo
            });
    }

    public async Task EnviarNotificacionPostulacionAsync(int empresaId, string nombreUsuario, string tituloVacante)
    {
        var empresa = await _context.Empresas.FirstOrDefaultAsync(e => e.EmpresaID == empresaId);
        if (empresa != null)
        {
            var mensaje = $"Nueva postulación de {nombreUsuario} para la vacante: {tituloVacante}";
            await EnviarNotificacionAsync(empresa.UsuarioID, mensaje, "Postulacion");
        }
    }

    public async Task EnviarNotificacionVacanteAsync(int usuarioId, string tituloVacante, string nombreEmpresa)
    {
        var mensaje = $"Nueva vacante disponible: {tituloVacante} en {nombreEmpresa}";
        await EnviarNotificacionAsync(usuarioId, mensaje, "Vacante");
    }

    public async Task MarcarComoLeidaAsync(int notificacionId, int usuarioId)
    {
        var notificacion = await _context.Notificaciones
            .FirstOrDefaultAsync(n => n.NotificacionID == notificacionId && n.UsuarioID == usuarioId);

        if (notificacion != null)
        {
            notificacion.Estado = true;
            await _context.SaveChangesAsync();
        }
    }
}