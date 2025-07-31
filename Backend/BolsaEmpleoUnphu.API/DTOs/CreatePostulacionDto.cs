using System.ComponentModel.DataAnnotations;

namespace BolsaEmpleoUnphu.API.DTOs;

public class CreatePostulacionDto
{
    [Required(ErrorMessage = "El ID de la vacante es requerido")]
    public int VacanteID { get; set; }
    
    [Required(ErrorMessage = "El ID del usuario es requerido")]
    public int UsuarioID { get; set; }
    
    [StringLength(500, MinimumLength = 10, ErrorMessage = "Las observaciones deben tener entre 10 y 500 caracteres")]
    public string? Observaciones { get; set; }
}