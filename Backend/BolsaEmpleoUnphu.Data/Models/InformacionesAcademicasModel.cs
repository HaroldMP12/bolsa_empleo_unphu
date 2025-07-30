using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("InformacionesAcademicas")]
public class InformacionesAcademicasModel
{
    [Key]
    [Column("InfoAcademicaID")]
    public int InfoAcademicaID { get; set; }
    
    [Column("UsuarioID")]
    public int UsuarioID { get; set; }
    
    [Required]
    [StringLength(100)]
    [Column("TituloObtenido")]
    public string TituloObtenido { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    [Column("Institucion")]
    public string Institucion { get; set; } = string.Empty;
    
    [Column("FechaInicio")]
    public DateTime FechaInicio { get; set; }
    
    [Column("FechaFin")]
    public DateTime FechaFin { get; set; }
    
    [Required]
    [StringLength(50)]
    [Column("NivelDeFormacion")]
    public string NivelDeFormacion { get; set; } = string.Empty;
    
    // Navegación
    [ForeignKey("UsuarioID")]
    public virtual UsuariosModel Usuario { get; set; } = null!;
}