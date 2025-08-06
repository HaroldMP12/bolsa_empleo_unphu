using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Services;

public interface INotificacionService
{
    Task EnviarNotificacionAsync(int usuarioId, string mensaje, string? referenciaTipo = null);
    Task EnviarNotificacionPostulacionAsync(int usuarioEmpresaId, string nombreUsuario, string tituloVacante);
    Task EnviarNotificacionVacanteAsync(int usuarioId, string tituloVacante, string nombreEmpresa);
    Task EnviarNotificacionCambioEstadoAsync(int usuarioId, string tituloVacante, string nuevoEstado);
    Task EnviarNotificacionAprobacionEmpresaAsync(int usuarioId, string nombreEmpresa, bool aprobada);
    Task MarcarComoLeidaAsync(int notificacionId, int usuarioId);
}