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
    
    [Required(ErrorMessage = "El nombre de la empresa es requerido")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
    [Column("NombreEmpresa")]
    public string NombreEmpresa { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "El RNC es requerido")]
    [RegularExpression(@"^\d{3}-\d{5}-\d{1}$", ErrorMessage = "Formato de RNC inválido (000-00000-0)")]
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
    
    [StringLength(100)]
    [Column("PersonaContacto")]
    public string? PersonaContacto { get; set; }
    
    [StringLength(100)]
    [Column("CargoContacto")]
    public string? CargoContacto { get; set; }
    
    [StringLength(20)]
    [Column("TelefonoSecundario")]
    public string? TelefonoSecundario { get; set; }
    
    // Navegación
    [ForeignKey("UsuarioID")]
    public virtual UsuariosModel Usuario { get; set; } = null!;
    
    public virtual ICollection<VacantesModel> Vacantes { get; set; } = new List<VacantesModel>();
}