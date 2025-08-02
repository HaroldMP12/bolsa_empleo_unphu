using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BolsaEmpleoUnphu.API.DTOs;
using BolsaEmpleoUnphu.API.Services;
using BCrypt.Net;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;
    private readonly IJwtService _jwtService;
    private readonly IEmailService _emailService;

    public AuthController(BolsaEmpleoUnphuContext context, IJwtService jwtService, IEmailService emailService)
    {
        _context = context;
        _jwtService = jwtService;
        _emailService = emailService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Correo == loginDto.Correo);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(loginDto.Contraseña, usuario.Contraseña))
        {
            return Unauthorized("Credenciales inválidas");
        }
        
        // Validar estado de aprobación para empresas
        if (usuario.RolID == 3 && usuario.EstadoAprobacion == "Pendiente")
        {
            return Unauthorized("Su cuenta está pendiente de aprobación por un administrador");
        }
        
        if (usuario.RolID == 3 && usuario.EstadoAprobacion == "Rechazado")
        {
            return Unauthorized("Su solicitud de cuenta ha sido rechazada");
        }
        
        if (!usuario.Estado)
        {
            return Unauthorized("Su cuenta está inactiva");
        }

        var token = _jwtService.GenerateToken(usuario);

        return Ok(new AuthResponseDto
        {
            Token = token,
            UsuarioID = usuario.UsuarioID,
            NombreCompleto = usuario.NombreCompleto,
            Correo = usuario.Correo,
            Rol = usuario.Rol.NombreRol,
            Expiracion = DateTime.UtcNow.AddHours(24)
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == forgotPasswordDto.Correo && u.Estado);

            if (usuario == null)
            {
                // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
                return Ok(new { message = "Si el correo existe, recibirás un enlace de recuperación" });
            }

            // Generar token de recuperación (válido por 1 hora)
            var resetToken = Guid.NewGuid().ToString();
            
            // Guardar el token en base de datos
            var passwordResetToken = new BolsaEmpleoUnphu.Data.Models.PasswordResetTokensModel
            {
                UsuarioID = usuario.UsuarioID,
                Token = resetToken,
                FechaExpiracion = DateTime.UtcNow.AddHours(1)
            };
            
            _context.PasswordResetTokens.Add(passwordResetToken);
            await _context.SaveChangesAsync();
            
            // SIMULACIÓN: Email enviado exitosamente
            Console.WriteLine($"[SIMULACIÓN] Email de recuperación enviado a: {usuario.Correo}");
            Console.WriteLine($"[SIMULACIÓN] Token generado: {resetToken}");
            
            return Ok(new { message = "Si el correo existe, recibirás un enlace de recuperación" });
        }
        catch (Exception ex)
        {
            // Log del error para debugging
            Console.WriteLine($"Error en forgot-password: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }
}