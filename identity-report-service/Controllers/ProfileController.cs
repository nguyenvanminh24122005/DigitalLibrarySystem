using System.Security.Claims;
using IdentityReportService.Common;
using IdentityReportService.Data;
using IdentityReportService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public sealed class ProfileController(IdentityReportDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var user = await db.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == userId.Value);

        if (user is null) return Unauthorized();

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Username,
            user.Email,
            user.Phone,
            RoleName = user.Role != null ? user.Role.Name : string.Empty,
            user.Status,
            user.CreatedAt,
            user.UpdatedAt,
            user.LastLoginAt
        });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.FullName)) return BadRequest("Họ tên không được để trống.");
        if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest("Email không được để trống.");

        var user = await db.Users.Include(x => x.Role).FirstOrDefaultAsync(x => x.Id == userId.Value);
        if (user is null) return Unauthorized();

        var normalizedEmail = request.Email.Trim().ToLower();
        var emailExists = await db.Users.AnyAsync(x => x.Id != user.Id && x.Email.ToLower() == normalizedEmail);
        if (emailExists) return BadRequest("Email này đã được sử dụng bởi tài khoản khác.");

        user.FullName = request.FullName.Trim();
        user.Email = normalizedEmail;
        user.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        if (user.Role?.Name == AppRoles.Reader)
        {
            var reader = await db.Readers.FirstOrDefaultAsync(x => x.UserId == user.Id);
            if (reader is not null)
            {
                reader.FullName = user.FullName;
                reader.Email = user.Email;
                reader.Phone = user.Phone;
                reader.UpdatedAt = DateTime.UtcNow;
            }
        }

        db.SystemLogs.Add(new SystemLog
        {
            UserId = user.Id,
            ActorName = user.FullName,
            Action = "Cập nhật hồ sơ cá nhân",
            Module = "Identity & Report",
            TargetType = "Profile",
            TargetId = user.Id.ToString(),
            Description = $"Người dùng {user.Username} cập nhật hồ sơ cá nhân",
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
        });

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.CurrentPassword)) return BadRequest("Vui lòng nhập mật khẩu hiện tại.");
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6) return BadRequest("Mật khẩu mới phải có ít nhất 6 ký tự.");

        var user = await db.Users.FindAsync(userId.Value);
        if (user is null) return Unauthorized();

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return BadRequest("Mật khẩu hiện tại không đúng.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        db.SystemLogs.Add(new SystemLog
        {
            UserId = user.Id,
            ActorName = user.FullName,
            Action = "Đổi mật khẩu",
            Module = "Identity & Report",
            TargetType = "Profile",
            TargetId = user.Id.ToString(),
            Description = $"Người dùng {user.Username} đổi mật khẩu",
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
        });

        await db.SaveChangesAsync();
        return NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("userId");

        return Guid.TryParse(idValue, out var userId) ? userId : null;
    }
}

public sealed record UpdateProfileRequest(string FullName, string Email, string? Phone);
public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);
