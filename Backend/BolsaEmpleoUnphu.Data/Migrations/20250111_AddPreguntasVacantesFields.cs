using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BolsaEmpleoUnphu.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPreguntasVacantesFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Tipo",
                table: "PreguntasVacantes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "texto");

            migrationBuilder.AddColumn<bool>(
                name: "Requerida",
                table: "PreguntasVacantes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Opciones",
                table: "PreguntasVacantes",
                type: "NVARCHAR(MAX)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "PreguntasVacantes");

            migrationBuilder.DropColumn(
                name: "Requerida",
                table: "PreguntasVacantes");

            migrationBuilder.DropColumn(
                name: "Opciones",
                table: "PreguntasVacantes");
        }
    }
}