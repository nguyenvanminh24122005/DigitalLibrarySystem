using CirculationService.Api.Data;
using CirculationService.Api.DTOs;
using CirculationService.Api.Models;
using CirculationService.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Api.Controllers;

[ApiController]
[Route("api/fines")]
public class FinesController(CirculationDbContext db, FineService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Fine>>> GetAll(
        [FromQuery] int? readerId,
        [FromQuery] string? cardNumber,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var query = db.Fines.AsNoTracking().AsQueryable();

        if (readerId.HasValue)
            query = query.Where(x => x.ReaderId == readerId.Value);

        if (!string.IsNullOrWhiteSpace(cardNumber))
            query = query.Where(x => x.CardNumber == cardNumber);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var items = await query.OrderByDescending(x => x.UpdatedAt).ToListAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Fine>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await db.Fines.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet("reader/{readerId:int}")]
    public async Task<ActionResult<IEnumerable<Fine>>> GetByReader(int readerId, CancellationToken cancellationToken)
    {
        var items = await db.Fines
            .AsNoTracking()
            .Where(x => x.ReaderId == readerId)
            .OrderByDescending(x => x.UpdatedAt)
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [HttpGet("reader/{readerId:int}/debt")]
    public async Task<ActionResult<DebtSummaryResponse>> GetDebt(int readerId, CancellationToken cancellationToken)
    {
        return Ok(await service.GetDebtAsync(readerId, cancellationToken));
    }

    [HttpPost("{id:int}/pay")]
    public async Task<ActionResult<Fine>> Pay(int id, FinePaymentRequest request, CancellationToken cancellationToken)
    {
        var result = await service.PayAsync(id, request, cancellationToken);
        return Ok(result);
    }
}
