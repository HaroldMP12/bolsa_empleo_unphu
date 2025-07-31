using System.ComponentModel.DataAnnotations;

namespace BolsaEmpleoUnphu.API.DTOs;

public class LoginDto
{
    [Required]
    [EmailAddress]
    public string Correo { get; set; } = string.Empty;

    [Required]
    public string Contraseña { get; set; } = string.Empty;
}