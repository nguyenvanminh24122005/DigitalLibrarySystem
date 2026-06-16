using CirculationService.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController(CirculationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var canConnect = await db.Database.CanConnectAsync(cancellationToken);
        return Ok(new
        {
            service = "circulation-service",
            database = canConnect ? "connected" : "disconnected",
            time = DateTime.UtcNow
        });
    }
}
