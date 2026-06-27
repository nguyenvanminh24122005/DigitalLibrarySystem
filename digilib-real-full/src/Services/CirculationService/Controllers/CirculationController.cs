using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CirculationService.Data;
using CirculationService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Controllers;

[ApiController]
[Authorize]
public sealed class CirculationController(CirculationDbContext db, IHttpClientFactory httpClientFactory, IConfiguration configuration, IHttpContextAccessor httpContextAccessor) : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    [HttpGet("api/borrow-tickets")]
    public async Task<IActionResult> GetBorrowTickets([FromQuery] BorrowTicketStatus? status, [FromQuery] string? readerCode)
    {
        var query = db.BorrowTickets.Include(x => x.Items).AsQueryable();
        if (status.HasValue) query = query.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(readerCode))
        {
            var code = readerCode.Trim();
            query = query.Where(x => x.ReaderCode == code);
        }
        return Ok(await query.OrderByDescending(x => x.CreatedAt).ToListAsync());
    }

    [HttpGet("api/borrow-tickets/{id:guid}")]
    public async Task<IActionResult> GetBorrowTicket(Guid id)
    {
        var ticket = await db.BorrowTickets.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == id);
        return ticket is null ? NotFound() : Ok(ticket);
    }

    [HttpPost("api/borrow-tickets")]
    public async Task<IActionResult> CreateBorrowTicket(CreateBorrowTicketRequest request)
    {
        var items = request.Items?.ToList() ?? new List<CreateBorrowItemRequest>();
        if (string.IsNullOrWhiteSpace(request.ReaderCode)) return BadRequest("Mã độc giả là bắt buộc.");
        if (!items.Any()) return BadRequest("Phiếu mượn phải có ít nhất một bản sao sách.");

        var cardStatus = await GetCardStatus(request.ReaderCode.Trim());
        if (cardStatus is null) return BadRequest("Không kiểm tra được trạng thái thẻ thư viện của độc giả.");
        if (!cardStatus.CanBorrow) return BadRequest($"Không thể cho mượn: {cardStatus.Message}");
        if (items.Count > cardStatus.BorrowLimit) return BadRequest($"Vượt giới hạn mượn của thẻ thư viện. Giới hạn hiện tại: {cardStatus.BorrowLimit} sách.");

        var ticketCode = $"PM{await db.BorrowTickets.CountAsync() + 1:000000}";
        var borrowDate = request.BorrowDate ?? DateTime.UtcNow;
        var dueDate = request.DueDate ?? borrowDate.AddDays(14);
        var ticket = new BorrowTicket
        {
            TicketCode = ticketCode,
            ReaderId = cardStatus.ReaderId,
            ReaderCode = request.ReaderCode.Trim(),
            ReaderName = string.IsNullOrWhiteSpace(request.ReaderName) ? cardStatus.ReaderName : request.ReaderName.Trim(),
            BorrowDate = borrowDate,
            DueDate = dueDate,
            Status = BorrowTicketStatus.Borrowing,
            LibrarianId = request.LibrarianId ?? Guid.Empty,
            LibrarianName = string.IsNullOrWhiteSpace(request.LibrarianName) ? User.Identity?.Name ?? "Thủ thư" : request.LibrarianName.Trim(),
            Note = request.Note,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var itemRequest in items)
        {
            var copy = await GetCopy(itemRequest.CopyId);
            if (copy is null) return BadRequest($"Không tìm thấy bản sao {itemRequest.CopyId}.");
            if (!IsAvailableCopy(copy)) return BadRequest($"Bản sao {copy.CopyCode} không sẵn sàng để mượn.");

            ticket.Items.Add(new BorrowTicketItem
            {
                BorrowTicketId = ticket.Id,
                BookId = itemRequest.BookId == Guid.Empty ? copy.BookId : itemRequest.BookId,
                CopyId = itemRequest.CopyId,
                CopyCode = string.IsNullOrWhiteSpace(itemRequest.CopyCode) ? copy.CopyCode : itemRequest.CopyCode.Trim(),
                BookTitle = string.IsNullOrWhiteSpace(itemRequest.BookTitle) ? copy.BookTitle : itemRequest.BookTitle.Trim(),
                DueDate = dueDate,
                ItemStatus = BorrowTicketStatus.Borrowing,
                FineAmount = 0
            });
        }

        db.BorrowTickets.Add(ticket);
        db.CirculationLogs.Add(new CirculationLog { Action = "Tạo phiếu mượn", BorrowTicketCode = ticket.TicketCode, ReaderCode = ticket.ReaderCode, LibrarianName = ticket.LibrarianName, Description = $"Tạo phiếu mượn {ticket.TicketCode} cho {ticket.ReaderName}" });
        await db.SaveChangesAsync();

        foreach (var item in ticket.Items)
        {
            await UpdateCopyStatus(item.CopyId, 2, item.CopyCode, ticket.TicketCode, "Đang mượn");
        }

        var created = await db.BorrowTickets.Include(x => x.Items).FirstAsync(x => x.Id == ticket.Id);
        return CreatedAtAction(nameof(GetBorrowTicket), new { id = ticket.Id }, created);
    }

    [HttpPost("api/borrow-tickets/{id:guid}/return")]
    public async Task<IActionResult> ReturnBorrowTicket(Guid id, ReturnBorrowTicketRequest request)
    {
        var ticket = await db.BorrowTickets.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == id);
        if (ticket is null) return NotFound();
        var selectedIds = request.ItemIds?.ToHashSet() ?? new HashSet<Guid>();
        var items = selectedIds.Any() ? ticket.Items.Where(x => selectedIds.Contains(x.Id)).ToList() : ticket.Items.Where(x => x.ItemStatus != BorrowTicketStatus.Returned).ToList();
        if (!items.Any()) return BadRequest("Không có sách nào cần trả.");

        var now = DateTime.UtcNow;
        var finePerDay = decimal.TryParse(configuration["FinePerDay"], out var configFine) ? configFine : 2000m;
        var totalFine = 0m;
        foreach (var item in items)
        {
            item.ReturnedDate = now;
            item.ItemStatus = BorrowTicketStatus.Returned;
            var overdueDays = Math.Max(0, (now.Date - item.DueDate.Date).Days);
            item.FineAmount = overdueDays * finePerDay;
            totalFine += item.FineAmount;
            await UpdateCopyStatus(item.CopyId, 1, item.CopyCode, null, "Đã trả");
        }

        if (ticket.Items.All(x => x.ItemStatus == BorrowTicketStatus.Returned))
        {
            ticket.Status = BorrowTicketStatus.Returned;
            ticket.ReturnDate = now;
        }
        else if (ticket.DueDate < now)
        {
            ticket.Status = BorrowTicketStatus.Overdue;
        }
        ticket.UpdatedAt = now;

        if (totalFine > 0)
        {
            var existingFine = await db.Fines.FirstOrDefaultAsync(x => x.BorrowTicketId == ticket.Id && x.Status != FineStatus.Cancelled);
            if (existingFine is null)
            {
                db.Fines.Add(new Fine
                {
                    FineCode = $"PP{await db.Fines.CountAsync() + 1:000000}",
                    BorrowTicketId = ticket.Id,
                    ReaderId = ticket.ReaderId,
                    ReaderCode = ticket.ReaderCode,
                    ReaderName = ticket.ReaderName,
                    TotalAmount = totalFine,
                    PaidAmount = 0,
                    RemainingAmount = totalFine,
                    Status = FineStatus.Unpaid,
                    CreatedAt = now
                });
            }
            else
            {
                existingFine.TotalAmount += totalFine;
                existingFine.RemainingAmount = Math.Max(0, existingFine.TotalAmount - existingFine.PaidAmount);
                existingFine.Status = existingFine.RemainingAmount == 0 ? FineStatus.Paid : existingFine.PaidAmount > 0 ? FineStatus.PartiallyPaid : FineStatus.Unpaid;
            }
        }

        db.CirculationLogs.Add(new CirculationLog { Action = "Trả sách", BorrowTicketCode = ticket.TicketCode, ReaderCode = ticket.ReaderCode, LibrarianName = User.Identity?.Name ?? ticket.LibrarianName, Description = $"Trả {items.Count} bản sao của phiếu {ticket.TicketCode}. Phí phạt: {totalFine:N0}đ" });
        await db.SaveChangesAsync();
        return Ok(ticket);
    }


    [HttpPost("api/borrow-tickets/{id:guid}/renew")]
    public async Task<IActionResult> RenewBorrowTicket(Guid id, RenewBorrowTicketRequest request)
    {
        var ticket = await db.BorrowTickets.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == id);
        if (ticket is null) return NotFound();
        if (ticket.Status is BorrowTicketStatus.Returned or BorrowTicketStatus.Cancelled)
            return BadRequest("Phiếu mượn đã kết thúc, không thể gia hạn.");

        var days = request.ExtendDays <= 0 ? 7 : Math.Min(request.ExtendDays, 30);
        var selectedIds = request.ItemIds?.ToHashSet() ?? new HashSet<Guid>();
        var items = selectedIds.Any()
            ? ticket.Items.Where(x => selectedIds.Contains(x.Id) && x.ItemStatus != BorrowTicketStatus.Returned).ToList()
            : ticket.Items.Where(x => x.ItemStatus != BorrowTicketStatus.Returned).ToList();

        if (!items.Any()) return BadRequest("Không có sách nào đủ điều kiện gia hạn.");

        var now = DateTime.UtcNow;
        foreach (var item in items)
        {
            var baseDate = item.DueDate > now ? item.DueDate : now;
            item.DueDate = baseDate.AddDays(days);
            item.Note = string.IsNullOrWhiteSpace(request.Note) ? item.Note : request.Note.Trim();
        }

        ticket.DueDate = ticket.Items.Where(x => x.ItemStatus != BorrowTicketStatus.Returned).Select(x => x.DueDate).DefaultIfEmpty(ticket.DueDate).Max();
        if (ticket.Status == BorrowTicketStatus.Overdue && ticket.DueDate >= now) ticket.Status = BorrowTicketStatus.Borrowing;
        ticket.UpdatedAt = now;

        db.CirculationLogs.Add(new CirculationLog
        {
            Action = "Gia hạn sách",
            BorrowTicketCode = ticket.TicketCode,
            ReaderCode = ticket.ReaderCode,
            LibrarianName = User.Identity?.Name ?? ticket.LibrarianName,
            Description = $"Gia hạn {items.Count} sách trong phiếu {ticket.TicketCode} thêm {days} ngày"
        });

        await db.SaveChangesAsync();
        var updated = await db.BorrowTickets.Include(x => x.Items).FirstAsync(x => x.Id == id);
        return Ok(updated);
    }

    [HttpGet("api/overdue")]
    public async Task<IActionResult> GetOverdue([FromQuery] string? readerCode)
    {
        var query = db.BorrowTickets
            .Include(x => x.Items)
            .Where(x => x.Status == BorrowTicketStatus.Overdue || x.DueDate < DateTime.UtcNow && x.Status == BorrowTicketStatus.Borrowing);
        if (!string.IsNullOrWhiteSpace(readerCode))
        {
            var code = readerCode.Trim();
            query = query.Where(x => x.ReaderCode == code);
        }
        return Ok(await query.OrderByDescending(x => x.DueDate).ToListAsync());
    }

    [HttpGet("api/fines")]
    public async Task<IActionResult> GetFines([FromQuery] FineStatus? status, [FromQuery] string? readerCode)
    {
        var query = db.Fines.AsQueryable();
        if (status.HasValue) query = query.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(readerCode))
        {
            var code = readerCode.Trim();
            query = query.Where(x => x.ReaderCode == code);
        }
        return Ok(await query.OrderByDescending(x => x.CreatedAt).ToListAsync());
    }

    [HttpGet("api/fines/{id:guid}")]
    public async Task<IActionResult> GetFine(Guid id)
    {
        var fine = await db.Fines.FindAsync(id);
        return fine is null ? NotFound() : Ok(fine);
    }

    [HttpPost("api/fines/{id:guid}/pay")]
    public async Task<IActionResult> PayFine(Guid id, PayFineRequest request)
    {
        var fine = await db.Fines.FindAsync(id);
        if (fine is null) return NotFound();
        if (request.Amount <= 0) return BadRequest("Số tiền thanh toán phải lớn hơn 0.");
        fine.PaidAmount += request.Amount;
        fine.RemainingAmount = Math.Max(0, fine.TotalAmount - fine.PaidAmount);
        fine.Status = fine.RemainingAmount == 0 ? FineStatus.Paid : FineStatus.PartiallyPaid;
        fine.PaidAt = fine.Status == FineStatus.Paid ? DateTime.UtcNow : fine.PaidAt;
        db.CirculationLogs.Add(new CirculationLog { Action = "Thanh toán phí phạt", BorrowTicketCode = fine.FineCode, ReaderCode = fine.ReaderCode, LibrarianName = User.Identity?.Name ?? "Admin", Description = $"Thanh toán {request.Amount:N0}đ cho phiếu phạt {fine.FineCode}" });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("api/circulation/history")]
    public async Task<IActionResult> GetHistory() => Ok(await db.CirculationLogs.OrderByDescending(x => x.CreatedAt).Take(100).ToListAsync());

    [HttpGet("api/circulation/reports/summary")]
    public async Task<IActionResult> Summary()
    {
        var totalBorrowing = await db.BorrowTickets.CountAsync(x => x.Status == BorrowTicketStatus.Borrowing);
        var totalOverdue = await db.BorrowTickets.CountAsync(x => x.Status == BorrowTicketStatus.Overdue || x.DueDate < DateTime.UtcNow && x.Status == BorrowTicketStatus.Borrowing);
        var totalFines = await db.Fines.SumAsync(x => x.TotalAmount);
        var fineCollected = await db.Fines.SumAsync(x => x.PaidAmount);
        return Ok(new { totalBorrowing, totalOverdue, totalFines, fineCollected });
    }

    private async Task<CardStatusResponse?> GetCardStatus(string readerCode)
    {
        var identityUrl = configuration["ServiceUrls:IdentityReportService"] ?? "http://identity-report-service:8080";
        return await GetJson<CardStatusResponse>($"{identityUrl.TrimEnd('/')}/api/cards/validate/{Uri.EscapeDataString(readerCode)}");
    }

    private async Task<CopyResponse?> GetCopy(Guid copyId)
    {
        var catalogUrl = configuration["ServiceUrls:CatalogService"] ?? "http://catalog-service:8080";
        return await GetJson<CopyResponse>($"{catalogUrl.TrimEnd('/')}/api/copies/{copyId}");
    }

    private async Task<T?> GetJson<T>(string url)
    {
        var client = httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        AddAuth(request);
        var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode) return default;
        await using var stream = await response.Content.ReadAsStreamAsync();
        return await JsonSerializer.DeserializeAsync<T>(stream, JsonOptions);
    }

    private async Task UpdateCopyStatus(Guid copyId, int borrowStatus, string copyCode, string? ticketCode, string note)
    {
        var copy = await GetCopy(copyId);
        if (copy is null) return;
        var catalogUrl = configuration["ServiceUrls:CatalogService"] ?? "http://catalog-service:8080";
        var payload = new
        {
            shelfLocation = copy.ShelfLocation,
            condition = copy.Condition,
            borrowStatus,
            currentBorrowTicketCode = ticketCode,
            note
        };
        var client = httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Put, $"{catalogUrl.TrimEnd('/')}/api/copies/{copyId}")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        AddAuth(request);
        await client.SendAsync(request);
    }

    private void AddAuth(HttpRequestMessage request)
    {
        var auth = httpContextAccessor.HttpContext?.Request.Headers.Authorization.ToString();
        if (!string.IsNullOrWhiteSpace(auth)) request.Headers.Authorization = AuthenticationHeaderValue.Parse(auth);
    }

    private static bool IsAvailableCopy(CopyResponse copy) => IsStatus(copy.BorrowStatus, 1, "Available") && IsStatus(copy.Condition, 1, "Good");
    private static bool IsStatus(JsonElement value, int numeric, string text)
    {
        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var n)) return n == numeric;
        if (value.ValueKind == JsonValueKind.String) return string.Equals(value.GetString(), text, StringComparison.OrdinalIgnoreCase);
        return false;
    }
}

public sealed record PayFineRequest(decimal Amount, string? PaymentMethod);
public sealed record CreateBorrowTicketRequest(Guid? ReaderId, string ReaderCode, string? ReaderName, Guid? LibrarianId, string? LibrarianName, DateTime? BorrowDate, DateTime? DueDate, IEnumerable<CreateBorrowItemRequest>? Items, string? Note);
public sealed record CreateBorrowItemRequest(Guid BookId, Guid CopyId, string? CopyCode, string? BookTitle);
public sealed record ReturnBorrowTicketRequest(IEnumerable<Guid>? ItemIds, string? Note);
public sealed record RenewBorrowTicketRequest(IEnumerable<Guid>? ItemIds, int ExtendDays, string? Note);
public sealed record CardStatusResponse(Guid ReaderId, string ReaderCode, string ReaderName, string? CardNumber, JsonElement ReaderStatus, JsonElement? CardStatus, DateTime? ExpiredAt, int BorrowLimit, bool CanBorrow, string Message);
public sealed record CopyResponse(Guid Id, Guid BookId, string BookTitle, string ISBN, string CopyCode, string ShelfLocation, JsonElement Condition, JsonElement BorrowStatus, string? CurrentBorrowTicketCode, string? Note, DateTime CreatedAt, DateTime UpdatedAt);
