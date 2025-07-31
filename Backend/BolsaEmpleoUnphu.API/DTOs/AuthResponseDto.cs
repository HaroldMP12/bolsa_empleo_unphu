namespace BolsaEmpleoUnphu.API.DTOs;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public int UsuarioID { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public DateTime Expiracion { get; set; }
}