using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Mensajes")]
public class MensajesModel
{
    [Key]
    [Column("MensajeID")]
    public int MensajeID { get; set; }
    
    [Column("ConversacionID")]
    public int ConversacionID { get; set; }
    
    [Column("EmisorID")]
    public int EmisorID { get; set; }
    
    [Column("ReceptorID")]
    public int ReceptorID { get; set; }
    
    [Required]
    [Column("Contenido", TypeName = "NVARCHAR(MAX)")]
    public string Contenido { get; set; } = string.Empty;
    
    [Column("FechaEnvio")]
    public DateTime FechaEnvio { get; set; } = DateTime.Now;
    
    [Column("Leido")]
    public bool Leido { get; set; } = false;
    
    [Column("TipoMensaje")]
    public string TipoMensaje { get; set; } = "texto"; // texto, archivo, sistema
    
    // Navegación
    [ForeignKey("ConversacionID")]
    public virtual ConversacionesModel Conversacion { get; set; } = null!;
    
    [ForeignKey("EmisorID")]
    public virtual UsuariosModel Emisor { get; set; } = null!;
    
    [ForeignKey("ReceptorID")]
    public virtual UsuariosModel Receptor { get; set; } = null!;
}