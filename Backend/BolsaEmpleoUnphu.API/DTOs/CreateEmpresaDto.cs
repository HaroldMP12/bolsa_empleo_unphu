using System.ComponentModel.DataAnnotations;

namespace BolsaEmpleoUnphu.API.DTOs;

public class CreateEmpresaDto
{
    [Required(ErrorMessage = "El ID del usuario es requerido")]
    public int UsuarioID { get; set; }
    
    [Required(ErrorMessage = "El nombre de la empresa es requerido")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
    public string NombreEmpresa { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "El RNC es requerido")]
    [RegularExpression(@"^\d{3}-\d{5}-\d{1}$", ErrorMessage = "Formato de RNC inválido (000-00000-0)")]
    public string RNC { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? Sector { get; set; }
    
    [StringLength(20)]
    public string? TelefonoEmpresa { get; set; }
    
    [StringLength(255)]
    public string? Direccion { get; set; }
    
    [StringLength(150)]
    public string? SitioWeb { get; set; }
    
    public string? Descripcion { get; set; }
    
    public string? Observaciones { get; set; }
    
    [StringLength(300)]
    public string? ImagenLogo { get; set; }
    
    [StringLength(300)]
    public string? ImagenPortada { get; set; }
    
    [StringLength(100)]
    public string? CantidadEmpleados { get; set; }
    
    [StringLength(100)]
    public string? PersonaContacto { get; set; }
    
    [StringLength(100)]
    public string? CargoContacto { get; set; }
    
    [StringLength(20)]
    public string? TelefonoSecundario { get; set; }
}