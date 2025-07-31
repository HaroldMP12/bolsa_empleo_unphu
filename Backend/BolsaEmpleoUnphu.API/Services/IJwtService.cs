using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Services;

public interface IJwtService
{
    string GenerateToken(UsuariosModel usuario);
}