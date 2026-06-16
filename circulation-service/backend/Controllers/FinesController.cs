using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CirculationService.Data;

namespace CirculationService.Controllers;

[ApiController]
[Route("api/v1/circulation/fines")]
[Route("api/circulation/fines")]
public class FinesController(CirculationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetFines()
    {
        var fineRows = await db.Fines
            .AsNoTracking()
            .GroupBy(f => new { f.ReaderId, f.ReaderName })
            .Select(group => new
            {
                readerId = group.Key.ReaderId,
                readerName = group.Key.ReaderName,
                totalFine = group.Sum(f => f.Amount),
                paidAmount = group.Where(f => f.Status == "Paid").Sum(f => f.Amount),
                remainingDebt = group.Where(f => f.Status == "Unpaid").Sum(f => f.Amount)
            })
            .OrderByDescending(f => f.remainingDebt)
            .ToListAsync();

        return Ok(fineRows);
    }

    [HttpPut("{id:int}/pay")]
    public async Task<IActionResult> PayFine(int id)
    {
        var fine = await db.Fines.FirstOrDefaultAsync(f => (f.Id == id || f.ReaderId == id) && f.Status == "Unpaid");
        if (fine == null) return NotFound(new { message = "Không tìm thấy công nợ cần thanh toán hoặc đã thanh toán." });

        fine.Status = "Paid";
        fine.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(fine);
    }
}
