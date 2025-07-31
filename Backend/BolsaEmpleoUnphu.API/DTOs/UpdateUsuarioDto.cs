using System.ComponentModel.DataAnnotations;

namespace BolsaEmpleoUnphu.API.DTOs;

public class UpdateUsuarioDto
{
    [Required(ErrorMessage = "El ID del usuario es requerido")]
    public int UsuarioID { get; set; }
    
    [Required(ErrorMessage = "El nombre completo es requerido")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 150 caracteres")]
    public string NombreCompleto { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "El correo es requerido")]
    [EmailAddress(ErrorMessage = "Formato de correo inválido")]
    [StringLength(100, ErrorMessage = "El correo no puede exceder 100 caracteres")]
    public string Correo { get; set; } = string.Empty;
    
    [Phone(ErrorMessage = "Formato de teléfono inválido")]
    [StringLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
    public string? Telefono { get; set; }
    
    public bool Estado { get; set; } = true;
    
    [Required(ErrorMessage = "El ID del rol es requerido")]
    public int RolID { get; set; }
}