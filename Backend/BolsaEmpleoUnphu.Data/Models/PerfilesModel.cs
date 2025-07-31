using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Perfiles")]
public class PerfilesModel
{
    [Key]
    [Column("PerfilID")]
    public int PerfilID { get; set; }
    
    [Column("UsuarioID")]
    public int UsuarioID { get; set; }
    
    [Required(ErrorMessage = "El tipo de perfil es requerido")]
    [RegularExpression("^(Estudiante|Egresado|Ambos)$", ErrorMessage = "Tipo de perfil inválido")]
    [Column("TipoPerfil")]
    public string TipoPerfil { get; set; } = string.Empty;
    
    [StringLength(20)]
    [Column("Matricula")]
    public string? Matricula { get; set; }
    
    [Column("CarreraID")]
    public int CarreraID { get; set; }
    
    [Column("Semestre")]
    public int? Semestre { get; set; }
    
    [Column("FechaIngreso")]
    public DateTime? FechaIngreso { get; set; }
    
    [StringLength(100)]
    [Column("TituloObtenido")]
    public string? TituloObtenido { get; set; }
    
    [Column("FechaEgreso")]
    public DateTime? FechaEgreso { get; set; }
    
    [Column("AñoGraduacion")]
    public int? AñoGraduacion { get; set; }
    
    [StringLength(300)]
    [Column("UrlImagen")]
    public string? UrlImagen { get; set; }
    
    [Column("Resumen", TypeName = "NVARCHAR(MAX)")]
    public string? Resumen { get; set; }
    
    [Column("RedesSociales", TypeName = "NVARCHAR(MAX)")]
    public string? RedesSociales { get; set; }
    
    // Navegación
    [ForeignKey("UsuarioID")]
    public virtual UsuariosModel Usuario { get; set; } = null!;
    
    [ForeignKey("CarreraID")]
    public virtual CarrerasModel Carrera { get; set; } = null!;
}