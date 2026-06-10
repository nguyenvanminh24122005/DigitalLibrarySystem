using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CirculationService.Data;
using System;

namespace CirculationService.Controllers;

[ApiController]
[Route("api/circulation/fines")]
public class FinesController(CirculationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetFines()
    {
        var fines = await db.Fines.OrderByDescending(f => f.UpdatedAt).ToListAsync();
        return Ok(fines);
    }

    [HttpPut("{id:int}/pay")]
    public async Task<IActionResult> PayFine(int id)
    {
        // Settling by readerId (id parameter corresponds to readerId in some frontend paths) or by fineId.
        // Let's support looking up by Id or by ReaderId where Status is "Unpaid"
        var fine = await db.Fines.FirstOrDefaultAsync(f => (f.Id == id || f.ReaderId == id) && f.Status == "Unpaid");
        if (fine == null) return NotFound(new { message = "Không tìm thấy công nợ cần thanh toán hoặc đã thanh toán." });

        fine.Amount = 0;
        fine.Status = "Paid";
        fine.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(fine);
    }
}
