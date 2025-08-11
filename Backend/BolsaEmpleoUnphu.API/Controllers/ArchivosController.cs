using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ArchivosController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly long _maxFileSize = 5 * 1024 * 1024; // 5MB
    private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
    private readonly string[] _allowedDocumentExtensions = { ".pdf", ".doc", ".docx" };

    public ArchivosController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    // POST: api/archivos/cv
    [HttpPost("cv")]
    public async Task<ActionResult<object>> UploadCV(IFormFile archivo)
    {
        if (archivo == null || archivo.Length == 0)
            return BadRequest("No se ha seleccionado ningún archivo");

        if (archivo.Length > _maxFileSize)
            return BadRequest("El archivo excede el tamaño máximo permitido (5MB)");

        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        if (!_allowedDocumentExtensions.Contains(extension))
            return BadRequest("Formato de archivo no permitido. Solo se permiten: PDF, DOC, DOCX");

        var usuarioId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", "cvs");
        
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        var fileName = $"cv_{usuarioId}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
        var filePath = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await archivo.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/cvs/{fileName}";
        
        return Ok(new { 
            mensaje = "CV subido exitosamente",
            url = fileUrl,
            nombreArchivo = fileName
        });
    }

    // POST: api/archivos/imagen-perfil
    [HttpPost("imagen-perfil")]
    public async Task<ActionResult<object>> UploadImagenPerfil(IFormFile imagen)
    {
        if (imagen == null || imagen.Length == 0)
            return BadRequest("No se ha seleccionado ninguna imagen");

        if (imagen.Length > _maxFileSize)
            return BadRequest("La imagen excede el tamaño máximo permitido (5MB)");

        var extension = Path.GetExtension(imagen.FileName).ToLowerInvariant();
        if (!_allowedImageExtensions.Contains(extension))
            return BadRequest("Formato de imagen no permitido. Solo se permiten: JPG, JPEG, PNG, GIF");

        var usuarioId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", "perfiles");
        
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        var fileName = $"perfil_{usuarioId}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
        var filePath = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await imagen.CopyToAsync(stream);
        }

        var imageUrl = $"/uploads/perfiles/{fileName}";
        
        return Ok(new { 
            mensaje = "Imagen de perfil subida exitosamente",
            url = imageUrl,
            nombreArchivo = fileName
        });
    }

    // POST: api/archivos/logo-empresa
    [HttpPost("logo-empresa")]
    [Authorize(Roles = "Empresa,Admin")]
    public async Task<ActionResult<object>> UploadLogoEmpresa(IFormFile logo)
    {
        if (logo == null || logo.Length == 0)
            return BadRequest("No se ha seleccionado ningún logo");

        if (logo.Length > _maxFileSize)
            return BadRequest("El logo excede el tamaño máximo permitido (5MB)");

        var extension = Path.GetExtension(logo.FileName).ToLowerInvariant();
        if (!_allowedImageExtensions.Contains(extension))
            return BadRequest("Formato de imagen no permitido. Solo se permiten: JPG, JPEG, PNG, GIF");

        var usuarioId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", "empresas");
        
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        var fileName = $"logo_{usuarioId}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
        var filePath = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await logo.CopyToAsync(stream);
        }

        var logoUrl = $"/uploads/empresas/{fileName}";
        
        return Ok(new { 
            mensaje = "Logo de empresa subido exitosamente",
            url = logoUrl,
            nombreArchivo = fileName
        });
    }

    // DELETE: api/archivos/{tipo}/{nombreArchivo}
    [HttpDelete("{tipo}/{nombreArchivo}")]
    public ActionResult EliminarArchivo(string tipo, string nombreArchivo)
    {
        var tiposPermitidos = new[] { "cvs", "perfiles", "empresas" };
        if (!tiposPermitidos.Contains(tipo))
            return BadRequest("Tipo de archivo no válido");

        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", tipo);
        var filePath = Path.Combine(uploadsPath, nombreArchivo);

        if (!System.IO.File.Exists(filePath))
            return NotFound("Archivo no encontrado");

        try
        {
            System.IO.File.Delete(filePath);
            return Ok(new { mensaje = "Archivo eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al eliminar el archivo: {ex.Message}");
        }
    }
}