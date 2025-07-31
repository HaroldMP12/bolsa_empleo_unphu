namespace BolsaEmpleoUnphu.API.DTOs;

public class PostulacionResponseDto
{
    public int PostulacionID { get; set; }
    public DateTime FechaPostulacion { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
    
    // Datos de la vacante
    public int VacanteID { get; set; }
    public string TituloVacante { get; set; } = string.Empty;
    public string NombreEmpresa { get; set; } = string.Empty;
    public DateTime FechaCierreVacante { get; set; }
    
    // Datos del usuario (limitados)
    public int UsuarioID { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string CorreoUsuario { get; set; } = string.Empty;
}