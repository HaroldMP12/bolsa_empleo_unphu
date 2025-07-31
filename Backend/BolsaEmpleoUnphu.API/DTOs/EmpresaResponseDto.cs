namespace BolsaEmpleoUnphu.API.DTOs;

public class EmpresaResponseDto
{
    public int EmpresaID { get; set; }
    public string NombreEmpresa { get; set; } = string.Empty;
    public string? Sector { get; set; }
    public string? TelefonoEmpresa { get; set; }
    public string? Direccion { get; set; }
    public string? SitioWeb { get; set; }
    public string? Descripcion { get; set; }
    public string? ImagenLogo { get; set; }
    public string? ImagenPortada { get; set; }
    public string? CantidadEmpleados { get; set; }
    
    // Datos del usuario (sin datos sensibles)
    public string NombreContacto { get; set; } = string.Empty;
    public string CorreoContacto { get; set; } = string.Empty;
    public bool EmpresaActiva { get; set; }
    
    // Estadísticas
    public int TotalVacantesActivas { get; set; }
    // Sin RNC por seguridad (solo para admin)
}