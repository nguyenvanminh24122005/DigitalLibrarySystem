using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CirculationService.Data;
using CirculationService.Models;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace CirculationService.Controllers;

[ApiController]
[Route("api/v1/circulation/borrowings")]
[Route("api/circulation/borrowings")]
[Route("api/records")]
public class BorrowingsController(
    CirculationDbContext db,
    IConfiguration config,
    IHttpClientFactory httpClientFactory) : ControllerBase
{
    private string CatalogUrl => config["CATALOG_SERVICE_URL"] ?? config["Services:CatalogUrl"] ?? "http://localhost:5001";
    private string IdentityUrl => config["IDENTITY_SERVICE_URL"] ?? config["Services:IdentityUrl"] ?? "http://localhost:5003";

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
        var copyCodes = dto.GetCopyCodes();
        if (copyCodes.Count == 0)
        {
            return BadRequest(new { message = "Vui lòng nhập copyCode" });
        }

        var client = CreateForwardingClient();

        try
        {
            var validateResponse = await client.GetFromJsonAsync<ValidateCardResponse>(
                BuildIdentityUrl($"cards/validate/{dto.ReaderId}"));
            if (validateResponse == null || !validateResponse.IsValid)
            {
                return BadRequest(new { message = validateResponse?.Message ?? "Thẻ thư viện không hợp lệ hoặc không được phép mượn." });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error validating card: {ex.Message}");
        }

        var createdRecords = new List<BorrowRecord>();
        foreach (var copyCode in copyCodes)
        {
            CatalogCopyDto? copy;
            try
            {
                copy = await client.GetFromJsonAsync<CatalogCopyDto>(BuildCatalogUrl($"books/copies/lookup/{copyCode}"));
            }
            catch (Exception ex)
            {
                return StatusCode(502, new { message = $"Không thể kết nối Catalog Service để kiểm tra copyCode {copyCode}: {ex.Message}" });
            }

            if (copy == null)
            {
                return NotFound(new { message = $"Không tìm thấy bản sao sách với copyCode {copyCode}" });
            }

            if (!string.Equals(copy.Status, "Available", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = $"Bản sao {copyCode} hiện không sẵn sàng để mượn (Trạng thái: {copy.Status})" });
            }

            if (dto.BookId.HasValue && dto.BookId.Value != copy.BookId)
            {
                return BadRequest(new { message = $"copyCode {copyCode} không thuộc bookId {dto.BookId.Value}" });
            }

            try
            {
                var response = await client.PutAsync(BuildCatalogUrl($"books/copies/borrow-by-code/{copyCode}"), null);
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode(502, new { message = "Không thể cập nhật trạng thái sách bên Catalog" });
                }
            }
            catch
            {
                return StatusCode(502, new { message = "Không thể cập nhật trạng thái sách bên Catalog" });
            }

            var record = new BorrowRecord
            {
                ReaderId = dto.ReaderId,
                ReaderName = string.IsNullOrWhiteSpace(dto.ReaderName) ? "Độc giả" : dto.ReaderName,
                CardNumber = dto.CardNumber ?? string.Empty,
                CopyCode = copyCode,
                BookId = copy.BookId,
                BookTitle = string.IsNullOrWhiteSpace(copy.BookTitle) ? "Sách" : copy.BookTitle,
                BorrowDate = dto.BorrowDate ?? DateTime.UtcNow,
                DueDate = dto.DueDate ?? DateTime.UtcNow.AddDays(14),
                Status = "Borrowed",
                Fine = 0
            };

            db.BorrowRecords.Add(record);
            createdRecords.Add(record);

            try
            {
                await client.PostAsJsonAsync(BuildIdentityUrl("events/book-borrowed"), new
                {
                    readerId = dto.ReaderId,
                    bookId = copy.BookId,
                    bookTitle = copy.BookTitle,
                    borrowedAt = record.BorrowDate
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error publishing borrow event: {ex.Message}");
            }
        }

        await db.SaveChangesAsync();
        return Ok(createdRecords.Count == 1 ? createdRecords[0] : createdRecords);
    }

    [HttpPut("{id:int}/return")]
    [HttpPost("{id:int}/return")]
    public async Task<IActionResult> ReturnBorrowing(int id, ReturnRequestDto? dto)
    {
        var record = await db.BorrowRecords.FindAsync(id);
        if (record == null) return NotFound(new { message = "Không tìm thấy phiếu mượn" });
        if (record.Status == "Returned") return BadRequest(new { message = "Sách đã được trả trước đó" });

        var returnDate = dto?.ReturnDate ?? DateTime.UtcNow;
        var fineAmount = CalculateFine(record.DueDate, returnDate);

        var client = CreateForwardingClient();
        try
        {
            var response = await client.PutAsync(BuildCatalogUrl($"books/copies/return-by-code/{record.CopyCode}"), null);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode(502, new { message = "Không thể cập nhật trạng thái sách bên Catalog" });
            }
        }
        catch
        {
            return StatusCode(502, new { message = "Không thể cập nhật trạng thái sách bên Catalog" });
        }

        record.ReturnDate = returnDate;
        record.Status = "Returned";
        record.Fine = fineAmount;

        if (fineAmount > 0)
        {
            var fine = await db.Fines.FirstOrDefaultAsync(f => f.ReaderId == record.ReaderId && f.Status == "Unpaid");
            if (fine == null)
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
            else
            {
                fine.Amount += fineAmount;
                fine.UpdatedAt = DateTime.UtcNow;
            }
        }

        try
        {
            await client.PostAsJsonAsync(BuildIdentityUrl("events/book-returned"), new
            {
                readerId = record.ReaderId,
                bookId = record.BookId,
                fineAmount = record.Fine,
                returnedAt = returnDate
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error publishing return event: {ex.Message}");
        }

        await db.SaveChangesAsync();
        return Ok(record);
    }

    [HttpGet("/api/v1/circulation/overdue")]
    [HttpGet("/api/circulation/overdue")]
    [HttpGet("/api/overdue")]
    public async Task<IActionResult> GetOverdueBorrowings()
    {
        var today = DateTime.UtcNow;
        var overdueRecords = await db.BorrowRecords
            .Where(r => r.Status == "Borrowed" && r.DueDate < today)
            .OrderBy(r => r.DueDate)
            .ToListAsync();

        var client = CreateForwardingClient();
        var rows = new List<object>();
        foreach (var record in overdueRecords)
        {
            var reader = await TryGetReaderAsync(client, record.ReaderId);
            var overdueDays = Math.Max(0, (int)Math.Ceiling((today - record.DueDate).TotalDays));
            rows.Add(new
            {
                readerName = reader?.FullName ?? record.ReaderName,
                readerEmail = reader?.Email ?? string.Empty,
                readerPhone = reader?.Phone ?? string.Empty,
                bookTitle = record.BookTitle,
                copyCode = record.CopyCode,
                dueDate = record.DueDate,
                overdueDays,
                estimatedFine = overdueDays * 5000
            });
        }

        return Ok(rows);
    }

    [HttpGet("/api/v1/circulation/stats")]
    [HttpGet("/api/circulation/stats")]
    [HttpGet("/api/stats")]
    public async Task<IActionResult> GetStats()
    {
        var today = DateTime.UtcNow;
        var totalBorrowings = await db.BorrowRecords.CountAsync();
        var activeBorrowings = await db.BorrowRecords.CountAsync(r => r.Status == "Borrowed");
        var returnedBorrowings = await db.BorrowRecords.CountAsync(r => r.Status == "Returned");
        var overdueBorrowings = await db.BorrowRecords.CountAsync(r => r.Status == "Borrowed" && r.DueDate < today);
        var totalFines = await db.BorrowRecords.SumAsync(r => r.Fine);
        var totalDebt = await db.Fines.Where(f => f.Status == "Unpaid").SumAsync(f => f.Amount);

        return Ok(new
        {
            totalBorrowings,
            activeBorrowings,
            returnedBorrowings,
            overdueBorrowings,
            totalFines,
            totalDebt
        });
    }

    private HttpClient CreateForwardingClient()
    {
        var client = httpClientFactory.CreateClient();
        var authHeader = Request.Headers["Authorization"].ToString();
        if (!string.IsNullOrEmpty(authHeader))
        {
            client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", authHeader);
        }
        return client;
    }

    private string BuildCatalogUrl(string path) => BuildServiceUrl(CatalogUrl, "catalog", path);

    private string BuildIdentityUrl(string path) => BuildServiceUrl(IdentityUrl, "identity", path);

    private static string BuildServiceUrl(string baseUrl, string gatewaySegment, string path)
    {
        var trimmedBase = baseUrl.TrimEnd('/');
        var trimmedPath = path.TrimStart('/');
        var prefix = trimmedBase.EndsWith("/api/v1", StringComparison.OrdinalIgnoreCase)
            ? $"{gatewaySegment}/"
            : "api/";
        return $"{trimmedBase}/{prefix}{trimmedPath}";
    }

    private static decimal CalculateFine(DateTime dueDate, DateTime returnDate)
    {
        if (returnDate <= dueDate) return 0;
        var lateDays = (int)Math.Ceiling((returnDate - dueDate).TotalDays);
        return Math.Max(0, lateDays) * 5000;
    }

    private async Task<ReaderDto?> TryGetReaderAsync(HttpClient client, int readerId)
    {
        try
        {
            return await client.GetFromJsonAsync<ReaderDto>(BuildIdentityUrl($"readers/{readerId}"));
        }
        catch
        {
            return null;
        }
    }
}

public class BorrowRequestDto
{
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public int ReaderId { get; set; }
    public string? ReaderName { get; set; }
    public string? CardNumber { get; set; }
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public int? BookId { get; set; }
    public string? CopyCode { get; set; }
    public List<string> CopyCodes { get; set; } = [];
    public DateTime? BorrowDate { get; set; }
    public DateTime? DueDate { get; set; }

    public List<string> GetCopyCodes()
    {
        var codes = CopyCodes
            .Where(code => !string.IsNullOrWhiteSpace(code))
            .Select(code => code.Trim())
            .ToList();

        if (!string.IsNullOrWhiteSpace(CopyCode) && !codes.Contains(CopyCode.Trim(), StringComparer.OrdinalIgnoreCase))
        {
            codes.Add(CopyCode.Trim());
        }

        return codes;
    }
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

public class ReaderDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}
