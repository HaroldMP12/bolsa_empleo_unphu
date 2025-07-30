using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Notificaciones")]
public class NotificacionesModel
{
    [Key]
    [Column("NotificacionID")]
    public int NotificacionID { get; set; }
    
    [Column("UsuarioID")]
    public int UsuarioID { get; set; }
    
    [Required]
    [Column("Mensaje", TypeName = "NVARCHAR(MAX)")]
    public string Mensaje { get; set; } = string.Empty;
    
    [Column("FechaEnvio")]
    public DateTime FechaEnvio { get; set; } = DateTime.Now;
    
    [Column("Estado")]
    public bool Estado { get; set; } = false;
    
    [StringLength(50)]
    [Column("ReferenciaTipo")]
    public string? ReferenciaTipo { get; set; }
    
    // Navegación
    [ForeignKey("UsuarioID")]
    public virtual UsuariosModel Usuario { get; set; } = null!;
}