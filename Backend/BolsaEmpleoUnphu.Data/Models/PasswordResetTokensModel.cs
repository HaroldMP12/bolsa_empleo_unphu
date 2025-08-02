using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("PasswordResetTokens")]
public class PasswordResetTokensModel
{
    [Key]
    public int TokenID { get; set; }
    
    [Required]
    public int UsuarioID { get; set; }
    
    [Required]
    [StringLength(255)]
    public string Token { get; set; } = string.Empty;
    
    [Required]
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    
    [Required]
    public DateTime FechaExpiracion { get; set; }
    
    public bool Usado { get; set; } = false;
    
    [ForeignKey("UsuarioID")]
    public virtual UsuariosModel Usuario { get; set; } = null!;
}