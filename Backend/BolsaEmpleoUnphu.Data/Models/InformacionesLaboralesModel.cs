using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("InformacionesLaborales")]
public class InformacionesLaboralesModel
{
    [Key]
    [Column("InfoLaboralID")]
    public int InfoLaboralID { get; set; }
    
    [Column("UsuarioID")]
    public int UsuarioID { get; set; }
    
    [Required]
    [StringLength(100)]
    [Column("Empresa")]
    public string Empresa { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    [Column("Cargo")]
    public string Cargo { get; set; } = string.Empty;
    
    [Column("FechaInicio")]
    public DateTime FechaInicio { get; set; }
    
    [Column("FechaFin")]
    public DateTime? FechaFin { get; set; }
    
    [Column("ActualmenteTrabajando")]
    public bool ActualmenteTrabajando { get; set; } = false;
    
    [StringLength(150)]
    [Column("Descripcion")]
    public string? Descripcion { get; set; }
    
    // Navegación
    [ForeignKey("UsuarioID")]
    public virtual UsuariosModel Usuario { get; set; } = null!;
}