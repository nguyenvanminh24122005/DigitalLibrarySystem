using IdentityReportService.Data;
using IdentityReportService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IdentityReportService.Controllers;

[ApiController]
[Route("api/readers")]
public class ReadersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var readers = await db.Users
            .AsNoTracking()
            .Include(u => u.LibraryCard)
            .Where(u => u.Role == "Reader")
            .OrderByDescending(u => u.Id)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.Phone,
                u.Address,
                u.IsActive,
                u.CreatedAt,
                CardNumber = u.LibraryCard != null ? u.LibraryCard.CardNumber : null,
                CardStatus = u.LibraryCard != null ? u.LibraryCard.Status : null,
                CardExpiredAt = u.LibraryCard != null ? (DateTime?)u.LibraryCard.ExpiredAt : null
            })
            .ToListAsync();

        return Ok(readers);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var reader = await db.Users
            .Include(u => u.LibraryCard)
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == "Reader");

        if (reader == null) return NotFound(new { message = "Không tìm thấy độc giả" });

        return Ok(new
        {
            reader.Id,
            reader.FullName,
            reader.Email,
            reader.Phone,
            reader.Address,
            reader.IsActive,
            reader.CreatedAt,
            CardNumber = reader.LibraryCard?.CardNumber,
            CardStatus = reader.LibraryCard?.Status,
            CardExpiredAt = reader.LibraryCard?.ExpiredAt
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateReaderDto dto)
    {
        var existing = await db.Users.AnyAsync(u => u.Email == dto.Email);
        if (existing) return BadRequest(new { message = "Email độc giả đã tồn tại trong hệ thống" });

        var reader = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            PasswordHash = AppDbContext.Hash("Reader@123"), // Default password
            Role = "Reader",
            IsActive = true
        };

        db.Users.Add(reader);
        await db.SaveChangesAsync();

        // Auto create library card
        var card = new LibraryCard
        {
            UserId = reader.Id,
            CardNumber = $"CARD-{reader.Id:0000}-{DateTime.UtcNow:HHmmss}",
            Status = "Active",
            IssuedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddYears(1)
        };
        db.LibraryCards.Add(card);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = reader.Id }, new
        {
            reader.Id,
            reader.FullName,
            reader.Email,
            reader.Phone,
            reader.Address,
            reader.IsActive,
            CardNumber = card.CardNumber,
            CardStatus = card.Status
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CreateReaderDto dto)
    {
        var reader = await db.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "Reader");
        if (reader == null) return NotFound(new { message = "Không tìm thấy độc giả" });

        if (reader.Email != dto.Email)
        {
            var existing = await db.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id);
            if (existing) return BadRequest(new { message = "Email độc giả đã tồn tại" });
        }

        reader.FullName = dto.FullName;
        reader.Email = dto.Email;
        reader.Phone = dto.Phone;
        reader.Address = dto.Address;

        await db.SaveChangesAsync();
        return Ok(reader);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var reader = await db.Users
            .Include(u => u.LibraryCard)
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == "Reader");

        if (reader == null) return NotFound(new { message = "Không tìm thấy độc giả" });

        if (reader.LibraryCard != null)
        {
            db.LibraryCards.Remove(reader.LibraryCard);
        }

        db.Users.Remove(reader);
        await db.SaveChangesAsync();
        return Ok(new { message = "Xóa hồ sơ độc giả thành công" });
    }
}

public class CreateReaderDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
}
