using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BolsaEmpleoUnphu.Data.Context;
using BCrypt.Net;

namespace BolsaEmpleoUnphu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HashController : ControllerBase
{
    private readonly BolsaEmpleoUnphuContext _context;

    public HashController(BolsaEmpleoUnphuContext context)
    {
        _context = context;
    }

    [HttpPost("hash-passwords")]
    public async Task<IActionResult> HashPasswords()
    {
        var usuarios = await _context.Usuarios
            .Where(u => u.Contraseña == "hash123")
            .ToListAsync();

        foreach (var usuario in usuarios)
        {
            usuario.Contraseña = BCrypt.Net.BCrypt.HashPassword("hash123");
        }

        await _context.SaveChangesAsync();

        return Ok($"Se hashearon {usuarios.Count} contraseñas");
    }
}