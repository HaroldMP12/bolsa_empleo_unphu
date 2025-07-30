using BolsaEmpleoUnphu.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace BolsaEmpleoUnphu.Data.Context;

public class BolsaEmpleoUnphuContext : DbContext
{
    public BolsaEmpleoUnphuContext(DbContextOptions<BolsaEmpleoUnphuContext> options) : base(options)
    {
    }

    public DbSet<BitacoraAccionesModel> BitacoraAcciones { get; set; }
    public DbSet<CarrerasModel> Carreras { get; set; }
    public DbSet<CategoriasModel> Categorias { get; set; }
    public DbSet<EmpresasModel> Empresas { get; set; }
    public DbSet<InformacionesAcademicasModel> InformacionesAcademicas { get; set; }
    public DbSet<InformacionesLaboralesModel> InformacionesLaborales { get; set; }
    public DbSet<NotificacionesModel> Notificaciones { get; set; }
    public DbSet<PerfilesModel> Perfiles { get; set; }
    public DbSet<PostulacionesModel> Postulaciones { get; set; }
    public DbSet<PreguntasVacantesModel> PreguntasVacantes { get; set; }
    public DbSet<RespuestasPostulacionesModel> RespuestasPostulaciones { get; set; }
    public DbSet<RolesModel> Roles { get; set; }
    public DbSet<UsuariosModel> Usuarios { get; set; }
    public DbSet<VacantesModel> Vacantes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de relaciones y restricciones adicionales
        
        // Configurar la auto-relación de Categorias
        modelBuilder.Entity<CategoriasModel>()
            .HasOne(c => c.CategoriaPadre)
            .WithMany(c => c.CategoriasHijas)
            .HasForeignKey(c => c.CategoriaPadreID)
            .OnDelete(DeleteBehavior.Restrict);

        // Configurar índices únicos
        modelBuilder.Entity<UsuariosModel>()
            .HasIndex(u => u.Correo)
            .IsUnique();

        modelBuilder.Entity<EmpresasModel>()
            .HasIndex(e => e.RNC)
            .IsUnique();

        // Configurar restricciones CHECK (si es necesario)
        modelBuilder.Entity<PerfilesModel>()
            .Property(p => p.TipoPerfil)
            .HasComment("Valores permitidos: 'Estudiante', 'Egresado', 'Ambos'");
    }
}