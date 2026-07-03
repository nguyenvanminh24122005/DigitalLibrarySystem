using CirculationService.Api.Data;
using CirculationService.Api.DTOs;
using CirculationService.Api.Models;
using CirculationService.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Api.Controllers;

[ApiController]
[Route("api/borrow-records")]
public class BorrowRecordsController(CirculationDbContext db, BorrowRecordService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BorrowRecordResponse>>> GetAll(
        [FromQuery] int? readerId,
        [FromQuery] string? cardNumber,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var query = db.BorrowRecords.AsNoTracking().AsQueryable();

        if (readerId.HasValue)
            query = query.Where(x => x.ReaderId == readerId.Value);

        if (!string.IsNullOrWhiteSpace(cardNumber))
            query = query.Where(x => x.CardNumber == cardNumber);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var policy = await service.GetCurrentPolicyAsync(cancellationToken);
        var items = await query.OrderByDescending(x => x.Id).ToListAsync(cancellationToken);

        return Ok(items.Select(x => service.ToResponse(x, policy.FinePerDay)));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BorrowRecordResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var record = await db.BorrowRecords.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (record is null)
            return NotFound();

        var policy = await service.GetCurrentPolicyAsync(cancellationToken);
        return Ok(service.ToResponse(record, policy.FinePerDay));
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<BorrowRecordResponse>>> GetOverdue(CancellationToken cancellationToken)
    {
        var today = DateTime.Now.Date;
        var policy = await service.GetCurrentPolicyAsync(cancellationToken);

        var records = await db.BorrowRecords
            .AsNoTracking()
            .Where(x => x.Status == BorrowStatuses.Borrowed && x.DueDate.Date < today)
            .OrderBy(x => x.DueDate)
            .ToListAsync(cancellationToken);

        return Ok(records.Select(x => service.ToResponse(x, policy.FinePerDay)));
    }

    [HttpGet("reader/{readerId:int}")]
    public async Task<ActionResult<IEnumerable<BorrowRecordResponse>>> GetByReader(int readerId, CancellationToken cancellationToken)
    {
        var policy = await service.GetCurrentPolicyAsync(cancellationToken);
        var records = await db.BorrowRecords
            .AsNoTracking()
            .Where(x => x.ReaderId == readerId)
            .OrderByDescending(x => x.Id)
            .ToListAsync(cancellationToken);

        return Ok(records.Select(x => service.ToResponse(x, policy.FinePerDay)));
    }

    [HttpPost]
    public async Task<ActionResult<BorrowRecord>> Create(BorrowRecordCreateRequest request, CancellationToken cancellationToken)
    {
        var record = await service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = record.Id }, record);
    }

    [HttpPost("{id:int}/return")]
    public async Task<ActionResult<BorrowRecord>> Return(int id, BorrowRecordReturnRequest request, CancellationToken cancellationToken)
    {
        var record = await service.ReturnAsync(id, request, cancellationToken);
        return Ok(record);
    }


    [HttpGet("/api/circulation/history")]
    public async Task<ActionResult<IEnumerable<BorrowRecordResponse>>> History(CancellationToken cancellationToken)
    {
        var policy = await service.GetCurrentPolicyAsync(cancellationToken);
        var records = await db.BorrowRecords
            .AsNoTracking()
            .OrderByDescending(x => x.Id)
            .Take(200)
            .ToListAsync(cancellationToken);

        return Ok(records.Select(x => service.ToResponse(x, policy.FinePerDay)));
    }

    [HttpGet("/api/circulation/reports/summary")]
    public async Task<IActionResult> Summary(CancellationToken cancellationToken)
    {
        var today = DateTime.Now.Date;
        var total = await db.BorrowRecords.CountAsync(cancellationToken);
        var borrowed = await db.BorrowRecords.CountAsync(x => x.Status == BorrowStatuses.Borrowed, cancellationToken);
        var returned = await db.BorrowRecords.CountAsync(x => x.Status == BorrowStatuses.Returned, cancellationToken);
        var overdue = await db.BorrowRecords.CountAsync(x => x.Status == BorrowStatuses.Borrowed && x.DueDate.Date < today, cancellationToken);
        var fineTotal = await db.Fines.SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;

        return Ok(new { total, borrowed, returned, overdue, fineTotal });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var record = await db.BorrowRecords.FindAsync(new object[] { id }, cancellationToken);
        if (record is null)
            return NotFound();

        db.BorrowRecords.Remove(record);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/renew")]
    public async Task<ActionResult<BorrowRecord>> Renew
    (
        int id,
        BorrowRecordRenewRequest request,
        CancellationToken cancellationToken)
    {
        var record = await service.RenewAsync(id, request, cancellationToken);
        return Ok(record);
    }
}
