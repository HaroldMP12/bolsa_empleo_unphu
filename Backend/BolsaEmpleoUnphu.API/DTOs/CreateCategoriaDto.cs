using System.ComponentModel.DataAnnotations;

namespace BolsaEmpleoUnphu.API.DTOs;

public class CreateCategoriaDto
{
    [Required(ErrorMessage = "El nombre de la categoría es requerido")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
    public string NombreCategoria { get; set; } = string.Empty;
    
    public int? CategoriaPadreID { get; set; }
}