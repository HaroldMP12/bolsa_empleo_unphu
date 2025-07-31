namespace BolsaEmpleoUnphu.API.DTOs;

public class NotificacionDto
{
    public int NotificacionID { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public DateTime FechaEnvio { get; set; }
    public bool Estado { get; set; }
    public string? ReferenciaTipo { get; set; }
}

public class CreateNotificacionDto
{
    public int UsuarioID { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public string? ReferenciaTipo { get; set; }
}