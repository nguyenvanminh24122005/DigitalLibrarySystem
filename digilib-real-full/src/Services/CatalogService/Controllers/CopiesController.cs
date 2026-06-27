using System.Text.Json;
using CatalogService.Data;
using CatalogService.Dtos;
using CatalogService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/copies")]
[Authorize]
public sealed class CopiesController(CatalogDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookCopyDto>>> GetCopies([FromQuery] string? q, [FromQuery] CopyCondition? condition, [FromQuery] BorrowStatus? borrowStatus, [FromQuery] string? shelfLocation)
    {
        var query = db.BookCopies.Include(x => x.Book).AsQueryable();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var keyword = q.Trim();
            query = query.Where(x => x.CopyCode.Contains(keyword) || x.Book!.Title.Contains(keyword) || x.Book.ISBN.Contains(keyword));
        }
        if (condition.HasValue) query = query.Where(x => x.Condition == condition);
        if (borrowStatus.HasValue) query = query.Where(x => x.BorrowStatus == borrowStatus);
        if (!string.IsNullOrWhiteSpace(shelfLocation)) query = query.Where(x => x.ShelfLocation.Contains(shelfLocation));

        var result = await query.OrderBy(x => x.CopyCode).ToListAsync();
        return Ok(result.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookCopyDto>> GetCopy(Guid id)
    {
        var copy = await db.BookCopies.Include(x => x.Book).FirstOrDefaultAsync(x => x.Id == id);
        return copy is null ? NotFound() : Ok(ToDto(copy));
    }

    [HttpGet("code/{copyCode}")]
    public async Task<ActionResult<BookCopyDto>> GetCopyByCode(string copyCode)
    {
        var copy = await db.BookCopies.Include(x => x.Book).FirstOrDefaultAsync(x => x.CopyCode == copyCode);
        return copy is null ? NotFound() : Ok(ToDto(copy));
    }

    [HttpPost]
    public async Task<ActionResult<BookCopyDto>> CreateCopy(CreateBookCopyRequest request)
    {
        var book = await db.Books.Include(x => x.Copies).FirstOrDefaultAsync(x => x.Id == request.BookId);
        if (book is null) return BadRequest("Sách không tồn tại.");
        var oldAvailable = book.Copies.Count(x => x.BorrowStatus == BorrowStatus.Available && x.Condition == CopyCondition.Good);

        var copyCode = string.IsNullOrWhiteSpace(request.CopyCode)
            ? $"BLB{await db.BookCopies.CountAsync() + 1:0000}"
            : request.CopyCode.Trim();
        if (await db.BookCopies.AnyAsync(x => x.CopyCode == copyCode)) return Conflict("Mã bản sao đã tồn tại.");

        var copy = new BookCopy
        {
            BookId = request.BookId,
            CopyCode = copyCode,
            ShelfLocation = string.IsNullOrWhiteSpace(request.ShelfLocation) ? "Chưa phân kệ" : request.ShelfLocation.Trim(),
            Condition = request.Condition,
            BorrowStatus = request.BorrowStatus,
            Note = request.Note,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.BookCopies.Add(copy);
        db.CatalogEvents.Add(CreateEvent("book.copy_added", "BookCopy", copy.Id.ToString(), $"Thêm bản sao mới {copy.CopyCode}", new { copy.BookId, copy.CopyCode, copy.Condition, copy.BorrowStatus }));
        if (copy.BorrowStatus == BorrowStatus.Available && copy.Condition == CopyCondition.Good)
        {
            db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", book.Id.ToString(), $"Tăng số lượng có thể mượn của sách {book.Title}", new { bookId = book.Id, oldAvailable, newAvailable = oldAvailable + 1 }));
        }
        await db.SaveChangesAsync();

        var created = await db.BookCopies.Include(x => x.Book).FirstAsync(x => x.Id == copy.Id);
        return CreatedAtAction(nameof(GetCopy), new { id = copy.Id }, ToDto(created));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCopy(Guid id, UpdateBookCopyRequest request)
    {
        var copy = await db.BookCopies.Include(x => x.Book).FirstOrDefaultAsync(x => x.Id == id);
        if (copy is null) return NotFound();

        var oldCondition = copy.Condition;
        var oldStatus = copy.BorrowStatus;
        var oldAvailable = await db.BookCopies.CountAsync(x => x.BookId == copy.BookId && x.BorrowStatus == BorrowStatus.Available && x.Condition == CopyCondition.Good);

        copy.ShelfLocation = string.IsNullOrWhiteSpace(request.ShelfLocation) ? copy.ShelfLocation : request.ShelfLocation.Trim();
        copy.Condition = request.Condition;
        copy.BorrowStatus = request.Condition == CopyCondition.Lost || request.Condition == CopyCondition.Damaged ? BorrowStatus.Unavailable : request.BorrowStatus;
        copy.CurrentBorrowTicketCode = copy.BorrowStatus == BorrowStatus.Available ? null : request.CurrentBorrowTicketCode;
        copy.Note = request.Note;
        copy.UpdatedAt = DateTime.UtcNow;

        db.CatalogEvents.Add(CreateEvent("book.copy_updated", "BookCopy", copy.Id.ToString(), $"Cập nhật bản sao {copy.CopyCode}", new { oldCondition, newCondition = copy.Condition, oldStatus, newStatus = copy.BorrowStatus }));

        var newAvailable = await db.BookCopies.CountAsync(x => x.BookId == copy.BookId && x.Id != copy.Id && x.BorrowStatus == BorrowStatus.Available && x.Condition == CopyCondition.Good)
            + (copy.BorrowStatus == BorrowStatus.Available && copy.Condition == CopyCondition.Good ? 1 : 0);
        if (oldAvailable != newAvailable || oldStatus != copy.BorrowStatus || oldCondition != copy.Condition)
        {
            db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", copy.BookId.ToString(), $"Thay đổi trạng thái bản sao {copy.CopyCode}: {oldStatus}/{oldCondition} -> {copy.BorrowStatus}/{copy.Condition}", new { copy.BookId, copy.CopyCode, oldStatus, newStatus = copy.BorrowStatus, oldCondition, newCondition = copy.Condition, oldAvailable, newAvailable }));
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCopy(Guid id)
    {
        var copy = await db.BookCopies.Include(x => x.Book).FirstOrDefaultAsync(x => x.Id == id);
        if (copy is null) return NotFound();
        if (copy.BorrowStatus == BorrowStatus.Borrowed) return BadRequest("Không thể xóa bản sao đang được mượn.");

        var oldAvailable = await db.BookCopies.CountAsync(x => x.BookId == copy.BookId && x.BorrowStatus == BorrowStatus.Available && x.Condition == CopyCondition.Good);
        db.BookCopies.Remove(copy);
        db.CatalogEvents.Add(CreateEvent("book.copy_deleted", "BookCopy", copy.Id.ToString(), $"Xóa bản sao {copy.CopyCode}", new { copy.BookId, copy.CopyCode }));
        if (copy.BorrowStatus == BorrowStatus.Available && copy.Condition == CopyCondition.Good)
        {
            db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", copy.BookId.ToString(), $"Giảm số lượng có thể mượn của sách {copy.Book?.Title}", new { copy.BookId, oldAvailable, newAvailable = Math.Max(0, oldAvailable - 1) }));
        }
        await db.SaveChangesAsync();
        return NoContent();
    }

    private CatalogEvent CreateEvent(string type, string entityType, string entityId, string description, object? payload = null) => new()
    {
        EventType = type,
        EntityType = entityType,
        EntityId = entityId,
        Description = description,
        Payload = payload is null ? null : JsonSerializer.Serialize(payload),
        CreatedBy = User.Identity?.Name ?? "Admin",
        CreatedAt = DateTime.UtcNow
    };

    public static BookCopyDto ToDto(BookCopy copy) => new(
        copy.Id,
        copy.BookId,
        copy.Book?.Title ?? string.Empty,
        copy.Book?.ISBN ?? string.Empty,
        copy.CopyCode,
        copy.ShelfLocation,
        copy.Condition,
        copy.BorrowStatus,
        copy.CurrentBorrowTicketCode,
        copy.Note,
        copy.CreatedAt,
        copy.UpdatedAt);
}
