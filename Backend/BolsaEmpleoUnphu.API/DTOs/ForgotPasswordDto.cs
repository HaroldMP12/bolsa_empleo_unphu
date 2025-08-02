using System.ComponentModel.DataAnnotations;

namespace BolsaEmpleoUnphu.API.DTOs;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Correo { get; set; } = string.Empty;
}