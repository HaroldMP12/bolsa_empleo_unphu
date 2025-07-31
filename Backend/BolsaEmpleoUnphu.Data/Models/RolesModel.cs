using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Roles")]
public class RolesModel
{
    [Key]
    [Column("RolID")]
    public int RolID { get; set; }
    
    [Required(ErrorMessage = "El nombre del rol es requerido")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "El nombre del rol debe tener entre 3 y 50 caracteres")]
    [Column("NombreRol")]
    public string NombreRol { get; set; } = string.Empty;
    
    // Navegación
    public virtual ICollection<UsuariosModel> Usuarios { get; set; } = new List<UsuariosModel>();
}