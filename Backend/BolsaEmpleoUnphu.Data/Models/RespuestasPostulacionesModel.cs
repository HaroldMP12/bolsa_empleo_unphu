using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("RespuestasPostulaciones")]
public class RespuestasPostulacionesModel
{
    [Key]
    [Column("RespuestaID")]
    public int RespuestaID { get; set; }
    
    [Column("PostulacionID")]
    public int PostulacionID { get; set; }
    
    [Column("PreguntaID")]
    public int PreguntaID { get; set; }
    
    [Required]
    [Column("Respuesta", TypeName = "NVARCHAR(MAX)")]
    public string Respuesta { get; set; } = string.Empty;
    
    // Navegación
    [ForeignKey("PostulacionID")]
    public virtual PostulacionesModel Postulacion { get; set; } = null!;
    
    [ForeignKey("PreguntaID")]
    public virtual PreguntasVacantesModel Pregunta { get; set; } = null!;
}