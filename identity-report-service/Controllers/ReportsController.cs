using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Text.Json;
using IdentityReportService.Common;
using IdentityReportService.Data;
using IdentityReportService.Dtos;
using IdentityReportService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace IdentityReportService.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = AppRoles.AdminOrReporter)]
public sealed class ReportsController(IdentityReportDbContext db, IHttpClientFactory httpClientFactory, IConfiguration configuration, IHttpContextAccessor httpContextAccessor) : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    [HttpGet("overview")]
    public async Task<ActionResult<OverviewReportDto>> Overview()
    {
        var books = await GetArrayFromService("CatalogService", "/api/books");
        var copies = await GetArrayFromService("CatalogService", "/api/copies");
        var tickets = await GetArrayFromService("CirculationService", "/api/borrow-tickets");
        var overdue = await GetArrayFromService("CirculationService", "/api/overdue");

        var activeReaders = await db.Readers.CountAsync(x => x.Status == AccountStatus.Active);
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var borrowCountThisMonth = tickets.Count(x => GetDate(x, "borrowDate") is DateTime borrowDate && borrowDate >= monthStart);

        var daily = Enumerable.Range(0, 30).Select(i =>
        {
            var date = DateTime.UtcNow.Date.AddDays(-29 + i);
            var borrowCount = tickets.Count(x => GetDate(x, "borrowDate")?.Date == date.Date);
            var returnCount = CountReturnedItemsOnDate(x: tickets, date);
            return new DailyBorrowReturnDto(date.ToString("dd/MM"), borrowCount, returnCount);
        }).ToList();

        var available = copies.Count(x => IsCopyAvailable(x));
        var borrowed = copies.Count(x => IsEnum(x, "borrowStatus", 2, "Borrowed"));
        var unavailable = copies.Count - available - borrowed;

        var topBooks = tickets
            .SelectMany(GetItems)
            .Select(x => GetString(x, "bookTitle"))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .GroupBy(x => x!)
            .OrderByDescending(x => x.Count())
            .Take(5)
            .Select(x => new NameValueDto(x.Key, x.Count()))
            .ToList();

        if (!topBooks.Any())
        {
            topBooks = books.Take(5).Select(x => new NameValueDto(GetString(x, "title") ?? "Sách", GetInt(x, "borrowedCopies") ?? 0)).ToList();
        }

        var topReaders = tickets
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
                new NameValueDto("Không sẵn sàng", Math.Max(0, unavailable))
            },
            TopBooks: topBooks,
            TopReaders: topReaders
        ));
    }


    // Alias theo tiêu chí chấm: /statistics
    [HttpGet("/api/statistics")]
    public async Task<ActionResult<OverviewReportDto>> Statistics() => await Overview();

    [HttpGet("books")]
    public async Task<IActionResult> BooksReport()
    {
        var books = await GetArrayFromService("CatalogService", "/api/books");
        var copies = await GetArrayFromService("CatalogService", "/api/copies");
        var byCategory = books
            .Select(x => GetString(x, "categoryName") ?? "Chưa phân loại")
            .GroupBy(x => x)
            .Select(x => new NameValueDto(x.Key, x.Count()))
            .OrderByDescending(x => x.Value)
            .ToList();

        var byYear = books
            .Select(x => GetInt(x, "publishYear") ?? 0)
            .Where(x => x > 0)
            .GroupBy(x => x)
            .OrderBy(x => x.Key)
            .Select(x => new { year = x.Key, value = x.Count() });

        return Ok(new
        {
            totalBooks = books.Count,
            totalCopies = copies.Count,
            availableCopies = copies.Count(IsCopyAvailable),
            borrowedCopies = copies.Count(x => IsEnum(x, "borrowStatus", 2, "Borrowed")),
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
        var tickets = await GetArrayFromService("CirculationService", "/api/borrow-tickets");
        var overdue = await GetArrayFromService("CirculationService", "/api/overdue");
        var fines = await GetArrayFromService("CirculationService", "/api/fines");
        var returnCount = tickets.SelectMany(GetItems).Count(x => GetDate(x, "returnedDate") is not null || IsEnum(x, "itemStatus", 2, "Returned"));
        var fineCollected = fines.Sum(x => GetDecimal(x, "paidAmount") ?? 0);
        var fineTotal = fines.Sum(x => GetDecimal(x, "totalAmount") ?? 0);

        return Ok(new
        {
            borrowCount = tickets.Count,
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

    // Alias theo tiêu chí: /statistics/revenue
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
        var catalogEvents = await GetArrayFromService("CatalogService", "/api/catalog-events?take=500");
        var circulationEvents = await GetArrayFromService("CirculationService", "/api/circulation/history");
        var catalogAdded = 0;
        var circulationAdded = 0;

        foreach (var e in catalogEvents)
        {
            var id = GetString(e, "id") ?? Guid.NewGuid().ToString();
            if (await db.ConsumedEvents.AnyAsync(x => x.SourceService == "CatalogService" && x.ExternalEventId == id)) continue;
            db.ConsumedEvents.Add(new ConsumedEvent
            {
                SourceService = "CatalogService",
                ExternalEventId = id,
                EventType = GetString(e, "eventType") ?? "catalog.event",
                EntityType = GetString(e, "entityType") ?? "Catalog",
                EntityId = GetString(e, "entityId"),
                Description = GetString(e, "description") ?? string.Empty,
                Payload = GetString(e, "payload"),
                OccurredAt = GetDate(e, "createdAt") ?? DateTime.UtcNow,
                ConsumedAt = DateTime.UtcNow
            });
            catalogAdded++;
        }

        foreach (var e in circulationEvents)
        {
            var id = GetString(e, "id") ?? Guid.NewGuid().ToString();
            if (await db.ConsumedEvents.AnyAsync(x => x.SourceService == "CirculationService" && x.ExternalEventId == id)) continue;
            db.ConsumedEvents.Add(new ConsumedEvent
            {
                SourceService = "CirculationService",
                ExternalEventId = id,
                EventType = GetString(e, "action") ?? "circulation.event",
                EntityType = "CirculationLog",
                EntityId = GetString(e, "borrowTicketCode"),
                Description = GetString(e, "description") ?? string.Empty,
                Payload = e.GetRawText(),
                OccurredAt = GetDate(e, "createdAt") ?? DateTime.UtcNow,
                ConsumedAt = DateTime.UtcNow
            });
            circulationAdded++;
        }

        if (catalogAdded + circulationAdded > 0)
        {
            db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Đồng bộ báo cáo", Module = "Identity & Report", TargetType = "ConsumedEvents", Description = $"Đồng bộ {catalogAdded} event Catalog và {circulationAdded} event Circulation" });
        }
        await db.SaveChangesAsync();
        return Ok(new SyncEventsResultDto(catalogAdded, circulationAdded, DateTime.UtcNow));
    }

    [HttpGet("events")]
    public async Task<IActionResult> GetConsumedEvents([FromQuery] string? sourceService, [FromQuery] int take = 100)
    {
        var query = db.ConsumedEvents.AsQueryable();
        if (!string.IsNullOrWhiteSpace(sourceService)) query = query.Where(x => x.SourceService == sourceService);
        take = Math.Clamp(take, 1, 500);
        return Ok(await query.OrderByDescending(x => x.OccurredAt).Take(take).ToListAsync());
    }

    [HttpGet("event-summary")]
    public async Task<IActionResult> EventSummary([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var fromDate = (from ?? DateTime.UtcNow.Date.AddDays(-29)).Date;
        var toDate = (to ?? DateTime.UtcNow.Date).Date;
        if (toDate < fromDate) (fromDate, toDate) = (toDate, fromDate);

        var events = await db.ConsumedEvents
            .Where(x => x.OccurredAt.Date >= fromDate && x.OccurredAt.Date <= toDate)
            .ToListAsync();

        return Ok(new
        {
            from = fromDate,
            to = toDate,
            totalEvents = events.Count,
            catalogEvents = events.Count(x => x.SourceService == "CatalogService"),
            circulationEvents = events.Count(x => x.SourceService == "CirculationService"),
            availabilityChanged = events.Count(x => x.EventType == "book.availability.changed"),
            borrowEvents = events.Count(x => x.EventType.Contains("borrow", StringComparison.OrdinalIgnoreCase) || x.EventType.Contains("mượn", StringComparison.OrdinalIgnoreCase)),
            returnEvents = events.Count(x => x.EventType.Contains("return", StringComparison.OrdinalIgnoreCase) || x.EventType.Contains("trả", StringComparison.OrdinalIgnoreCase)),
            bySource = events.GroupBy(x => x.SourceService).Select(x => new { name = x.Key, value = x.Count() }).OrderByDescending(x => x.value),
            byType = events.GroupBy(x => x.EventType).Select(x => new { name = x.Key, value = x.Count() }).OrderByDescending(x => x.value).Take(10),
            dailyEvents = Enumerable.Range(0, (toDate - fromDate).Days + 1)
                .Select(i =>
                {
                    var d = fromDate.AddDays(i);
                    return new { date = d.ToString("dd/MM"), value = events.Count(x => x.OccurredAt.Date == d) };
                })
        });
    }


    private object BuildFineRevenueReport(List<JsonElement> fines, DateTime? from, DateTime? to)
    {
        var fromDate = (from ?? DateTime.UtcNow.Date.AddDays(-29)).Date;
        var toDate = (to ?? DateTime.UtcNow.Date).Date;
        if (toDate < fromDate) (fromDate, toDate) = (toDate, fromDate);

        var filtered = fines.Where(x =>
        {
            var createdAt = GetDate(x, "createdAt")?.Date ?? DateTime.UtcNow.Date;
            return createdAt >= fromDate && createdAt <= toDate;
        }).ToList();

        var paidFiltered = fines.Where(x =>
        {
            var paidAt = GetDate(x, "paidAt")?.Date;
            return paidAt.HasValue && paidAt.Value >= fromDate && paidAt.Value <= toDate;
        }).ToList();

        var totalFine = filtered.Sum(x => GetDecimal(x, "totalAmount") ?? 0);
        var paidAmount = filtered.Sum(x => GetDecimal(x, "paidAmount") ?? 0);
        var remainingAmount = filtered.Sum(x => GetDecimal(x, "remainingAmount") ?? 0);
        var collectedInRange = paidFiltered.Sum(x => GetDecimal(x, "paidAmount") ?? 0);

        var dailyRevenue = Enumerable.Range(0, (toDate - fromDate).Days + 1)
            .Select(i =>
            {
                var date = fromDate.AddDays(i);
                var value = fines.Where(x => GetDate(x, "paidAt")?.Date == date)
                    .Sum(x => GetDecimal(x, "paidAmount") ?? 0);
                return new { date = date.ToString("dd/MM"), value };
            })
            .ToList();

        return new
        {
            from = fromDate,
            to = toDate,
            totalFine,
            paidAmount,
            collectedInRange,
            remainingAmount,
            fineCount = filtered.Count,
            paidFineCount = filtered.Count(x => IsEnum(x, "status", 3, "Paid")),
            unpaidFineCount = filtered.Count(x => IsEnum(x, "status", 1, "Unpaid")),
            partiallyPaidFineCount = filtered.Count(x => IsEnum(x, "status", 2, "PartiallyPaid")),
            dailyRevenue
        };
    }

    private async Task<List<JsonElement>> GetArrayFromService(string serviceName, string path)
    {
        try
        {
            var baseUrl = configuration[$"ServiceUrls:{serviceName}"] ?? serviceName switch
            {
                "CatalogService" => "http://catalog-service:8080",
                "CirculationService" => "http://circulation-service:8080",
                _ => string.Empty
            };
            if (string.IsNullOrWhiteSpace(baseUrl)) return new List<JsonElement>();
            var client = httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, $"{baseUrl.TrimEnd('/')}/{path.TrimStart('/')}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", CreateServiceToken());
            var response = await client.SendAsync(request);
            if (!response.IsSuccessStatusCode) return new List<JsonElement>();
            await using var stream = await response.Content.ReadAsStreamAsync();
            var document = await JsonDocument.ParseAsync(stream);
            return document.RootElement.ValueKind == JsonValueKind.Array ? document.RootElement.EnumerateArray().Select(x => x.Clone()).ToList() : new List<JsonElement>();
        }
        catch
        {
            return new List<JsonElement>();
        }
    }


    private string CreateServiceToken()
    {
        var secret = configuration["Jwt:Secret"] ?? "THIS_IS_A_DEVELOPMENT_SECRET_KEY_FOR_DIGILIB_ADMIN_2024_MINIMUM_32_CHARS";
        var issuer = configuration["Jwt:Issuer"] ?? "DIGILIB.Identity";
        var audience = configuration["Jwt:Audience"] ?? "DIGILIB.Services";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "Identity Report Service"),
            new Claim(ClaimTypes.Role, AppRoles.Admin),
            new Claim("role", AppRoles.Admin),
            new Claim("scope", "internal-report-read")
        };
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow.AddMinutes(-1),
            expires: DateTime.UtcNow.AddMinutes(10),
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static IEnumerable<JsonElement> GetItems(JsonElement ticket)
    {
        if (ticket.TryGetProperty("items", out var items) && items.ValueKind == JsonValueKind.Array)
            return items.EnumerateArray();
        return Enumerable.Empty<JsonElement>();
    }

    private static bool IsCopyAvailable(JsonElement copy) => IsEnum(copy, "borrowStatus", 1, "Available") && IsEnum(copy, "condition", 1, "Good");

    private static int CountReturnedItemsOnDate(IEnumerable<JsonElement> x, DateTime date) => x.SelectMany(GetItems).Count(item => GetDate(item, "returnedDate")?.Date == date.Date);

    private static string? GetString(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return null;
        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString(),
            JsonValueKind.Number => value.GetRawText(),
            _ => value.ToString()
        };
    }

    private static int? GetInt(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return null;
        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var n)) return n;
        if (value.ValueKind == JsonValueKind.String && int.TryParse(value.GetString(), out var s)) return s;
        return null;
    }

    private static decimal? GetDecimal(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return null;
        if (value.ValueKind == JsonValueKind.Number && value.TryGetDecimal(out var n)) return n;
        if (value.ValueKind == JsonValueKind.String && decimal.TryParse(value.GetString(), out var s)) return s;
        return null;
    }

    private static DateTime? GetDate(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return null;
        if (value.ValueKind == JsonValueKind.String && DateTime.TryParse(value.GetString(), out var date)) return date;
        return null;
    }

    private static bool IsEnum(JsonElement element, string property, int numericValue, string stringValue)
    {
        if (!element.TryGetProperty(property, out var value)) return false;
        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var n)) return n == numericValue;
        if (value.ValueKind == JsonValueKind.String) return string.Equals(value.GetString(), stringValue, StringComparison.OrdinalIgnoreCase);
        return false;
    }
}
