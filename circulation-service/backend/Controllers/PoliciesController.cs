using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CirculationService.Data;
using CirculationService.Models;

namespace CirculationService.Controllers;

[ApiController]
[Route("api/circulation/policies")]
public class PoliciesController(CirculationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPolicies()
    {
        var policies = await db.BorrowPolicies.ToListAsync();
        return Ok(policies);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePolicy(int id, BorrowPolicy policy)
    {
        var existing = await db.BorrowPolicies.FindAsync(id);
        if (existing == null) return NotFound(new { message = "Không tìm thấy quy định" });

        existing.Name = policy.Name;
        existing.MaxBooks = policy.MaxBooks;
        existing.MaxDays = policy.MaxDays;
        existing.FinePerDay = policy.FinePerDay;

        await db.SaveChangesAsync();
        return Ok(existing);
    }
}
