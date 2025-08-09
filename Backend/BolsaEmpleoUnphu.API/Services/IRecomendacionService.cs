using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Services;

public interface IRecomendacionService
{
    Task<IEnumerable<VacantesModel>> GetVacantesRecomendadasAsync(int usuarioId);
    Task<IEnumerable<int>> GetCategoriasRecomendadasAsync(int carreraId);
}