using IdentityReportService.Common;
using IdentityReportService.Data;
using IdentityReportService.Dtos;
using IdentityReportService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.AdminOnly)]
public sealed class RolesController(IdentityReportDbContext db) : ControllerBase
{
    [HttpGet("api/roles")]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetRoles()
    {
        var roles = await db.Roles.Include(x => x.RolePermissions).ThenInclude(x => x.Permission).OrderBy(x => x.Name).ToListAsync();
        var userCounts = await db.Users.GroupBy(x => x.RoleId).Select(g => new { RoleId = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.RoleId, x => x.Count);
        return Ok(roles.Select(r => new RoleDto(r.Id, r.Name, r.Description, r.IsSystemRole, r.Status, userCounts.GetValueOrDefault(r.Id), r.RolePermissions.Select(rp => rp.Permission!.Code))));
    }

    [HttpPost("api/roles")]
    public async Task<ActionResult<RoleDto>> CreateRole(CreateRoleRequest request)
    {
        if (await db.Roles.AnyAsync(x => x.Name == request.Name)) return Conflict("Tên vai trò đã tồn tại.");
        var role = new Role { Name = request.Name.Trim(), Description = request.Description, IsSystemRole = request.IsSystemRole, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Roles.Add(role);
        await db.SaveChangesAsync();
        return Ok(new RoleDto(role.Id, role.Name, role.Description, role.IsSystemRole, role.Status, 0, Array.Empty<string>()));
    }

    [HttpPut("api/roles/{id:guid}")]
    public async Task<IActionResult> UpdateRole(Guid id, CreateRoleRequest request)
    {
        var role = await db.Roles.FindAsync(id);
        if (role is null) return NotFound();
        role.Name = request.Name.Trim();
        role.Description = request.Description;
        role.IsSystemRole = request.IsSystemRole;
        role.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("api/roles/{id:guid}/permissions")]
    public async Task<IActionResult> UpdateRolePermissions(Guid id, UpdateRolePermissionsRequest request)
    {
        var role = await db.Roles.Include(x => x.RolePermissions).FirstOrDefaultAsync(x => x.Id == id);
        if (role is null) return NotFound();
        db.RolePermissions.RemoveRange(role.RolePermissions);
        db.RolePermissions.AddRange(request.PermissionIds.Distinct().Select(permissionId => new RolePermission { RoleId = id, PermissionId = permissionId }));
        db.SystemLogs.Add(new SystemLog { ActorName = User.Identity?.Name ?? "Admin", Action = "Phân quyền", Module = "Identity & Report", TargetType = "Vai trò", TargetId = role.Id.ToString(), Description = $"Cập nhật quyền cho vai trò {role.Name}" });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("api/permissions")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetPermissions() =>
        Ok(await db.Permissions.OrderBy(x => x.Module).ThenBy(x => x.Code).Select(x => new PermissionDto(x.Id, x.Code, x.Name, x.Module, x.Description)).ToListAsync());
}
