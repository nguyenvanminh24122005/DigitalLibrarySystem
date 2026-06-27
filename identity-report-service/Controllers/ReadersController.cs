using System.Security.Claims;
using IdentityReportService.Common;
using IdentityReportService.Data;
using IdentityReportService.Dtos;
using IdentityReportService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Controllers;

[ApiController]
[Route("api/readers")]
[Authorize]
public sealed class ReadersController(IdentityReportDbContext db) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<IEnumerable<ReaderDto>>> GetReaders([FromQuery] string? q, [FromQuery] AccountStatus? status, [FromQuery] string? gender, [FromQuery] string? cardStatus)
    {
        var query = db.Readers.Include(x => x.LibraryCard).AsQueryable();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var keyword = q.Trim();
            query = query.Where(x => x.FullName.Contains(keyword) || x.Email.Contains(keyword) || x.ReaderCode.Contains(keyword) || (x.Phone != null && x.Phone.Contains(keyword)) || (x.LibraryCard != null && x.LibraryCard.CardNumber.Contains(keyword)));
        }
        if (status.HasValue) query = query.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(gender)) query = query.Where(x => x.Gender == gender);
        if (!string.IsNullOrWhiteSpace(cardStatus))
        {
            var normalized = cardStatus.Trim().ToLower();
            query = normalized switch
            {
                "valid" or "active" => query.Where(x => x.LibraryCard != null && x.LibraryCard.Status == AccountStatus.Active && x.LibraryCard.ExpiredAt >= DateTime.UtcNow && x.Status == AccountStatus.Active),
                "expired" => query.Where(x => x.LibraryCard != null && x.LibraryCard.ExpiredAt < DateTime.UtcNow),
                "locked" => query.Where(x => x.LibraryCard != null && x.LibraryCard.Status == AccountStatus.Locked),
                "missing" => query.Where(x => x.LibraryCard == null),
                _ => query
            };
        }

        var readers = await query.OrderByDescending(x => x.CreatedAt).ToListAsync();
        return Ok(readers.Select(ToDto));
    }

    [HttpGet("me")]
    [Authorize(Roles = AppRoles.ReaderOnly)]
    public async Task<ActionResult<ReaderDto>> GetMyReaderProfile()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var reader = await db.Readers
            .Include(x => x.LibraryCard)
            .FirstOrDefaultAsync(x => x.UserId == userId.Value);

        return reader is null ? NotFound("Tài khoản hiện tại chưa có hồ sơ độc giả.") : Ok(ToDto(reader));
    }

    [HttpPut("me")]
    [Authorize(Roles = AppRoles.ReaderOnly)]
    public async Task<IActionResult> UpdateMyReaderProfile(UpdateMyReaderRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();
        if (string.IsNullOrWhiteSpace(request.FullName)) return BadRequest("Họ tên không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest("Email không được để trống.");

        var reader = await db.Readers.Include(x => x.User).FirstOrDefaultAsync(x => x.UserId == userId.Value);
        if (reader is null) return NotFound("Tài khoản hiện tại chưa có hồ sơ độc giả.");

        var email = request.Email.Trim().ToLower();
        if (await db.Readers.AnyAsync(x => x.Id != reader.Id && x.Email.ToLower() == email)) return Conflict("Email độc giả đã tồn tại.");
        if (await db.Users.AnyAsync(x => x.Id != userId.Value && x.Email.ToLower() == email)) return Conflict("Email này đã được sử dụng bởi tài khoản khác.");

        reader.FullName = request.FullName.Trim();
        reader.Email = email;
        reader.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        reader.DateOfBirth = request.DateOfBirth;
        reader.Gender = request.Gender;
        reader.Address = request.Address;
        reader.UpdatedAt = DateTime.UtcNow;

        if (reader.User is not null)
        {
            reader.User.FullName = reader.FullName;
            reader.User.Email = reader.Email;
            reader.User.Phone = reader.Phone;
            reader.User.UpdatedAt = DateTime.UtcNow;
        }

        db.SystemLogs.Add(new SystemLog
        {
            UserId = userId.Value,
            ActorName = reader.FullName,
            Action = "Cập nhật hồ sơ cá nhân",
            Module = "Identity & Report",
            TargetType = "Độc giả",
            TargetId = reader.Id.ToString(),
            Description = $"Độc giả {reader.ReaderCode} cập nhật hồ sơ cá nhân",
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
        });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("me/card")]
    [Authorize(Roles = AppRoles.ReaderOnly)]
    public async Task<ActionResult<LibraryCardDto>> GetMyCard()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();
        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.UserId == userId.Value);
        if (reader is null) return NotFound("Tài khoản hiện tại chưa có hồ sơ độc giả.");
        if (reader.LibraryCard is null) return NotFound("Độc giả chưa có thẻ thư viện.");
        return Ok(ToCardDto(reader, reader.LibraryCard));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<ReaderDto>> GetReader(Guid id)
    {
        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.Id == id);
        return reader is null ? NotFound() : Ok(ToDto(reader));
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<ReaderDto>> CreateReader(CreateReaderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName)) return BadRequest("Họ tên độc giả không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest("Email độc giả không được để trống.");

        var email = request.Email.Trim().ToLower();
        if (await db.Readers.AnyAsync(x => x.Email.ToLower() == email)) return Conflict("Email độc giả đã tồn tại.");

        await using var transaction = await db.Database.BeginTransactionAsync();
        var readerCode = await GenerateReaderCodeAsync();
        var reader = new Reader
        {
            ReaderCode = readerCode,
            FullName = request.FullName.Trim(),
            Email = email,
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Address = request.Address,
            MemberType = string.IsNullOrWhiteSpace(request.MemberType) ? "Thành viên" : request.MemberType.Trim(),
            Status = request.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Readers.Add(reader);
        await db.SaveChangesAsync();

        var card = new LibraryCard
        {
            ReaderId = reader.Id,
            CardNumber = await GenerateCardNumberAsync(reader.ReaderCode),
            IssuedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddYears(1),
            Status = reader.Status == AccountStatus.Active ? AccountStatus.Active : AccountStatus.Locked,
            BorrowLimit = await GetIntSettingAsync("MaxBooksPerReader", 5),
            LockedReason = reader.Status == AccountStatus.Active ? null : "Độc giả chưa hoạt động",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.LibraryCards.Add(card);
        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Thêm mới", Module = "Identity & Report", TargetType = "Độc giả", TargetId = reader.Id.ToString(), Description = $"Thêm độc giả {reader.FullName} và cấp thẻ thư viện {card.CardNumber}", IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        var created = await db.Readers.Include(x => x.LibraryCard).FirstAsync(x => x.Id == reader.Id);
        return CreatedAtAction(nameof(GetReader), new { id = reader.Id }, ToDto(created));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<IActionResult> UpdateReader(Guid id, CreateReaderRequest request)
    {
        var reader = await db.Readers.Include(x => x.LibraryCard).Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
        if (reader is null) return NotFound();
        if (string.IsNullOrWhiteSpace(request.FullName)) return BadRequest("Họ tên độc giả không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest("Email độc giả không được để trống.");

        var email = request.Email.Trim().ToLower();
        if (await db.Readers.AnyAsync(x => x.Id != id && x.Email.ToLower() == email)) return Conflict("Email độc giả đã tồn tại.");

        reader.FullName = request.FullName.Trim();
        reader.Email = email;
        reader.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        reader.DateOfBirth = request.DateOfBirth;
        reader.Gender = request.Gender;
        reader.Address = request.Address;
        reader.MemberType = string.IsNullOrWhiteSpace(request.MemberType) ? reader.MemberType : request.MemberType.Trim();
        reader.Status = request.Status;
        reader.UpdatedAt = DateTime.UtcNow;

        if (reader.User is not null)
        {
            reader.User.FullName = reader.FullName;
            reader.User.Email = reader.Email;
            reader.User.Phone = reader.Phone;
            reader.User.Status = reader.Status;
            reader.User.UpdatedAt = DateTime.UtcNow;
        }

        if (reader.LibraryCard is not null && request.Status != AccountStatus.Active)
        {
            reader.LibraryCard.Status = AccountStatus.Locked;
            reader.LibraryCard.LockedReason = "Tài khoản độc giả bị khóa/ngưng hoạt động";
            reader.LibraryCard.UpdatedAt = DateTime.UtcNow;
        }
        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Cập nhật", Module = "Identity & Report", TargetType = "Độc giả", TargetId = reader.Id.ToString(), Description = $"Cập nhật hồ sơ độc giả {reader.FullName}", IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/lock")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<IActionResult> LockReader(Guid id, LockLibraryCardRequest request)
    {
        var reader = await db.Readers.Include(x => x.LibraryCard).Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
        if (reader is null) return NotFound();
        reader.Status = AccountStatus.Locked;
        reader.UpdatedAt = DateTime.UtcNow;
        if (reader.User is not null)
        {
            reader.User.Status = AccountStatus.Locked;
            reader.User.UpdatedAt = DateTime.UtcNow;
        }
        if (reader.LibraryCard is not null)
        {
            reader.LibraryCard.Status = AccountStatus.Locked;
            reader.LibraryCard.LockedReason = string.IsNullOrWhiteSpace(request.Reason) ? "Khóa bởi quản trị viên" : request.Reason.Trim();
            reader.LibraryCard.UpdatedAt = DateTime.UtcNow;
        }
        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Khóa", Module = "Identity & Report", TargetType = "Độc giả", TargetId = reader.Id.ToString(), Description = $"Khóa độc giả/thẻ thư viện {reader.ReaderCode}", IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/unlock")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<IActionResult> UnlockReader(Guid id)
    {
        var reader = await db.Readers.Include(x => x.LibraryCard).Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
        if (reader is null) return NotFound();
        reader.Status = AccountStatus.Active;
        reader.UpdatedAt = DateTime.UtcNow;
        if (reader.User is not null)
        {
            reader.User.Status = AccountStatus.Active;
            reader.User.UpdatedAt = DateTime.UtcNow;
        }
        if (reader.LibraryCard is not null)
        {
            reader.LibraryCard.Status = AccountStatus.Active;
            reader.LibraryCard.LockedReason = null;
            reader.LibraryCard.UpdatedAt = DateTime.UtcNow;
        }
        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Mở khóa", Module = "Identity & Report", TargetType = "Độc giả", TargetId = reader.Id.ToString(), Description = $"Mở khóa độc giả/thẻ thư viện {reader.ReaderCode}", IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id:guid}/card")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<LibraryCardDto>> GetCard(Guid id)
    {
        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.Id == id);
        if (reader is null) return NotFound();
        if (reader.LibraryCard is null) return NotFound("Độc giả chưa có thẻ thư viện.");
        return Ok(ToCardDto(reader, reader.LibraryCard));
    }

    [HttpPost("{id:guid}/card/issue")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<LibraryCardDto>> IssueCard(Guid id, IssueLibraryCardRequest request)
    {
        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.Id == id);
        if (reader is null) return NotFound();
        if (reader.LibraryCard is not null) return Conflict("Độc giả đã có thẻ thư viện.");
        var validMonths = request.ValidMonths <= 0 ? 12 : request.ValidMonths;
        var borrowLimit = request.BorrowLimit <= 0 ? await GetIntSettingAsync("MaxBooksPerReader", 5) : request.BorrowLimit;
        var card = new LibraryCard
        {
            ReaderId = reader.Id,
            CardNumber = await GenerateCardNumberAsync(reader.ReaderCode),
            IssuedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddMonths(validMonths),
            Status = AccountStatus.Active,
            BorrowLimit = borrowLimit,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.LibraryCards.Add(card);
        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Cấp thẻ", Module = "Identity & Report", TargetType = "Thẻ thư viện", TargetId = reader.Id.ToString(), Description = $"Cấp thẻ thư viện {card.CardNumber} cho {reader.ReaderCode}", IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
        return Ok(ToCardDto(reader, card));
    }

    [HttpPut("{id:guid}/card/renew")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<LibraryCardDto>> RenewCard(Guid id, RenewLibraryCardRequest request)
    {
        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.Id == id);
        if (reader is null) return NotFound();
        if (reader.LibraryCard is null) return NotFound("Độc giả chưa có thẻ thư viện.");
        var months = request.ExtendMonths <= 0 ? 12 : request.ExtendMonths;
        var baseDate = reader.LibraryCard.ExpiredAt > DateTime.UtcNow ? reader.LibraryCard.ExpiredAt : DateTime.UtcNow;
        reader.LibraryCard.ExpiredAt = baseDate.AddMonths(months);
        reader.LibraryCard.Status = AccountStatus.Active;
        reader.LibraryCard.LockedReason = null;
        reader.LibraryCard.UpdatedAt = DateTime.UtcNow;
        reader.Status = AccountStatus.Active;
        reader.UpdatedAt = DateTime.UtcNow;
        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Gia hạn thẻ", Module = "Identity & Report", TargetType = "Thẻ thư viện", TargetId = reader.Id.ToString(), Description = $"Gia hạn thẻ thư viện cho {reader.ReaderCode} thêm {months} tháng", IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
        return Ok(ToCardDto(reader, reader.LibraryCard));
    }

    [HttpPut("{id:guid}/card/lock")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<IActionResult> LockCard(Guid id, LockLibraryCardRequest request)
    {
        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.Id == id);
        if (reader is null) return NotFound();
        if (reader.LibraryCard is null) return NotFound("Độc giả chưa có thẻ thư viện.");
        reader.LibraryCard.Status = AccountStatus.Locked;
        reader.LibraryCard.LockedReason = string.IsNullOrWhiteSpace(request.Reason) ? "Khóa thẻ bởi quản trị viên" : request.Reason.Trim();
        reader.LibraryCard.UpdatedAt = DateTime.UtcNow;
        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Khóa thẻ", Module = "Identity & Report", TargetType = "Thẻ thư viện", TargetId = reader.LibraryCard.Id.ToString(), Description = $"Khóa thẻ thư viện {reader.LibraryCard.CardNumber}", IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/card/unlock")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<IActionResult> UnlockCard(Guid id)
    {
        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.Id == id);
        if (reader is null) return NotFound();
        if (reader.LibraryCard is null) return NotFound("Độc giả chưa có thẻ thư viện.");
        reader.LibraryCard.Status = AccountStatus.Active;
        reader.LibraryCard.LockedReason = null;
        reader.LibraryCard.UpdatedAt = DateTime.UtcNow;
        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Mở khóa thẻ", Module = "Identity & Report", TargetType = "Thẻ thư viện", TargetId = reader.LibraryCard.Id.ToString(), Description = $"Mở khóa thẻ thư viện {reader.LibraryCard.CardNumber}", IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("/api/cards/validate/{readerCode}")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<CardStatusDto>> ValidateCard(string readerCode)
    {
        var normalized = readerCode.Trim();
        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.ReaderCode == normalized || (x.LibraryCard != null && x.LibraryCard.CardNumber == normalized));
        if (reader is null) return NotFound("Không tìm thấy độc giả hoặc thẻ thư viện.");
        return Ok(ToCardStatus(reader));
    }

    private Guid? GetCurrentUserId()
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("userId");
        return Guid.TryParse(idValue, out var userId) ? userId : null;
    }

    private async Task<string> GenerateReaderCodeAsync()
    {
        var prefix = $"DG{DateTime.UtcNow:yyyy}";
        var count = await db.Readers.CountAsync(x => x.ReaderCode.StartsWith(prefix));
        for (var i = count + 1; i < count + 10000; i++)
        {
            var code = $"{prefix}{i:0000}";
            if (!await db.Readers.AnyAsync(x => x.ReaderCode == code)) return code;
        }
        return $"{prefix}{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
    }

    private async Task<string> GenerateCardNumberAsync(string readerCode)
    {
        var number = $"CARD-{readerCode}";
        if (!await db.LibraryCards.AnyAsync(x => x.CardNumber == number)) return number;
        return $"CARD-{readerCode}-{DateTime.UtcNow:HHmmss}";
    }

    private async Task<int> GetIntSettingAsync(string key, int fallback)
    {
        var value = await db.SystemSettings.Where(x => x.Key == key).Select(x => x.Value).FirstOrDefaultAsync();
        return int.TryParse(value, out var result) && result > 0 ? result : fallback;
    }

    private static ReaderDto ToDto(Reader reader)
    {
        var card = reader.LibraryCard;
        var hasValidCard = card is not null && card.Status == AccountStatus.Active && card.ExpiredAt >= DateTime.UtcNow && reader.Status == AccountStatus.Active;
        return new ReaderDto(reader.Id, reader.ReaderCode, reader.FullName, reader.Email, reader.Phone, reader.DateOfBirth, reader.Gender, reader.Address, reader.MemberType, reader.Status, reader.CreatedAt, card?.CardNumber, card?.IssuedAt, card?.ExpiredAt, card?.Status, card?.BorrowLimit, hasValidCard);
    }

    private static LibraryCardDto ToCardDto(Reader reader, LibraryCard card) => new(card.Id, reader.Id, reader.ReaderCode, card.CardNumber, card.IssuedAt, card.ExpiredAt, card.Status, card.BorrowLimit, card.LockedReason, card.ExpiredAt < DateTime.UtcNow, reader.Status == AccountStatus.Active && card.Status == AccountStatus.Active && card.ExpiredAt >= DateTime.UtcNow);

    private static CardStatusDto ToCardStatus(Reader reader)
    {
        var card = reader.LibraryCard;
        if (reader.Status != AccountStatus.Active)
            return new CardStatusDto(reader.Id, reader.ReaderCode, reader.FullName, card?.CardNumber, reader.Status, card?.Status, card?.ExpiredAt, card?.BorrowLimit ?? 0, false, "Tài khoản độc giả đang bị khóa/ngưng hoạt động.");
        if (card is null)
            return new CardStatusDto(reader.Id, reader.ReaderCode, reader.FullName, null, reader.Status, null, null, 0, false, "Độc giả chưa được cấp thẻ thư viện.");
        if (card.Status != AccountStatus.Active)
            return new CardStatusDto(reader.Id, reader.ReaderCode, reader.FullName, card.CardNumber, reader.Status, card.Status, card.ExpiredAt, card.BorrowLimit, false, card.LockedReason ?? "Thẻ thư viện đang bị khóa/ngưng hoạt động.");
        if (card.ExpiredAt < DateTime.UtcNow)
            return new CardStatusDto(reader.Id, reader.ReaderCode, reader.FullName, card.CardNumber, reader.Status, card.Status, card.ExpiredAt, card.BorrowLimit, false, "Thẻ thư viện đã hết hạn.");
        return new CardStatusDto(reader.Id, reader.ReaderCode, reader.FullName, card.CardNumber, reader.Status, card.Status, card.ExpiredAt, card.BorrowLimit, true, "Thẻ hợp lệ, có thể mượn sách.");
    }
}
