using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("BitacoraAcciones")]
public class BitacoraAccionesModel
{
    [Key]
    [Column("RegistroID")]
    public int RegistroID { get; set; }
    
    [Column("UsuarioID")]
    public int UsuarioID { get; set; }
    
    [Required]
    [StringLength(100)]
    [Column("TipoAccion")]
    public string TipoAccion { get; set; } = string.Empty;
    
    [Required]
    [StringLength(150)]
    [Column("Descripcion")]
    public string Descripcion { get; set; } = string.Empty;
    
    [Column("FechaAccion")]
    public DateTime FechaAccion { get; set; } = DateTime.Now;
    
    [Required]
    [StringLength(50)]
    [Column("EntidadAfectada")]
    public string EntidadAfectada { get; set; } = string.Empty;
    
    // Navegación
    [ForeignKey("UsuarioID")]
    public virtual UsuariosModel Usuario { get; set; } = null!;
}