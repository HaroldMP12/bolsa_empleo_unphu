using System.ComponentModel.DataAnnotations;

namespace BolsaEmpleoUnphu.API.DTOs;

public class CreatePerfilDto
{
    [Required(ErrorMessage = "El ID del usuario es requerido")]
    public int UsuarioID { get; set; }
    
    [Required(ErrorMessage = "El tipo de perfil es requerido")]
    [RegularExpression("^(Estudiante|Egresado|Ambos)$", ErrorMessage = "Tipo de perfil inválido")]
    public string TipoPerfil { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? Matricula { get; set; }
    
    [Required(ErrorMessage = "El ID de la carrera es requerido")]
    public int CarreraID { get; set; }
    
    public int? Semestre { get; set; }
    
    public DateTime? FechaIngreso { get; set; }
    
    [StringLength(100)]
    public string? TituloObtenido { get; set; }
    
    public DateTime? FechaEgreso { get; set; }
    
    public int? AñoGraduacion { get; set; }
    
    [StringLength(300)]
    public string? UrlImagen { get; set; }
    
    public string? Resumen { get; set; }
    
    public string? RedesSociales { get; set; }
    
    public DateTime? FechaNacimiento { get; set; }
    
    [StringLength(255)]
    public string? Direccion { get; set; }
    
    public decimal? PromedioAcademico { get; set; }
    
    [StringLength(300)]
    public string? UrlCV { get; set; }
    
    public string? ExperienciaLaboral { get; set; }
    
    [StringLength(20)]
    public string? Telefono { get; set; }
}