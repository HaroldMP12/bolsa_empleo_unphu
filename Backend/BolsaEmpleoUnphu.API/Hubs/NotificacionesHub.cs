using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BolsaEmpleoUnphu.API.Hubs;

[Authorize]
public class NotificacionesHub : Hub
{
    public async Task JoinUserGroup()
    {
        var usuarioId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(usuarioId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{usuarioId}");
        }
    }

    public async Task LeaveUserGroup()
    {
        var usuarioId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(usuarioId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{usuarioId}");
        }
    }

    public override async Task OnConnectedAsync()
    {
        await JoinUserGroup();
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await LeaveUserGroup();
        await base.OnDisconnectedAsync(exception);
    }
}