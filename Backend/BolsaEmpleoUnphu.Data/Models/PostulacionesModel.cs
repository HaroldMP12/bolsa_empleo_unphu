using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Postulaciones")]
public class PostulacionesModel
{
    [Key]
    [Column("PostulacionID")]
    public int PostulacionID { get; set; }
    
    [Column("VacanteID")]
    public int VacanteID { get; set; }
    
    [Column("UsuarioID")]
    public int UsuarioID { get; set; }
    
    [Column("FechaPostulacion")]
    public DateTime FechaPostulacion { get; set; } = DateTime.Now;
    
    [Required(ErrorMessage = "El estado es requerido")]
    [RegularExpression("^(Pendiente|En Revisión|Aceptado|Rechazado)$", ErrorMessage = "Estado inválido")]
    [Column("Estado")]
    public string Estado { get; set; } = "Pendiente";
    
    [StringLength(500, MinimumLength = 10, ErrorMessage = "Las observaciones deben tener entre 10 y 500 caracteres")]
    [Column("Observaciones", TypeName = "NVARCHAR(MAX)")]
    public string? Observaciones { get; set; }
    
    // Navegación
    [ForeignKey("VacanteID")]
    public virtual VacantesModel Vacante { get; set; } = null!;
    
    [ForeignKey("UsuarioID")]
    public virtual UsuariosModel Usuario { get; set; } = null!;
    
    public virtual ICollection<RespuestasPostulacionesModel> RespuestasPostulaciones { get; set; } = new List<RespuestasPostulacionesModel>();
}