using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("PreguntasVacantes")]
public class PreguntasVacantesModel
{
    [Key]
    [Column("PreguntaID")]
    public int PreguntaID { get; set; }
    
    [Column("VacanteID")]
    public int VacanteID { get; set; }
    
    [Required]
    [StringLength(255)]
    [Column("Pregunta", TypeName = "NVARCHAR(255)")]
    public string Pregunta { get; set; } = string.Empty;
    
    // Navegación
    [ForeignKey("VacanteID")]
    public virtual VacantesModel Vacante { get; set; } = null!;
    
    public virtual ICollection<RespuestasPostulacionesModel> RespuestasPostulaciones { get; set; } = new List<RespuestasPostulacionesModel>();
}