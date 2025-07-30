using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Empresas")]
public class EmpresasModel
{
    [Key]
    [Column("EmpresaID")]
    public int EmpresaID { get; set; }
    
    [Column("UsuarioID")]
    public int UsuarioID { get; set; }
    
    [Required]
    [StringLength(100)]
    [Column("NombreEmpresa")]
    public string NombreEmpresa { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    [Column("RNC")]
    public string RNC { get; set; } = string.Empty;
    
    [StringLength(50)]
    [Column("Sector")]
    public string? Sector { get; set; }
    
    [StringLength(20)]
    [Column("TelefonoEmpresa")]
    public string? TelefonoEmpresa { get; set; }
    
    [StringLength(255)]
    [Column("Direccion")]
    public string? Direccion { get; set; }
    
    [StringLength(150)]
    [Column("SitioWeb")]
    public string? SitioWeb { get; set; }
    
    [Column("Descripcion", TypeName = "NVARCHAR(MAX)")]
    public string? Descripcion { get; set; }
    
    [Column("Observaciones", TypeName = "NVARCHAR(MAX)")]
    public string? Observaciones { get; set; }
    
    [StringLength(300)]
    [Column("ImagenLogo")]
    public string? ImagenLogo { get; set; }
    
    [StringLength(300)]
    [Column("ImagenPortada")]
    public string? ImagenPortada { get; set; }
    
    [StringLength(100)]
    [Column("CantidadEmpleados")]
    public string? CantidadEmpleados { get; set; }
    
    // Navegación
    [ForeignKey("UsuarioID")]
    public virtual UsuariosModel Usuario { get; set; } = null!;
    
    public virtual ICollection<VacantesModel> Vacantes { get; set; } = new List<VacantesModel>();
}