using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CirculationService.Data;
using CirculationService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace CirculationService.Controllers;

[ApiController]
[Route("api/circulation/borrowings")]
public class BorrowingsController(
    CirculationDbContext db,
    IConfiguration config,
    IHttpClientFactory httpClientFactory) : ControllerBase
{
    private string CatalogUrl => config["Services:CatalogUrl"] ?? "http://localhost:5001";
    private string IdentityUrl => config["Services:IdentityUrl"] ?? "http://localhost:5003";

    [HttpGet]
    public async Task<IActionResult> GetBorrowings()
    {
        var records = await db.BorrowRecords.OrderByDescending(r => r.Id).ToListAsync();
        return Ok(records);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBorrowing(int id)
    {
        var record = await db.BorrowRecords.FindAsync(id);
        return record == null ? NotFound(new { message = "Không tìm thấy phiếu mượn" }) : Ok(record);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBorrowing(BorrowRequestDto dto)
    {
        if (dto.CopyCodes == null || dto.CopyCodes.Count == 0)
        {
            return BadRequest(new { message = "Vui lòng chọn ít nhất một bản sao sách để mượn" });
        }

        var client = httpClientFactory.CreateClient();
        
        // Forward incoming Authorization header for downstream service authorization
        var authHeader = Request.Headers["Authorization"].ToString();
        if (!string.IsNullOrEmpty(authHeader))
        {
            client.DefaultRequestHeaders.Add("Authorization", authHeader);
        }

        // 1. Validate card in Identity Service
        try
        {
            var cardValidationUrl = $"{IdentityUrl}/api/cards/validate/{dto.ReaderId}";
            var validateResponse = await client.GetFromJsonAsync<ValidateCardResponse>(cardValidationUrl);
            if (validateResponse == null || !validateResponse.IsValid)
            {
                return BadRequest(new { message = validateResponse?.Message ?? "Thẻ thư viện không hợp lệ hoặc không được phép mượn." });
            }
        }
        catch (Exception ex)
        {
            // Logging or fallback if Identity service is down/unavailable
            Console.WriteLine($"Error validating card: {ex.Message}");
        }

        // 2. Process each copy
        var createdRecords = new List<BorrowRecord>();
        foreach (var copyCode in dto.CopyCodes)
        {
            // Lookup book copy in Catalog Service
            CatalogCopyDto? copy = null;
            try
            {
                var lookupUrl = $"{CatalogUrl}/api/books/copies/lookup/{copyCode}";
                copy = await client.GetFromJsonAsync<CatalogCopyDto>(lookupUrl);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Không thể kết nối đến Catalog Service để kiểm tra mã {copyCode}: {ex.Message}" });
            }

            if (copy == null)
            {
                return NotFound(new { message = $"Không tìm thấy bản sao sách với mã {copyCode}" });
            }

            if (copy.Status != "Available")
            {
                return BadRequest(new { message = $"Bản sao {copyCode} ({copy.BookTitle}) hiện đang không sẵn sàng để mượn (Trạng thái: {copy.Status})" });
            }

            // Mark book copy as Borrowed in Catalog Service
            try
            {
                var borrowUrl = $"{CatalogUrl}/api/books/copies/borrow-by-code/{copyCode}";
                var response = await client.PutAsync(borrowUrl, null);
                if (!response.IsSuccessStatusCode)
                {
                    var errorMsg = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { message = $"Lỗi khi cập nhật trạng thái bản sao {copyCode}: {errorMsg}" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi kết nối Catalog Service để mượn bản sao {copyCode}: {ex.Message}" });
            }

            // Create local BorrowRecord
            var record = new BorrowRecord
            {
                ReaderId = dto.ReaderId,
                ReaderName = dto.ReaderName ?? "Độc giả",
                CardNumber = dto.CardNumber,
                CopyCode = copyCode,
                BookId = copy.BookId,
                BookTitle = copy.BookTitle ?? "Sách",
                BorrowDate = dto.BorrowDate ?? DateTime.UtcNow,
                DueDate = dto.DueDate ?? DateTime.UtcNow.AddDays(14),
                Status = "Borrowed",
                Fine = 0
            };

            db.BorrowRecords.Add(record);
            createdRecords.Add(record);

            // Send event to Identity & Report Service
            try
            {
                var eventUrl = $"{IdentityUrl}/api/events/book-borrowed";
                var eventDto = new
                {
                    readerId = dto.ReaderId,
                    bookId = copy.BookId,
                    bookTitle = copy.BookTitle,
                    borrowedAt = record.BorrowDate
                };
                await client.PostAsJsonAsync(eventUrl, eventDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error publishing borrow event: {ex.Message}");
            }
        }

        await db.SaveChangesAsync();
        return Ok(createdRecords);
    }

    [HttpPut("{id:int}/return")]
    public async Task<IActionResult> ReturnBorrowing(int id, ReturnRequestDto? dto)
    {
        var record = await db.BorrowRecords.FindAsync(id);
        if (record == null) return NotFound(new { message = "Không tìm thấy phiếu mượn" });
        if (record.Status == "Returned") return BadRequest(new { message = "Sách đã được trả trước đó" });

        var returnDate = dto?.ReturnDate ?? DateTime.UtcNow;
        record.ReturnDate = returnDate;
        record.Status = "Returned";

        // Calculate fine (5,000 VND per day overdue)
        decimal fineAmount = 0;
        if (returnDate > record.DueDate)
        {
            var lateDays = (int)Math.Ceiling((returnDate - record.DueDate).TotalDays);
            if (lateDays > 0)
            {
                fineAmount = lateDays * 5000;
                record.Fine = fineAmount;
            }
        }

        var client = httpClientFactory.CreateClient();
        
        // Forward Auth Header
        var authHeader = Request.Headers["Authorization"].ToString();
        if (!string.IsNullOrEmpty(authHeader))
        {
            client.DefaultRequestHeaders.Add("Authorization", authHeader);
        }

        // 1. Update status in Catalog Service
        try
        {
            var returnUrl = $"{CatalogUrl}/api/books/copies/return-by-code/{record.CopyCode}";
            await client.PutAsync(returnUrl, null);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating catalog copy: {ex.Message}");
        }

        // 2. Publish return event to Identity
        try
        {
            var eventUrl = $"{IdentityUrl}/api/events/book-returned";
            var eventDto = new
            {
                readerId = record.ReaderId,
                bookId = record.BookId,
                fineAmount = record.Fine,
                returnedAt = returnDate
            };
            await client.PostAsJsonAsync(eventUrl, eventDto);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error publishing return event: {ex.Message}");
        }

        // 3. Process Fine record locally if there's a fine
        if (fineAmount > 0)
        {
            var fine = await db.Fines.FirstOrDefaultAsync(f => f.ReaderId == record.ReaderId && f.Status == "Unpaid");
            if (fine != null)
            {
                fine.Amount += fineAmount;
                fine.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                db.Fines.Add(new Fine
                {
                    ReaderId = record.ReaderId,
                    ReaderName = record.ReaderName,
                    CardNumber = record.CardNumber,
                    Amount = fineAmount,
                    Status = "Unpaid",
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        await db.SaveChangesAsync();
        return Ok(record);
    }

    [HttpGet("../overdue")] // translates to /api/circulation/overdue
    public async Task<IActionResult> GetOverdueBorrowings()
    {
        var today = DateTime.UtcNow;
        var overdue = await db.BorrowRecords
            .Where(r => r.Status == "Borrowed" && r.DueDate < today)
            .ToListAsync();
        return Ok(overdue);
    }

    [HttpGet("../stats")] // translates to /api/circulation/stats
    public async Task<IActionResult> GetStats()
    {
        var today = DateTime.UtcNow;
        var totalRecords = await db.BorrowRecords.CountAsync();
        var borrowedBooks = await db.BorrowRecords.CountAsync(r => r.Status == "Borrowed");
        var overdueBooks = await db.BorrowRecords.CountAsync(r => r.Status == "Borrowed" && r.DueDate < today);
        var totalFine = await db.BorrowRecords.SumAsync(r => r.Fine);
        var totalDebt = await db.Fines.Where(f => f.Status == "Unpaid").SumAsync(f => f.Amount);

        return Ok(new
        {
            totalRecords,
            borrowedBooks,
            overdueBooks,
            totalFine,
            totalDebt
        });
    }
}

// DTO Classes
public class BorrowRequestDto
{
    public int ReaderId { get; set; }
    public string ReaderName { get; set; } = string.Empty;
    public string CardNumber { get; set; } = string.Empty;
    public List<string> CopyCodes { get; set; } = [];
    public DateTime? BorrowDate { get; set; }
    public DateTime? DueDate { get; set; }
}

public class ReturnRequestDto
{
    public DateTime? ReturnDate { get; set; }
}

public class ValidateCardResponse
{
    public bool IsValid { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class CatalogCopyDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string CopyCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string BookTitle { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
}
