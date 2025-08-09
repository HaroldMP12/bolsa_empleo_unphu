using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Conversaciones")]
public class ConversacionesModel
{
    [Key]
    [Column("ConversacionID")]
    public int ConversacionID { get; set; }
    
    [Column("EmpresaID")]
    public int EmpresaID { get; set; }
    
    [Column("CandidatoID")]
    public int CandidatoID { get; set; }
    
    [Column("VacanteID")]
    public int? VacanteID { get; set; }
    
    [Column("FechaCreacion")]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
    
    [Column("UltimoMensaje")]
    public DateTime? UltimoMensaje { get; set; }
    
    [Column("Estado")]
    public string Estado { get; set; } = "activa"; // activa, archivada, bloqueada
    
    // Navegación
    [ForeignKey("EmpresaID")]
    public virtual UsuariosModel Empresa { get; set; } = null!;
    
    [ForeignKey("CandidatoID")]
    public virtual UsuariosModel Candidato { get; set; } = null!;
    
    [ForeignKey("VacanteID")]
    public virtual VacantesModel? Vacante { get; set; }
    
    public virtual ICollection<MensajesModel> Mensajes { get; set; } = new List<MensajesModel>();
}