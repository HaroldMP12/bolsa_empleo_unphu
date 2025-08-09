namespace BolsaEmpleoUnphu.API.DTOs;

public class CreateMensajeDto
{
    public int ReceptorID { get; set; }
    public int? VacanteID { get; set; }
    public string Contenido { get; set; } = string.Empty;
    public string TipoMensaje { get; set; } = "texto";
}

public class MensajeResponseDto
{
    public int MensajeID { get; set; }
    public int ConversacionID { get; set; }
    public int EmisorID { get; set; }
    public int ReceptorID { get; set; }
    public string Contenido { get; set; } = string.Empty;
    public DateTime FechaEnvio { get; set; }
    public bool Leido { get; set; }
    public string TipoMensaje { get; set; } = string.Empty;
    public string NombreEmisor { get; set; } = string.Empty;
    public string NombreReceptor { get; set; } = string.Empty;
}

public class ConversacionResponseDto
{
    public int ConversacionID { get; set; }
    public int EmpresaID { get; set; }
    public int CandidatoID { get; set; }
    public int? VacanteID { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? UltimoMensaje { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string NombreEmpresa { get; set; } = string.Empty;
    public string NombreCandidato { get; set; } = string.Empty;
    public string? TituloVacante { get; set; }
    public int MensajesNoLeidos { get; set; }
    public MensajeResponseDto? UltimoMensajeObj { get; set; }
}