using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.Data.Models;

namespace BolsaEmpleoUnphu.API.Services;

public class RecomendacionService : IRecomendacionService
{
    private readonly BolsaEmpleoUnphuContext _context;
    
    // Mapeo de carreras a categorías relevantes
    private readonly Dictionary<string, int[]> _carreraCategoriaMap = new()
    {
        // Tecnología
        { "Ingeniería en Sistemas", new[] { 1, 6, 7 } }, // Tecnología, Desarrollo, Soporte
        { "Ingeniería Civil", new[] { 1 } }, // Tecnología
        
        // Salud
        { "Medicina", new[] { 2, 8, 9 } }, // Salud, Enfermería, Medicina
        { "Enfermería", new[] { 2, 8 } }, // Salud, Enfermería
        
        // Administración/Finanzas
        { "Administración de Empresas", new[] { 4, 5 } }, // Finanzas, Marketing
        { "Contabilidad", new[] { 4 } }, // Finanzas
        
        // Humanidades
        { "Derecho", new[] { 4 } }, // Finanzas (legal)
        { "Psicología", new[] { 2, 3 } }, // Salud, Educación
        { "Comunicación Social", new[] { 5 } }, // Marketing
        { "Arquitectura", new[] { 1 } } // Tecnología
    };

    public RecomendacionService(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<VacantesModel>> GetVacantesRecomendadasAsync(int usuarioId)
    {
        // Obtener perfil del usuario
        var perfil = await _context.Perfiles
            .Include(p => p.Carrera)
            .FirstOrDefaultAsync(p => p.UsuarioID == usuarioId);

        if (perfil?.Carrera == null)
        {
            return new List<VacantesModel>();
        }

        // Obtener categorías recomendadas
        var categoriasRecomendadas = await GetCategoriasRecomendadasAsync(perfil.CarreraID);

        // Obtener vacantes activas de las categorías recomendadas
        var vacantesRecomendadas = await _context.Vacantes
            .Include(v => v.Empresa)
            .Include(v => v.Categoria)
            .Where(v => categoriasRecomendadas.Contains(v.CategoriaID) && 
                       v.FechaCierre > DateTime.Now && v.Estado)
            .OrderByDescending(v => v.FechaPublicacion)
            .Take(10)
            .ToListAsync();

        return vacantesRecomendadas;
    }

    public async Task<IEnumerable<int>> GetCategoriasRecomendadasAsync(int carreraId)
    {
        var carrera = await _context.Carreras.FindAsync(carreraId);
        
        if (carrera == null || !_carreraCategoriaMap.ContainsKey(carrera.NombreCarrera))
        {
            return new List<int>();
        }

        return _carreraCategoriaMap[carrera.NombreCarrera];
    }
}