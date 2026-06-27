using CatalogService.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/catalog-events")]
[Authorize]
public sealed class EventsController(CatalogDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEvents([FromQuery] DateTime? since, [FromQuery] string? eventType, [FromQuery] int take = 100)
    {
        var query = db.CatalogEvents.AsQueryable();
        if (since.HasValue) query = query.Where(x => x.CreatedAt > since.Value);
        if (!string.IsNullOrWhiteSpace(eventType)) query = query.Where(x => x.EventType == eventType);
        take = Math.Clamp(take, 1, 500);
        return Ok(await query.OrderByDescending(x => x.CreatedAt).Take(take).ToListAsync());
    }
}
