using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Usuarios")]
public class UsuariosModel
{
    [Key]
    [Column("UsuarioID")]
    public int UsuarioID { get; set; }
    
    [Required]
    [StringLength(150)]
    [Column("NombreCompleto")]
    public string NombreCompleto { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    [Column("Correo")]
    public string Correo { get; set; } = string.Empty;
    
    [Required]
    [StringLength(255)]
    [Column("Contraseña")]
    public string Contraseña { get; set; } = string.Empty;
    
    [StringLength(20)]
    [Column("Telefono")]
    public string? Telefono { get; set; }
    
    [Column("FechaRegistro")]
    public DateTime FechaRegistro { get; set; } = DateTime.Now;
    
    [Column("Estado")]
    public bool Estado { get; set; } = true;
    
    [Column("RolID")]
    public int RolID { get; set; }
    
    [Column("FechaCambioUltimaContraseña")]
    public DateTime? FechaCambioUltimaContraseña { get; set; }
    
    [Column("FechaUltimaActualización")]
    public DateTime? FechaUltimaActualización { get; set; }
    
    // Navegación
    [ForeignKey("RolID")]
    public virtual RolesModel Rol { get; set; } = null!;
    
    public virtual PerfilesModel? Perfil { get; set; }
    public virtual EmpresasModel? Empresa { get; set; }
    public virtual ICollection<BitacoraAccionesModel> BitacoraAcciones { get; set; } = new List<BitacoraAccionesModel>();
    public virtual ICollection<NotificacionesModel> Notificaciones { get; set; } = new List<NotificacionesModel>();
    public virtual ICollection<PostulacionesModel> Postulaciones { get; set; } = new List<PostulacionesModel>();
    public virtual ICollection<InformacionesAcademicasModel> InformacionesAcademicas { get; set; } = new List<InformacionesAcademicasModel>();
    public virtual ICollection<InformacionesLaboralesModel> InformacionesLaborales { get; set; } = new List<InformacionesLaboralesModel>();
}