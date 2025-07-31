using System.ComponentModel.DataAnnotations;

namespace BolsaEmpleoUnphu.API.DTOs;

public class CreateRolDto
{
    [Required(ErrorMessage = "El nombre del rol es requerido")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "El nombre del rol debe tener entre 3 y 50 caracteres")]
    public string NombreRol { get; set; } = string.Empty;
}