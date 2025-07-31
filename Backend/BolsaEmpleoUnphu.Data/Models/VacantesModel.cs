using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BolsaEmpleoUnphu.Data.Attributes;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Vacantes")]
public class VacantesModel
{
    [Key]
    [Column("VacanteID")]
    public int VacanteID { get; set; }
    
    [Column("EmpresaID")]
    public int EmpresaID { get; set; }
    
    [Required(ErrorMessage = "El título de la vacante es requerido")]
    [StringLength(100, MinimumLength = 5, ErrorMessage = "El título debe tener entre 5 y 100 caracteres")]
    [Column("TituloVacante")]
    public string TituloVacante { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "La descripción es requerida")]
    [StringLength(2000, MinimumLength = 20, ErrorMessage = "La descripción debe tener entre 20 y 2000 caracteres")]
    [Column("Descripcion", TypeName = "NVARCHAR(MAX)")]
    public string Descripcion { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Los requisitos son requeridos")]
    [StringLength(1500, MinimumLength = 10, ErrorMessage = "Los requisitos deben tener entre 10 y 1500 caracteres")]
    [Column("Requisitos", TypeName = "NVARCHAR(MAX)")]
    public string Requisitos { get; set; } = string.Empty;
    
    [Column("FechaPublicacion")]
    public DateTime FechaPublicacion { get; set; } = DateTime.Now;
    
    [Required(ErrorMessage = "La fecha de cierre es requerida")]
    [FutureDate(ErrorMessage = "La fecha de cierre debe ser futura")]
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
    
    [Range(1, 50, ErrorMessage = "La cantidad de vacantes debe estar entre 1 y 50")]
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