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

    public AuthController(BolsaEmpleoUnphuContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Correo == loginDto.Correo && u.Estado);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(loginDto.Contraseña, usuario.Contraseña))
        {
            return Unauthorized("Credenciales inválidas");
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
}