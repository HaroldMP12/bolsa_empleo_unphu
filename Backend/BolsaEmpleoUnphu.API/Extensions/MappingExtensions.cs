using BolsaEmpleoUnphu.Data.Models;
using BolsaEmpleoUnphu.API.DTOs;

namespace BolsaEmpleoUnphu.API.Extensions;

public static class MappingExtensions
{
    public static UsuarioResponseDto ToResponseDto(this UsuariosModel usuario)
    {
        return new UsuarioResponseDto
        {
            UsuarioID = usuario.UsuarioID,
            NombreCompleto = usuario.NombreCompleto,
            Correo = usuario.Correo,
            Telefono = usuario.Telefono,
            FechaRegistro = usuario.FechaRegistro,
            Estado = usuario.Estado,
            RolID = usuario.RolID,
            NombreRol = usuario.Rol?.NombreRol ?? "",
            FechaUltimaActualización = usuario.FechaUltimaActualización
        };
    }

    public static VacanteResponseDto ToResponseDto(this VacantesModel vacante)
    {
        return new VacanteResponseDto
        {
            VacanteID = vacante.VacanteID,
            TituloVacante = vacante.TituloVacante,
            Descripcion = vacante.Descripcion,
            Requisitos = vacante.Requisitos,
            FechaPublicacion = vacante.FechaPublicacion,
            FechaCierre = vacante.FechaCierre,
            FechaModificacion = vacante.FechaModificacion,
            Ubicacion = vacante.Ubicacion,
            TipoContrato = vacante.TipoContrato,
            Jornada = vacante.Jornada,
            Modalidad = vacante.Modalidad,
            Salario = vacante.Salario,
            CantidadVacantes = vacante.CantidadVacantes,
            NombreEmpresa = vacante.Empresa?.NombreEmpresa ?? "",
            Rnc = vacante.Empresa?.RNC ?? "",
            SectorEmpresa = vacante.Empresa?.Sector,
            SitioWebEmpresa = vacante.Empresa?.SitioWeb,
            NombreCategoria = vacante.Categoria?.NombreCategoria ?? "",
            TotalPostulaciones = vacante.Postulaciones?.Count ?? 0,
            PreguntasVacantes = vacante.PreguntasVacantes?.Select(p => (object)new {
                PreguntaID = p.PreguntaID,
                Pregunta = p.Pregunta,
                Tipo = p.Tipo,
                Requerida = p.Requerida,
                Opciones = p.Opciones
            }).ToList() ?? new List<object>()
        };
    }

    public static EmpresaResponseDto ToResponseDto(this EmpresasModel empresa)
    {
        return new EmpresaResponseDto
        {
            EmpresaID = empresa.EmpresaID,
            NombreEmpresa = empresa.NombreEmpresa,
            Sector = empresa.Sector,
            TelefonoEmpresa = empresa.TelefonoEmpresa,
            Direccion = empresa.Direccion,
            SitioWeb = empresa.SitioWeb,
            Descripcion = empresa.Descripcion,
            ImagenLogo = empresa.ImagenLogo,
            ImagenPortada = empresa.ImagenPortada,
            CantidadEmpleados = empresa.CantidadEmpleados,
            NombreContacto = empresa.Usuario?.NombreCompleto ?? "",
            CorreoContacto = empresa.Usuario?.Correo ?? "",
            EmpresaActiva = empresa.Usuario?.Estado ?? false,
            TotalVacantesActivas = empresa.Vacantes?.Count(v => v.FechaCierre > DateTime.Now) ?? 0
        };
    }

    public static PostulacionResponseDto ToResponseDto(this PostulacionesModel postulacion)
    {
        return new PostulacionResponseDto
        {
            PostulacionID = postulacion.PostulacionID,
            FechaPostulacion = postulacion.FechaPostulacion,
            Estado = postulacion.Estado,
            Observaciones = postulacion.Observaciones,
            VacanteID = postulacion.VacanteID,
            TituloVacante = postulacion.Vacante?.TituloVacante ?? "",
            NombreEmpresa = postulacion.Vacante?.Empresa?.NombreEmpresa ?? "",
            FechaCierreVacante = postulacion.Vacante?.FechaCierre ?? DateTime.MinValue,
            UsuarioID = postulacion.UsuarioID,
            NombreCompleto = postulacion.Usuario?.NombreCompleto ?? "",
            CorreoUsuario = postulacion.Usuario?.Correo ?? ""
        };
    }
}