using Microsoft.EntityFrameworkCore;

namespace BolsaEmpleoUnphu.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Aquí puedes definir tus DbSets para las entidades de tu base de datos
        // Por ejemplo:
        // public DbSet<Usuario> Usuarios { get; set; }
        // public DbSet<Empresa> Empresas { get; set; }
    }
}