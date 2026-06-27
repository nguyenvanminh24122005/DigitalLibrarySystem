using IdentityReportService.Common;
using IdentityReportService.Data;
using IdentityReportService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize(Roles = AppRoles.AdminOnly)]
public sealed class SettingsController(IdentityReportDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSettings() => Ok(await db.SystemSettings.OrderBy(x => x.Key).ToListAsync());

    [HttpPut]
    public async Task<IActionResult> UpdateSettings(Dictionary<string, string> settings)
    {
        foreach (var item in settings)
        {
            var setting = await db.SystemSettings.FirstOrDefaultAsync(x => x.Key == item.Key);
            if (setting is null)
            {
                db.SystemSettings.Add(new SystemSetting { Key = item.Key, Value = item.Value, UpdatedBy = User.Identity?.Name ?? "Admin", UpdatedAt = DateTime.UtcNow });
            }
            else
            {
                setting.Value = item.Value;
                setting.UpdatedBy = User.Identity?.Name ?? "Admin";
                setting.UpdatedAt = DateTime.UtcNow;
            }
        }
        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Cài đặt", Module = "Identity & Report", TargetType = "SystemSettings", Description = "Cập nhật cài đặt hệ thống" });
        await db.SaveChangesAsync();
        return NoContent();
    }
}
