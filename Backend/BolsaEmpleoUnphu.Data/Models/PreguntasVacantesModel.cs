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
    
    [Required]
    [StringLength(50)]
    [Column("Tipo")]
    public string Tipo { get; set; } = string.Empty;
    
    [Column("Requerida")]
    public bool Requerida { get; set; } = false;
    
    [Column("Opciones", TypeName = "NVARCHAR(MAX)")]
    public string? OpcionesJson { get; set; }
    
    [NotMapped]
    public List<string>? Opciones 
    {
        get => string.IsNullOrEmpty(OpcionesJson) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(OpcionesJson);
        set => OpcionesJson = value == null ? null : System.Text.Json.JsonSerializer.Serialize(value);
    }
    
    // Navegación
    [ForeignKey("VacanteID")]
    public virtual VacantesModel Vacante { get; set; } = null!;
    
    public virtual ICollection<RespuestasPostulacionesModel> RespuestasPostulaciones { get; set; } = new List<RespuestasPostulacionesModel>();
}