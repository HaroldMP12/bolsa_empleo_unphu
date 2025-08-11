using System.ComponentModel.DataAnnotations;
using BolsaEmpleoUnphu.Data.Attributes;

namespace BolsaEmpleoUnphu.API.DTOs;

public class UpdateVacanteDto
{
    [Required(ErrorMessage = "El ID de la vacante es requerido")]
    public int VacanteID { get; set; }
    
    [Required(ErrorMessage = "El ID de la empresa es requerido")]
    public int EmpresaID { get; set; }
    
    [Required(ErrorMessage = "El título de la vacante es requerido")]
    [StringLength(100, MinimumLength = 5, ErrorMessage = "El título debe tener entre 5 y 100 caracteres")]
    public string TituloVacante { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "La descripción es requerida")]
    [StringLength(2000, MinimumLength = 20, ErrorMessage = "La descripción debe tener entre 20 y 2000 caracteres")]
    public string Descripcion { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Los requisitos son requeridos")]
    [StringLength(1500, MinimumLength = 10, ErrorMessage = "Los requisitos deben tener entre 10 y 1500 caracteres")]
    public string Requisitos { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "La fecha de cierre es requerida")]
    [FutureDate(ErrorMessage = "La fecha de cierre debe ser futura")]
    public DateTime FechaCierre { get; set; }
    
    public string? Ubicacion { get; set; }
    public string? TipoContrato { get; set; }
    public string? Jornada { get; set; }
    public string? Modalidad { get; set; }
    public decimal? Salario { get; set; }
    
    [Range(1, 50, ErrorMessage = "La cantidad de vacantes debe estar entre 1 y 50")]
    public int CantidadVacantes { get; set; } = 1;
    
    [Required(ErrorMessage = "El ID de la categoría es requerido")]
    public int CategoriaID { get; set; }
    
    public List<PreguntaVacanteDto>? Preguntas { get; set; } = new List<PreguntaVacanteDto>();
}