using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Roles")]
public class RolesModel
{
    [Key]
    [Column("RolID")]
    public int RolID { get; set; }
    
    [Required]
    [StringLength(50)]
    [Column("NombreRol")]
    public string NombreRol { get; set; } = string.Empty;
    
    // Navegación
    public virtual ICollection<UsuariosModel> Usuarios { get; set; } = new List<UsuariosModel>();
}