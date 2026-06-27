using IdentityReportService.Common;
using IdentityReportService.Data;
using IdentityReportService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Controllers;

[ApiController]
[Route("api/system-logs")]
[Authorize(Roles = AppRoles.AdminOrReporter)]
public sealed class SystemLogsController(IdentityReportDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetLogs([FromQuery] string? q, [FromQuery] string? actor, [FromQuery] string? action, [FromQuery] string? module, [FromQuery] LogResult? result)
    {
        var query = db.SystemLogs.AsQueryable();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var keyword = q.Trim();
            query = query.Where(x => x.Description.Contains(keyword) || x.TargetType.Contains(keyword) || x.Action.Contains(keyword));
        }
        if (!string.IsNullOrWhiteSpace(actor)) query = query.Where(x => x.ActorName.Contains(actor));
        if (!string.IsNullOrWhiteSpace(action)) query = query.Where(x => x.Action == action);
        if (!string.IsNullOrWhiteSpace(module)) query = query.Where(x => x.Module == module);
        if (result.HasValue) query = query.Where(x => x.Result == result);
        return Ok(await query.OrderByDescending(x => x.CreatedAt).Take(200).ToListAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetLog(Guid id)
    {
        var log = await db.SystemLogs.FindAsync(id);
        return log is null ? NotFound() : Ok(log);
    }
}
