using Microsoft.EntityFrameworkCore;

namespace BolsaEmpleoUnphu.Data.Context
{
    public class BolsaEmpleoUnphuContext : DbContext
    {
        public BolsaEmpleoUnphuContext(DbContextOptions<BolsaEmpleoUnphuContext> options) : base(options)
        { 
        }
    }
}
