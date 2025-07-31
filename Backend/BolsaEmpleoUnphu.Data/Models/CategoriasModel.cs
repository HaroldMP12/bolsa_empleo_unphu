using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Categorias")]
public class CategoriasModel
{
    [Key]
    [Column("CategoriaID")]
    public int CategoriaID { get; set; }
    
    [Required(ErrorMessage = "El nombre de la categoría es requerido")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
    [Column("NombreCategoria")]
    public string NombreCategoria { get; set; } = string.Empty;
    
    [Column("CategoriaPadreID")]
    public int? CategoriaPadreID { get; set; }
    
    // Navegación
    [ForeignKey("CategoriaPadreID")]
    public virtual CategoriasModel? CategoriaPadre { get; set; }
    
    public virtual ICollection<CategoriasModel> CategoriasHijas { get; set; } = new List<CategoriasModel>();
    public virtual ICollection<VacantesModel> Vacantes { get; set; } = new List<VacantesModel>();
}