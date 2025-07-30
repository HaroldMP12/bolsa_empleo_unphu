<<<<<<< HEAD
=======
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.API.Data;

>>>>>>> 1a352a765b8f980ef9b45124402f2cc0176a9e2f
namespace BolsaEmpleoUnphu.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
<<<<<<< HEAD
=======

            // Configuración de la conexión a la base de datos
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
>>>>>>> 1a352a765b8f980ef9b45124402f2cc0176a9e2f
                
            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
