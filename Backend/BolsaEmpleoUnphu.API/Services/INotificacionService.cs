using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Services;

public interface INotificacionService
{
    Task EnviarNotificacionAsync(int usuarioId, string mensaje, string? referenciaTipo = null);
    Task EnviarNotificacionPostulacionAsync(int empresaId, string nombreUsuario, string tituloVacante);
    Task EnviarNotificacionVacanteAsync(int usuarioId, string tituloVacante, string nombreEmpresa);
    Task MarcarComoLeidaAsync(int notificacionId, int usuarioId);
}