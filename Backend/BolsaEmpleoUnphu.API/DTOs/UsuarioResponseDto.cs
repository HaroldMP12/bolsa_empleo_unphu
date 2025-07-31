namespace BolsaEmpleoUnphu.API.DTOs;

public class UsuarioResponseDto
{
    public int UsuarioID { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public DateTime FechaRegistro { get; set; }
    public bool Estado { get; set; }
    public int RolID { get; set; }
    public string NombreRol { get; set; } = string.Empty;
    public DateTime? FechaUltimaActualización { get; set; }
    // Sin Contraseña por seguridad
}