using CirculationService.Api.Data;
using CirculationService.Api.DTOs;
using CirculationService.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Api.Controllers;

[ApiController]
[Route("api/borrow-policies")]
public class BorrowPoliciesController(CirculationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BorrowPolicy>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await db.BorrowPolicies.OrderByDescending(x => x.Id).ToListAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("current")]
    public async Task<ActionResult<BorrowPolicy>> GetCurrent(CancellationToken cancellationToken)
    {
        var item = await db.BorrowPolicies.OrderByDescending(x => x.Id).FirstOrDefaultAsync(cancellationToken);
        return item is null ? NotFound("Chưa có chính sách mượn sách.") : Ok(item);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BorrowPolicy>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await db.BorrowPolicies.FindAsync(new object[] { id }, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<BorrowPolicy>> Create(BorrowPolicyCreateRequest request, CancellationToken cancellationToken)
    {
        var item = new BorrowPolicy
        {
            Name = request.Name.Trim(),
            MaxBooks = request.MaxBooks,
            MaxDays = request.MaxDays,
            FinePerDay = request.FinePerDay
        };

        db.BorrowPolicies.Add(item);
        await db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BorrowPolicy>> Update(int id, BorrowPolicyUpdateRequest request, CancellationToken cancellationToken)
    {
        var item = await db.BorrowPolicies.FindAsync(new object[] { id }, cancellationToken);
        if (item is null)
            return NotFound();

        item.Name = request.Name.Trim();
        item.MaxBooks = request.MaxBooks;
        item.MaxDays = request.MaxDays;
        item.FinePerDay = request.FinePerDay;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var item = await db.BorrowPolicies.FindAsync(new object[] { id }, cancellationToken);
        if (item is null)
            return NotFound();

        db.BorrowPolicies.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
