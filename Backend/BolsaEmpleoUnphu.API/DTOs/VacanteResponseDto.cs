namespace BolsaEmpleoUnphu.API.DTOs;

public class VacanteResponseDto
{
    public int VacanteID { get; set; }
    public string TituloVacante { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Requisitos { get; set; } = string.Empty;
    public DateTime FechaPublicacion { get; set; }
    public DateTime FechaCierre { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? Ubicacion { get; set; }
    public string? TipoContrato { get; set; }
    public string? Jornada { get; set; }
    public string? Modalidad { get; set; }
    public decimal? Salario { get; set; }
    public int CantidadVacantes { get; set; }
    
    // Datos de la empresa (sin datos sensibles)
    public string NombreEmpresa { get; set; } = string.Empty;
    public string? Rnc { get; set; }
    public string? SectorEmpresa { get; set; }
    public string? SitioWebEmpresa { get; set; }
    
    // Datos de la categoría
    public string NombreCategoria { get; set; } = string.Empty;
    
    // Estadísticas
    public int TotalPostulaciones { get; set; }
    
    // Preguntas de la vacante
    public List<object> PreguntasVacantes { get; set; } = new List<object>();
}