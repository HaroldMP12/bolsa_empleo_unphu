using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BolsaEmpleoUnphu.Data.Models;

[Table("Usuarios")]
public class UsuariosModel
{
    [Key]
    [Column("UsuarioID")]
    public int UsuarioID { get; set; }
    
    [Required(ErrorMessage = "El nombre completo es requerido")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 150 caracteres")]
    [Column("NombreCompleto")]
    public string NombreCompleto { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "El correo es requerido")]
    [EmailAddress(ErrorMessage = "Formato de correo inválido")]
    [StringLength(100, ErrorMessage = "El correo no puede exceder 100 caracteres")]
    [Column("Correo")]
    public string Correo { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "La contraseña es requerida")]
    [StringLength(255, MinimumLength = 8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [Column("Contraseña")]
    public string Contraseña { get; set; } = string.Empty;
    
    [Phone(ErrorMessage = "Formato de teléfono inválido")]
    [StringLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
    [Column("Telefono")]
    public string? Telefono { get; set; }
    
    [Column("FechaRegistro")]
    public DateTime FechaRegistro { get; set; } = DateTime.Now;
    
    [Column("Estado")]
    public bool Estado { get; set; } = true;
    
    [Column("EstadoAprobacion")]
    public string EstadoAprobacion { get; set; } = "Pendiente"; // Pendiente, Aprobado, Rechazado
    
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