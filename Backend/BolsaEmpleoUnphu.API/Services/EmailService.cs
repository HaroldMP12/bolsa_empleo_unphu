using System.Net;
using System.Net.Mail;

namespace BolsaEmpleoUnphu.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetToken, string userName)
    {
        var smtpSettings = _configuration.GetSection("SmtpSettings");
        
        using var client = new SmtpClient(smtpSettings["Host"], int.Parse(smtpSettings["Port"]!))
        {
            Credentials = new NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
            EnableSsl = bool.Parse(smtpSettings["EnableSsl"]!),
            UseDefaultCredentials = false,
            DeliveryMethod = SmtpDeliveryMethod.Network
        };

        var resetUrl = $"{_configuration["FrontendUrl"]}/auth/reset-password?token={resetToken}";
        
        var mailMessage = new MailMessage
        {
            From = new MailAddress(smtpSettings["FromEmail"]!, "Bolsa de Empleo UNPHU"),
            Subject = "Recuperación de Contraseña - Bolsa de Empleo UNPHU",
            Body = CreateResetEmailBody(userName, resetUrl),
            IsBodyHtml = true
        };
        
        mailMessage.To.Add(email);
        
        await client.SendMailAsync(mailMessage);
    }

    private static string CreateResetEmailBody(string userName, string resetUrl)
    {
        return $@"
        <html>
        <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background: #0F385A; color: white; padding: 20px; text-align: center;'>
                <h1>Bolsa de Empleo UNPHU</h1>
                <p style='margin: 0; opacity: 0.9;'>Universidad Nacional Pedro Henríquez Ureña</p>
            </div>
            <div style='padding: 30px; background: #f8f9fa;'>
                <h2 style='color: #0F385A;'>Estimado/a {userName},</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en la Bolsa de Empleo UNPHU.</p>
                <p>Para continuar con el proceso, haz clic en el siguiente botón:</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{resetUrl}' style='background: #439441; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;'>
                        RESTABLECER CONTRASEÑA
                    </a>
                </div>
                <p style='color: #666; font-size: 14px; line-height: 1.5;'>
                    <strong>Importante:</strong><br>
                    • Este enlace es válido por 1 hora únicamente<br>
                    • Si no solicitaste este cambio, ignora este mensaje<br>
                    • Tu cuenta permanecerá segura
                </p>
                <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
                <p style='color: #888; font-size: 12px;'>
                    Este es un mensaje automático, por favor no respondas a este correo.<br>
                    Para soporte, contacta: <strong>soporte.bolsaempleo@unphu.edu.do</strong>
                </p>
            </div>
            <div style='background: #0F385A; color: white; padding: 15px; text-align: center; font-size: 12px;'>
                © 2024 Universidad Nacional Pedro Henríquez Ureña (UNPHU)<br>
                Bolsa de Empleo - Conectando talento con oportunidades
            </div>
        </body>
        </html>";
    }
}