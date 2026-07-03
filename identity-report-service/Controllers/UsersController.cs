using IdentityReportService.Common;
using IdentityReportService.Data;
using IdentityReportService.Dtos;
using IdentityReportService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = AppRoles.AdminOnly)]
public sealed class UsersController(IdentityReportDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers([FromQuery] string? q, [FromQuery] Guid? roleId, [FromQuery] AccountStatus? status)
    {
        var query = db.Users.Include(x => x.Role).AsQueryable();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var keyword = q.Trim();
            query = query.Where(x => x.FullName.Contains(keyword) || x.Email.Contains(keyword) || x.Username.Contains(keyword) || (x.Phone != null && x.Phone.Contains(keyword)));
        }
        if (roleId.HasValue) query = query.Where(x => x.RoleId == roleId);
        if (status.HasValue) query = query.Where(x => x.Status == status);
        return Ok(await query.OrderByDescending(x => x.CreatedAt).Select(x => ToDto(x)).ToListAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        var user = await db.Users.Include(x => x.Role).FirstOrDefaultAsync(x => x.Id == id);
        return user is null ? NotFound() : Ok(ToDto(user));
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName)) return BadRequest("Họ tên không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Username)) return BadRequest("Tên đăng nhập không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest("Email không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6) return BadRequest("Mật khẩu phải có ít nhất 6 ký tự.");

        var username = request.Username.Trim().ToLower();
        var email = request.Email.Trim().ToLower();
        if (await db.Users.AnyAsync(x => x.Email.ToLower() == email || x.Username.ToLower() == username)) return Conflict("Email hoặc tên đăng nhập đã tồn tại.");
        var role = await db.Roles.FirstOrDefaultAsync(x => x.Id == request.RoleId);
        if (role is null) return BadRequest("Vai trò không tồn tại.");

        await using var transaction = await db.Database.BeginTransactionAsync();
        var user = new User
        {
            FullName = request.FullName.Trim(),
            Username = username,
            Email = email,
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        if (role.Name == AppRoles.Reader && !await db.Readers.AnyAsync(x => x.UserId == user.Id || x.Email.ToLower() == email))
        {
            var readerCode = await GenerateReaderCodeAsync();
            var reader = new Reader
            {
                UserId = user.Id,
                ReaderCode = readerCode,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                MemberType = "Thành viên",
                Status = user.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Readers.Add(reader);
            await db.SaveChangesAsync();
            db.LibraryCards.Add(new LibraryCard
            {
                ReaderId = reader.Id,
                CardNumber = await GenerateCardNumberAsync(reader.ReaderCode),
                IssuedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddYears(1),
                Status = user.Status == AccountStatus.Active ? AccountStatus.Active : AccountStatus.Locked,
                BorrowLimit = await GetIntSettingAsync("MaxBooksPerReader", 5),
                LockedReason = user.Status == AccountStatus.Active ? null : "Tài khoản độc giả chưa hoạt động",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Thêm mới", Module = "Identity & Report", TargetType = "Người dùng", TargetId = user.Id.ToString(), Description = $"Thêm người dùng {user.FullName} với vai trò {role.Name}", IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        var created = await db.Users.Include(x => x.Role).FirstAsync(x => x.Id == user.Id);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, ToDto(created));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, UpdateUserRequest request)
    {
        var user = await db.Users.Include(x => x.Role).FirstOrDefaultAsync(x => x.Id == id);
        if (user is null) return NotFound();
        if (string.IsNullOrWhiteSpace(request.FullName)) return BadRequest("Họ tên không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest("Email không được để trống.");
        var email = request.Email.Trim().ToLower();
        if (await db.Users.AnyAsync(x => x.Id != id && x.Email.ToLower() == email)) return Conflict("Email đã tồn tại.");
        var newRole = await db.Roles.FirstOrDefaultAsync(x => x.Id == request.RoleId);
        if (newRole is null) return BadRequest("Vai trò không tồn tại.");

        user.FullName = request.FullName.Trim();
        user.Email = email;
        user.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        user.RoleId = request.RoleId;
        user.Status = request.Status;
        user.UpdatedAt = DateTime.UtcNow;

        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.UserId == user.Id);
        if (reader is not null)
        {
            reader.FullName = user.FullName;
            reader.Email = user.Email;
            reader.Phone = user.Phone;
            reader.Status = request.Status;
            reader.UpdatedAt = DateTime.UtcNow;
            if (reader.LibraryCard is not null && request.Status != AccountStatus.Active)
            {
                reader.LibraryCard.Status = AccountStatus.Locked;
                reader.LibraryCard.LockedReason = "Tài khoản người dùng bị khóa/ngưng hoạt động";
                reader.LibraryCard.UpdatedAt = DateTime.UtcNow;
            }
        }
        else if (newRole.Name == AppRoles.Reader)
        {
            var readerCode = await GenerateReaderCodeAsync();
            var newReader = new Reader
            {
                UserId = user.Id,
                ReaderCode = readerCode,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                MemberType = "Thành viên",
                Status = user.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Readers.Add(newReader);
            await db.SaveChangesAsync();
            db.LibraryCards.Add(new LibraryCard
            {
                ReaderId = newReader.Id,
                CardNumber = await GenerateCardNumberAsync(newReader.ReaderCode),
                IssuedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddYears(1),
                Status = user.Status == AccountStatus.Active ? AccountStatus.Active : AccountStatus.Locked,
                BorrowLimit = await GetIntSettingAsync("MaxBooksPerReader", 5),
                LockedReason = user.Status == AccountStatus.Active ? null : "Tài khoản độc giả chưa hoạt động",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Cập nhật", Module = "Identity & Report", TargetType = "Người dùng", TargetId = user.Id.ToString(), Description = $"Cập nhật người dùng {user.FullName}", IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/lock")]
    public async Task<IActionResult> LockUser(Guid id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        user.Status = AccountStatus.Locked;
        user.UpdatedAt = DateTime.UtcNow;
        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.UserId == id);
        if (reader is not null)
        {
            reader.Status = AccountStatus.Locked;
            reader.UpdatedAt = DateTime.UtcNow;
            if (reader.LibraryCard is not null)
            {
                reader.LibraryCard.Status = AccountStatus.Locked;
                reader.LibraryCard.LockedReason = "Tài khoản người dùng bị khóa";
                reader.LibraryCard.UpdatedAt = DateTime.UtcNow;
            }
        }
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/unlock")]
    public async Task<IActionResult> UnlockUser(Guid id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        user.Status = AccountStatus.Active;
        user.UpdatedAt = DateTime.UtcNow;
        var reader = await db.Readers.Include(x => x.LibraryCard).FirstOrDefaultAsync(x => x.UserId == id);
        if (reader is not null)
        {
            reader.Status = AccountStatus.Active;
            reader.UpdatedAt = DateTime.UtcNow;
            if (reader.LibraryCard is not null)
            {
                reader.LibraryCard.Status = AccountStatus.Active;
                reader.LibraryCard.LockedReason = null;
                reader.LibraryCard.UpdatedAt = DateTime.UtcNow;
            }
        }
        await db.SaveChangesAsync();
        return NoContent();
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

    private static UserDto ToDto(User user) => new(user.Id, user.FullName, user.Username, user.Email, user.Phone, user.Role?.Name ?? string.Empty, user.Status, user.CreatedAt, user.LastLoginAt);
}
