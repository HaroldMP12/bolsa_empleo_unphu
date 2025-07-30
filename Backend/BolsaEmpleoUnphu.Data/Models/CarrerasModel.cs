using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Carreras")]
public class CarrerasModel
{
    [Key]
    [Column("CarreraID")]
    public int CarreraID { get; set; }
    
    [Required]
    [StringLength(100)]
    [Column("NombreCarrera")]
    public string NombreCarrera { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    [Column("Facultad")]
    public string Facultad { get; set; } = string.Empty;
    
    // Navegación
    public virtual ICollection<PerfilesModel> Perfiles { get; set; } = new List<PerfilesModel>();
}