using CatalogService.Data;
using CatalogService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}/profile")]
    public async Task<ActionResult<UserProfile>> GetProfile(string userId)
    {
        var profile = await GetOrCreateProfileAsync(userId);
        return Ok(profile);
    }

    [HttpPut("{userId}/profile")]
    public async Task<ActionResult<UserProfile>> UpdateProfile(string userId, UserProfile request)
    {
        var profile = await GetOrCreateProfileAsync(userId);

        profile.FullName = Blank(request.FullName, profile.FullName);
        profile.Role = Blank(request.Role, profile.Role);
        profile.Avatar = Blank(request.Avatar, profile.Avatar);
        profile.Email = Blank(request.Email, profile.Email);
        profile.Phone = Blank(request.Phone, profile.Phone);
        profile.StudentCode = Blank(request.StudentCode, profile.StudentCode);
        profile.ReaderCode = Blank(request.ReaderCode, profile.ReaderCode);
        profile.Faculty = Blank(request.Faculty, profile.Faculty);
        profile.ClassName = Blank(request.ClassName, profile.ClassName);
        profile.Status = Blank(request.Status, profile.Status);
        profile.Address = Blank(request.Address, profile.Address);
        profile.Gender = Blank(request.Gender, profile.Gender);
        if (request.DateOfBirth.HasValue) profile.DateOfBirth = request.DateOfBirth;
        if (request.JoinedAt != default) profile.JoinedAt = request.JoinedAt;
        if (request.CardExpiredAt != default) profile.CardExpiredAt = request.CardExpiredAt;

        await _context.SaveChangesAsync();
        return Ok(profile);
    }

    [HttpGet("{userId}/favorites")]
    public async Task<IActionResult> GetFavorites(string userId)
    {
        var items = await _context.FavoriteBooks
            .Where(x => x.UserId == userId)
            .Include(x => x.Book)!
            .ThenInclude(b => b.Copies)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(items.Select(x => new
        {
            x.Id,
            x.UserId,
            x.BookId,
            x.CreatedAt,
            book = x.Book
        }));
    }

    [HttpPost("{userId}/favorites/{bookId:int}")]
    public async Task<IActionResult> AddFavorite(string userId, int bookId)
    {
        var existsBook = await _context.Books.AnyAsync(x => x.Id == bookId);
        if (!existsBook) return NotFound(new { message = "Không tìm thấy sách." });

        var existing = await _context.FavoriteBooks.FirstOrDefaultAsync(x => x.UserId == userId && x.BookId == bookId);
        if (existing != null) return Ok(existing);

        var item = new FavoriteBook { UserId = userId, BookId = bookId, CreatedAt = DateTime.UtcNow };
        _context.FavoriteBooks.Add(item);
        await AddNotificationAsync(userId, "favorite", "Đã lưu yêu thích", "Sách đã được thêm vào danh sách yêu thích.", bookId);
        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{userId}/favorites/{bookId:int}")]
    public async Task<IActionResult> RemoveFavorite(string userId, int bookId)
    {
        var item = await _context.FavoriteBooks.FirstOrDefaultAsync(x => x.UserId == userId && x.BookId == bookId);
        if (item == null) return NotFound(new { message = "Sách chưa có trong danh sách yêu thích." });

        _context.FavoriteBooks.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{userId}/borrowings/current")]
    public async Task<IActionResult> GetCurrentBorrowings(string userId)
    {
        var items = await _context.BorrowingRecords
            .Where(x => x.UserId == userId && (x.Status == "Borrowed" || x.Status == "PendingApproval"))
            .Include(x => x.Book)!
            .ThenInclude(b => b.Copies)
            .OrderBy(x => x.DueDate)
            .ToListAsync();

        return Ok(items.Select(ToLoanDto));
    }

    [HttpGet("{userId}/borrowings/history")]
    public async Task<IActionResult> GetBorrowingHistory(string userId)
    {
        var items = await _context.BorrowingRecords
            .Where(x => x.UserId == userId)
            .Include(x => x.Book)!
            .ThenInclude(b => b.Copies)
            .OrderByDescending(x => x.BorrowedAt)
            .ToListAsync();

        return Ok(items.Select(ToLoanDto));
    }

    [HttpPost("{userId}/borrowings")]
    public async Task<IActionResult> BorrowBook(string userId, BorrowBookRequest request)
    {
        var book = await _context.Books.Include(x => x.Copies).FirstOrDefaultAsync(x => x.Id == request.BookId);
        if (book == null) return NotFound(new { message = "Không tìm thấy sách." });

        var copy = await _context.BookCopies.FirstOrDefaultAsync(x => x.BookId == request.BookId && x.Id == request.CopyId);
        copy ??= await _context.BookCopies.FirstOrDefaultAsync(x => x.BookId == request.BookId && x.Status == "Available" && x.Condition != "Hỏng" && x.Condition != "Mất");
        if (copy == null) return NotFound(new { message = "Không tìm thấy bản sao khả dụng." });
        if (!IsCopyAvailable(copy)) return BadRequest(new { message = "Bản sao này hiện không thể mượn." });

        copy.Status = "PendingApproval";
        var now = DateTime.UtcNow;
        var loan = new BorrowingRecord
        {
            LoanCode = $"REQ{now:yyyyMMddHHmmssfff}",
            UserId = userId,
            BookId = book.Id,
            CopyId = copy.Id,
            CopyCode = copy.CopyCode,
            BorrowedAt = now,
            DueDate = now.AddDays(request.Days <= 0 ? 14 : request.Days),
            Status = "PendingApproval",
            Note = request.Note ?? "Yêu cầu mượn đang chờ thủ thư duyệt."
        };
        _context.BorrowingRecords.Add(loan);
        await AddNotificationAsync(userId, "request", "Đã gửi yêu cầu mượn sách", $"Yêu cầu mượn sách \"{book.Title}\" mã bản sao {copy.CopyCode} đang chờ thủ thư duyệt.", book.Id);
        await _context.SaveChangesAsync();

        loan.Book = book;
        loan.Copy = copy;
        return Ok(ToLoanDto(loan));
    }

    [HttpPut("{userId}/borrowings/{loanId:int}/approve")]
    public async Task<IActionResult> ApproveBorrowing(string userId, int loanId)
    {
        var loan = await _context.BorrowingRecords
            .Include(x => x.Book)
            .Include(x => x.Copy)
            .FirstOrDefaultAsync(x => x.Id == loanId && x.UserId == userId);

        if (loan == null) return NotFound(new { message = "Không tìm thấy yêu cầu mượn." });
        if (loan.Status != "PendingApproval") return BadRequest(new { message = "Chỉ duyệt được yêu cầu đang chờ duyệt." });
        if (loan.Copy == null) return BadRequest(new { message = "Không tìm thấy bản sao." });

        loan.Status = "Borrowed";
        loan.LoanCode = string.IsNullOrWhiteSpace(loan.LoanCode) || loan.LoanCode.StartsWith("REQ") ? $"L{DateTime.UtcNow:yyyyMMddHHmmssfff}" : loan.LoanCode;
        loan.BorrowedAt = DateTime.UtcNow;
        loan.DueDate = DateTime.UtcNow.AddDays(14);
        loan.Copy.Status = "Borrowed";

        await AddNotificationAsync(userId, "success", "Yêu cầu mượn đã được duyệt", $"Thủ thư đã duyệt yêu cầu mượn sách \"{loan.Book?.Title ?? ""}\". Bạn có thể đến nhận sách.", loan.BookId);
        await _context.SaveChangesAsync();
        return Ok(ToLoanDto(loan));
    }

    [HttpPut("{userId}/borrowings/{loanId:int}/reject")]
    public async Task<IActionResult> RejectBorrowing(string userId, int loanId, RejectBorrowRequest? request = null)
    {
        var loan = await _context.BorrowingRecords
            .Include(x => x.Book)
            .Include(x => x.Copy)
            .FirstOrDefaultAsync(x => x.Id == loanId && x.UserId == userId);

        if (loan == null) return NotFound(new { message = "Không tìm thấy yêu cầu mượn." });
        if (loan.Status != "PendingApproval") return BadRequest(new { message = "Chỉ từ chối được yêu cầu đang chờ duyệt." });

        loan.Status = "Rejected";
        loan.ReturnedAt = DateTime.UtcNow;
        loan.Note = string.IsNullOrWhiteSpace(request?.Reason) ? "Yêu cầu mượn bị từ chối bởi thủ thư." : request!.Reason!;
        if (loan.Copy != null) loan.Copy.Status = "Available";

        await AddNotificationAsync(userId, "warning", "Yêu cầu mượn bị từ chối", $"Yêu cầu mượn sách \"{loan.Book?.Title ?? ""}\" bị từ chối. {loan.Note}", loan.BookId);
        await _context.SaveChangesAsync();
        return Ok(ToLoanDto(loan));
    }

    [HttpPut("{userId}/borrowings/{loanId:int}/return")]
    public async Task<IActionResult> ReturnBook(string userId, int loanId)
    {
        var loan = await _context.BorrowingRecords
            .Include(x => x.Book)
            .Include(x => x.Copy)
            .FirstOrDefaultAsync(x => x.Id == loanId && x.UserId == userId);
        if (loan == null) return NotFound(new { message = "Không tìm thấy phiếu mượn." });
        if (loan.Status != "Borrowed") return BadRequest(new { message = "Phiếu mượn này đã hoàn tất." });

        var now = DateTime.UtcNow;
        loan.ReturnedAt = now;
        loan.Status = now.Date > loan.DueDate.Date ? "OverdueReturned" : "Returned";
        var overdueDays = Math.Max(0, (now.Date - loan.DueDate.Date).Days);
        loan.FineAmount = overdueDays * 2000;

        if (loan.Copy != null)
        {
            loan.Copy.Status = loan.Copy.Condition == "Hỏng" ? "Damaged" : loan.Copy.Condition == "Mất" ? "Lost" : "Available";
        }

        await AddNotificationAsync(userId, "success", "Trả sách thành công", $"Bạn đã trả sách \"{loan.Book?.Title ?? ""}\".", loan.BookId);
        await _context.SaveChangesAsync();
        return Ok(ToLoanDto(loan));
    }

    [HttpPut("{userId}/borrowings/{loanId:int}/renew")]
    public async Task<IActionResult> RenewBorrowing(string userId, int loanId)
    {
        var loan = await _context.BorrowingRecords
            .Include(x => x.Book)
            .Include(x => x.Copy)
            .FirstOrDefaultAsync(x => x.Id == loanId && x.UserId == userId);
        if (loan == null) return NotFound(new { message = "Không tìm thấy phiếu mượn." });
        if (loan.Status != "Borrowed") return BadRequest(new { message = "Chỉ có thể gia hạn sách đang mượn." });
        if (loan.RenewCount >= 1) return BadRequest(new { message = "Mỗi cuốn chỉ được gia hạn tối đa 1 lần." });

        loan.DueDate = loan.DueDate.AddDays(7);
        loan.RenewCount += 1;
        await AddNotificationAsync(userId, "success", "Gia hạn mượn sách thành công", $"Sách \"{loan.Book?.Title ?? ""}\" đã được gia hạn thêm 7 ngày.", loan.BookId);
        await _context.SaveChangesAsync();
        return Ok(ToLoanDto(loan));
    }

    [HttpGet("{userId}/notifications")]
    public async Task<IActionResult> GetNotifications(string userId)
    {
        await EnsureDueNotificationsAsync(userId);
        var items = await _context.Notifications
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
        return Ok(items);
    }

    [HttpPut("{userId}/notifications/{notificationId:int}/read")]
    public async Task<IActionResult> MarkNotificationRead(string userId, int notificationId)
    {
        var item = await _context.Notifications.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == notificationId);
        if (item == null) return NotFound(new { message = "Không tìm thấy thông báo." });
        item.IsRead = true;
        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpPut("{userId}/notifications/read-all")]
    public async Task<IActionResult> MarkAllNotificationsRead(string userId)
    {
        var items = await _context.Notifications.Where(x => x.UserId == userId && !x.IsRead).ToListAsync();
        foreach (var item in items) item.IsRead = true;
        await _context.SaveChangesAsync();
        return Ok(new { updated = items.Count });
    }

    [HttpGet("{userId}/reading-progress")]
    public async Task<IActionResult> GetReadingProgress(string userId)
    {
        var items = await _context.ReadingProgressRecords.Where(x => x.UserId == userId).ToListAsync();
        return Ok(items);
    }

    [HttpPut("{userId}/reading-progress/{bookId:int}")]
    public async Task<IActionResult> UpdateReadingProgress(string userId, int bookId, UpdateReadingProgressRequest request)
    {
        var existsBook = await _context.Books.AnyAsync(x => x.Id == bookId);
        if (!existsBook) return NotFound(new { message = "Không tìm thấy sách." });

        var progress = await _context.ReadingProgressRecords.FirstOrDefaultAsync(x => x.UserId == userId && x.BookId == bookId);
        if (progress == null)
        {
            progress = new ReadingProgressRecord { UserId = userId, BookId = bookId };
            _context.ReadingProgressRecords.Add(progress);
        }

        progress.Progress = Math.Clamp(request.Progress, 0, 100);
        progress.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(progress);
    }

    private async Task<UserProfile> GetOrCreateProfileAsync(string userId)
    {
        var profile = await _context.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userId);
        if (profile != null) return profile;

        profile = new UserProfile { UserId = userId, JoinedAt = DateTime.UtcNow.AddYears(-3), CardExpiredAt = DateTime.UtcNow.AddYears(1) };
        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync();
        return profile;
    }

    private async Task AddNotificationAsync(string userId, string type, string title, string message, int? relatedBookId = null)
    {
        _context.Notifications.Add(new NotificationItem
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            RelatedBookId = relatedBookId,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        });
        await Task.CompletedTask;
    }

    private async Task EnsureDueNotificationsAsync(string userId)
    {
        var now = DateTime.UtcNow.Date;
        var loans = await _context.BorrowingRecords
            .Include(x => x.Book)
            .Where(x => x.UserId == userId && x.Status == "Borrowed")
            .ToListAsync();

        foreach (var loan in loans)
        {
            var days = (loan.DueDate.Date - now).Days;
            if (days <= 2)
            {
                var exists = await _context.Notifications.AnyAsync(x => x.UserId == userId && x.RelatedBookId == loan.BookId && x.Type == "due" && x.Message.Contains(loan.LoanCode));
                if (!exists)
                {
                    _context.Notifications.Add(new NotificationItem
                    {
                        UserId = userId,
                        Type = "due",
                        Title = days < 0 ? $"Sách \"{loan.Book?.Title}\" đã quá hạn" : $"Sách \"{loan.Book?.Title}\" sắp đến hạn trả",
                        Message = days < 0 ? $"Mã phiếu {loan.LoanCode} đã quá hạn {Math.Abs(days)} ngày." : $"Mã phiếu {loan.LoanCode} còn {days} ngày đến hạn trả.",
                        RelatedBookId = loan.BookId,
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    });
                }
            }
        }
        await _context.SaveChangesAsync();
    }

    private static bool IsCopyAvailable(BookCopy copy)
    {
        var status = (copy.Status ?? string.Empty).Trim().ToLowerInvariant();
        var condition = (copy.Condition ?? string.Empty).Trim().ToLowerInvariant();
        var statusAvailable = status == "available" || status.Contains("có thể") || status.Contains("co the");
        var conditionOk = !condition.Contains("hỏng") && !condition.Contains("hong") && !condition.Contains("mất") && !condition.Contains("mat");
        return statusAvailable && conditionOk;
    }

    private static object ToLoanDto(BorrowingRecord loan)
    {
        return new
        {
            loanId = loan.Id,
            loanCode = loan.LoanCode,
            loan.UserId,
            loan.BookId,
            copyId = loan.CopyId,
            barcode = string.IsNullOrWhiteSpace(loan.CopyCode) ? loan.Copy?.CopyCode : loan.CopyCode,
            borrowedAt = loan.BorrowedAt,
            dueDate = loan.DueDate,
            returnedAt = loan.ReturnedAt,
            loan.Status,
            renewed = loan.RenewCount > 0,
            loan.RenewCount,
            loan.FineAmount,
            location = "Kho A - Kệ 01",
            book = loan.Book
        };
    }

    private static string Blank(string? value, string fallback) => string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
}

public record BorrowBookRequest(int BookId, int CopyId, int Days = 14, string? Note = null);
public record RejectBorrowRequest(string? Reason = null);
public record UpdateReadingProgressRequest(int Progress);
