using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Vacantes")]
public class VacantesModel
{
    [Key]
    [Column("VacanteID")]
    public int VacanteID { get; set; }
    
    [Column("EmpresaID")]
    public int EmpresaID { get; set; }
    
    [Required]
    [StringLength(100)]
    [Column("TituloVacante")]
    public string TituloVacante { get; set; } = string.Empty;
    
    [Required]
    [Column("Descripcion", TypeName = "NVARCHAR(MAX)")]
    public string Descripcion { get; set; } = string.Empty;
    
    [Required]
    [Column("Requisitos", TypeName = "NVARCHAR(MAX)")]
    public string Requisitos { get; set; } = string.Empty;
    
    [Column("FechaPublicacion")]
    public DateTime FechaPublicacion { get; set; } = DateTime.Now;
    
    [Column("FechaCierre")]
    public DateTime FechaCierre { get; set; }
    
    [Column("FechaModificacion")]
    public DateTime? FechaModificacion { get; set; }
    
    [StringLength(100)]
    [Column("Ubicacion")]
    public string? Ubicacion { get; set; }
    
    [StringLength(50)]
    [Column("TipoContrato")]
    public string? TipoContrato { get; set; }
    
    [StringLength(30)]
    [Column("Jornada")]
    public string? Jornada { get; set; }
    
    [StringLength(30)]
    [Column("Modalidad")]
    public string? Modalidad { get; set; }
    
    [Column("Salario", TypeName = "decimal(10,2)")]
    public decimal? Salario { get; set; }
    
    [Column("CantidadVacantes")]
    public int CantidadVacantes { get; set; } = 1;
    
    [Column("CategoriaID")]
    public int CategoriaID { get; set; }
    
    // Navegación
    [ForeignKey("EmpresaID")]
    public virtual EmpresasModel Empresa { get; set; } = null!;
    
    [ForeignKey("CategoriaID")]
    public virtual CategoriasModel Categoria { get; set; } = null!;
    
    public virtual ICollection<PostulacionesModel> Postulaciones { get; set; } = new List<PostulacionesModel>();
    public virtual ICollection<PreguntasVacantesModel> PreguntasVacantes { get; set; } = new List<PreguntasVacantesModel>();
}