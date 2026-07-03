using System.Text.Json;
using IdentityReportService.Common;
using IdentityReportService.Data;
using IdentityReportService.Dtos;
using IdentityReportService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = AppRoles.AdminOrReporter)]
public sealed class ReportsController(IdentityReportDbContext db, IHttpClientFactory httpClientFactory, IConfiguration configuration) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<ActionResult<OverviewReportDto>> Overview()
    {
        var books = await GetArrayFromService("CatalogService", "/api/books");
        var copies = await GetArrayFromService("CatalogService", "/api/copies");
        var records = await GetArrayFromService("CirculationService", "/api/borrow-records");
        var overdue = await GetArrayFromService("CirculationService", "/api/borrow-records/overdue");

        if (copies.Count == 0)
        {
            copies = books.SelectMany(x => GetArray(x, "copies")).ToList();
        }

        var activeReaders = await db.Readers.CountAsync(x => x.Status == AccountStatus.Active);
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var borrowCountThisMonth = records.Count(x => GetDate(x, "borrowDate") is DateTime borrowDate && borrowDate >= monthStart);

        var daily = Enumerable.Range(0, 30).Select(i =>
        {
            var date = DateTime.UtcNow.Date.AddDays(-29 + i);
            var borrowCount = records.Count(x => GetDate(x, "borrowDate")?.Date == date.Date);
            var returnCount = records.Count(x => GetDate(x, "returnDate")?.Date == date.Date);
            return new DailyBorrowReturnDto(date.ToString("dd/MM"), borrowCount, returnCount);
        }).ToList();

        var available = copies.Count(IsCopyAvailable);
        var borrowed = copies.Count(IsCopyBorrowed);
        var unavailable = Math.Max(0, copies.Count - available - borrowed);

        var topBooks = records
            .Select(x => GetString(x, "bookTitle"))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .GroupBy(x => x!)
            .OrderByDescending(x => x.Count())
            .Take(5)
            .Select(x => new NameValueDto(x.Key, x.Count()))
            .ToList();

        if (!topBooks.Any())
        {
            topBooks = books.Take(5)
                .Select(x => new NameValueDto(GetString(x, "title") ?? "Sách", GetArray(x, "copies").Count(IsCopyBorrowed)))
                .ToList();
        }

        var topReaders = records
            .Select(x => GetString(x, "readerName"))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .GroupBy(x => x!)
            .OrderByDescending(x => x.Count())
            .Take(5)
            .Select(x => new NameValueDto(x.Key, x.Count()))
            .ToList();

        if (!topReaders.Any())
        {
            topReaders = await db.Readers.OrderBy(x => x.FullName).Take(5).Select(x => new NameValueDto(x.FullName, 0)).ToListAsync();
        }

        return Ok(new OverviewReportDto(
            TotalBooks: books.Count,
            TotalCopies: copies.Count,
            ActiveReaders: activeReaders,
            BorrowCountThisMonth: borrowCountThisMonth,
            OverdueCount: overdue.Count,
            DailyBorrowReturns: daily,
            BookStatusRate: new[]
            {
                new NameValueDto("Đang có sẵn", available),
                new NameValueDto("Đang được mượn", borrowed),
                new NameValueDto("Không sẵn sàng", unavailable)
            },
            TopBooks: topBooks,
            TopReaders: topReaders
        ));
    }

    [HttpGet("/api/statistics")]
    public async Task<ActionResult<OverviewReportDto>> Statistics() => await Overview();

    [HttpGet("books")]
    public async Task<IActionResult> BooksReport()
    {
        var books = await GetArrayFromService("CatalogService", "/api/books");
        var copies = await GetArrayFromService("CatalogService", "/api/copies");
        if (copies.Count == 0) copies = books.SelectMany(x => GetArray(x, "copies")).ToList();

        var byCategory = books
            .Select(x => GetString(x, "category") ?? "Chưa phân loại")
            .GroupBy(x => x)
            .Select(x => new NameValueDto(x.Key, x.Count()))
            .OrderByDescending(x => x.Value)
            .ToList();

        var byYear = books
            .Select(x => GetInt(x, "publishedYear") ?? 0)
            .Where(x => x > 0)
            .GroupBy(x => x)
            .OrderBy(x => x.Key)
            .Select(x => new { year = x.Key, value = x.Count() });

        return Ok(new
        {
            totalBooks = books.Count,
            totalCopies = copies.Count,
            availableCopies = copies.Count(IsCopyAvailable),
            borrowedCopies = copies.Count(IsCopyBorrowed),
            byCategory,
            byYear
        });
    }

    [HttpGet("readers")]
    public async Task<IActionResult> ReadersReport() => Ok(new
    {
        totalReaders = await db.Readers.CountAsync(),
        activeReaders = await db.Readers.CountAsync(x => x.Status == AccountStatus.Active),
        lockedReaders = await db.Readers.CountAsync(x => x.Status == AccountStatus.Locked),
        expiredCards = await db.LibraryCards.CountAsync(x => x.ExpiredAt < DateTime.UtcNow),
        validCards = await db.LibraryCards.CountAsync(x => x.Status == AccountStatus.Active && x.ExpiredAt >= DateTime.UtcNow)
    });

    [HttpGet("circulation")]
    public async Task<IActionResult> CirculationReport()
    {
        var records = await GetArrayFromService("CirculationService", "/api/borrow-records");
        var overdue = await GetArrayFromService("CirculationService", "/api/borrow-records/overdue");
        var fines = await GetArrayFromService("CirculationService", "/api/fines");
        var returnCount = records.Count(x => GetDate(x, "returnDate") is not null || IsReturned(x));
        var fineTotal = records.Sum(x => GetDecimal(x, "fine") ?? 0) + fines.Sum(x => GetDecimal(x, "amount") ?? 0);
        var fineCollected = fines.Where(IsPaidFine).Sum(x => GetDecimal(x, "amount") ?? 0);

        return Ok(new
        {
            borrowCount = records.Count,
            returnCount,
            overdueCount = overdue.Count,
            fineTotal,
            fineCollected,
            unpaidFine = Math.Max(0, fineTotal - fineCollected)
        });
    }

    [HttpGet("fines")]
    public async Task<IActionResult> FinesReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var fines = await GetArrayFromService("CirculationService", "/api/fines");
        return Ok(BuildFineRevenueReport(fines, from, to));
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> RevenueReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var fines = await GetArrayFromService("CirculationService", "/api/fines");
        return Ok(BuildFineRevenueReport(fines, from, to));
    }

    [HttpGet("/api/statistics/revenue")]
    public async Task<IActionResult> StatisticsRevenue([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var fines = await GetArrayFromService("CirculationService", "/api/fines");
        return Ok(BuildFineRevenueReport(fines, from, to));
    }

    [HttpPost("sync-events")]
    [Authorize(Roles = AppRoles.AdminOnly)]
    public async Task<ActionResult<SyncEventsResultDto>> SyncEvents()
    {
        var records = await GetArrayFromService("CirculationService", "/api/borrow-records");
        var added = 0;

        foreach (var e in records)
        {
            var id = GetString(e, "id") ?? Guid.NewGuid().ToString();
            if (await db.ConsumedEvents.AnyAsync(x => x.SourceService == "CirculationService" && x.ExternalEventId == id)) continue;
            db.ConsumedEvents.Add(new ConsumedEvent
            {
                SourceService = "CirculationService",
                ExternalEventId = id,
                EventType = GetString(e, "status") ?? "borrow-record",
                EntityType = "BorrowRecord",
                EntityId = id,
                Description = $"{GetString(e, "readerName")} - {GetString(e, "bookTitle")}",
                Payload = e.GetRawText(),
                OccurredAt = GetDate(e, "borrowDate") ?? DateTime.UtcNow,
                ConsumedAt = DateTime.UtcNow
            });
            added++;
        }

        if (added > 0) await db.SaveChangesAsync();
        return Ok(new SyncEventsResultDto(0, added, DateTime.UtcNow));
    }

    [HttpGet("events")]
    public async Task<IActionResult> ConsumedEvents([FromQuery] string? sourceService)
    {
        var query = db.ConsumedEvents.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(sourceService)) query = query.Where(x => x.SourceService == sourceService);
        return Ok(await query.OrderByDescending(x => x.ConsumedAt).Take(200).ToListAsync());
    }

    private async Task<List<JsonElement>> GetArrayFromService(string serviceName, string path)
    {
        try
        {
            var baseUrl = configuration[$"ServiceUrls:{serviceName}"] ?? serviceName switch
            {
                "CatalogService" => "http://catalog-service:5001",
                "CirculationService" => "http://circulation-service:5002",
                _ => string.Empty
            };
            if (string.IsNullOrWhiteSpace(baseUrl)) return new List<JsonElement>();

            var client = httpClientFactory.CreateClient();
            var response = await client.GetAsync($"{baseUrl.TrimEnd('/')}/{path.TrimStart('/')}");
            if (!response.IsSuccessStatusCode) return new List<JsonElement>();

            await using var stream = await response.Content.ReadAsStreamAsync();
            using var document = await JsonDocument.ParseAsync(stream);
            return ToArray(document.RootElement).Select(x => x.Clone()).ToList();
        }
        catch
        {
            return new List<JsonElement>();
        }
    }

    private static IEnumerable<JsonElement> ToArray(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.Array) return element.EnumerateArray();
        if (element.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in new[] { "value", "data", "items", "$values" })
            {
                if (element.TryGetProperty(property, out var array) && array.ValueKind == JsonValueKind.Array)
                    return array.EnumerateArray();
            }
        }
        return Enumerable.Empty<JsonElement>();
    }

    private static List<JsonElement> GetArray(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return new List<JsonElement>();
        return ToArray(value).Select(x => x.Clone()).ToList();
    }

    private static object BuildFineRevenueReport(List<JsonElement> fines, DateTime? from, DateTime? to)
    {
        var query = fines.Where(x =>
        {
            var date = GetDate(x, "createdAt") ?? GetDate(x, "updatedAt") ?? DateTime.UtcNow;
            return (!from.HasValue || date >= from.Value) && (!to.HasValue || date <= to.Value);
        }).ToList();

        var total = query.Sum(x => GetDecimal(x, "amount") ?? GetDecimal(x, "totalAmount") ?? 0);
        var collected = query.Where(IsPaidFine).Sum(x => GetDecimal(x, "amount") ?? GetDecimal(x, "paidAmount") ?? 0);
        return new
        {
            totalFine = total,
            collected,
            unpaid = Math.Max(0, total - collected),
            count = query.Count
        };
    }

    private static bool IsCopyAvailable(JsonElement x)
    {
        var status = (GetString(x, "status") ?? GetString(x, "borrowStatus") ?? string.Empty).ToLowerInvariant();
        var condition = (GetString(x, "condition") ?? string.Empty).ToLowerInvariant();
        return (status == "available" || status.Contains("có thể") || status.Contains("co the")) &&
               !condition.Contains("hỏng") && !condition.Contains("hong") && !condition.Contains("mất") && !condition.Contains("mat");
    }

    private static bool IsCopyBorrowed(JsonElement x)
    {
        var status = (GetString(x, "status") ?? GetString(x, "borrowStatus") ?? string.Empty).ToLowerInvariant();
        return status == "borrowed" || status.Contains("đang") || status.Contains("dang");
    }

    private static bool IsReturned(JsonElement x)
    {
        var status = (GetString(x, "status") ?? string.Empty).ToLowerInvariant();
        return status == "returned" || status.Contains("trả") || status.Contains("tra");
    }

    private static bool IsPaidFine(JsonElement x)
    {
        var status = (GetString(x, "status") ?? string.Empty).ToLowerInvariant();
        return status == "paid" || status.Contains("đã") || status.Contains("da thanh toan");
    }

    private static string? GetString(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return null;
        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString(),
            JsonValueKind.Number => value.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => value.ToString()
        };
    }

    private static int? GetInt(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return null;
        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var number)) return number;
        if (value.ValueKind == JsonValueKind.String && int.TryParse(value.GetString(), out number)) return number;
        return null;
    }

    private static decimal? GetDecimal(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return null;
        if (value.ValueKind == JsonValueKind.Number && value.TryGetDecimal(out var number)) return number;
        if (value.ValueKind == JsonValueKind.String && decimal.TryParse(value.GetString(), out number)) return number;
        return null;
    }

    private static DateTime? GetDate(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return null;
        if (value.ValueKind == JsonValueKind.String && DateTime.TryParse(value.GetString(), out var date)) return date;
        return null;
    }
}
