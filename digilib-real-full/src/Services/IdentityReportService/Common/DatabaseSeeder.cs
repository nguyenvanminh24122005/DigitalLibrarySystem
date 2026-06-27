using IdentityReportService.Data;
using IdentityReportService.Models;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Common;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IdentityReportDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        var permissionSeeds = new[]
        {
            new Permission { Code="BOOK_VIEW", Name="Xem sách", Module="Catalog Service" },
            new Permission { Code="BOOK_CREATE", Name="Thêm sách", Module="Catalog Service" },
            new Permission { Code="BOOK_UPDATE", Name="Sửa sách", Module="Catalog Service" },
            new Permission { Code="BOOK_DELETE", Name="Xóa/ngừng sách", Module="Catalog Service" },
            new Permission { Code="COPY_MANAGE", Name="Quản lý bản sao", Module="Catalog Service" },
            new Permission { Code="CATEGORY_MANAGE", Name="Quản lý thể loại", Module="Catalog Service" },
            new Permission { Code="AUTHOR_MANAGE", Name="Quản lý tác giả", Module="Catalog Service" },
            new Permission { Code="PUBLISHER_MANAGE", Name="Quản lý nhà xuất bản", Module="Catalog Service" },
            new Permission { Code="USER_MANAGE", Name="Quản lý người dùng", Module="Identity & Report" },
            new Permission { Code="READER_VIEW", Name="Xem độc giả", Module="Identity & Report" },
            new Permission { Code="READER_MANAGE", Name="Quản lý độc giả", Module="Identity & Report" },
            new Permission { Code="CARD_VALIDATE", Name="Xác thực thẻ thư viện", Module="Identity & Report" },
            new Permission { Code="CARD_MANAGE", Name="Quản lý thẻ thư viện", Module="Identity & Report" },
            new Permission { Code="ROLE_MANAGE", Name="Quản lý vai trò", Module="Identity & Report" },
            new Permission { Code="REPORT_VIEW", Name="Xem báo cáo", Module="Identity & Report" },
            new Permission { Code="REPORT_SYNC", Name="Đồng bộ dữ liệu báo cáo", Module="Identity & Report" },
            new Permission { Code="SYSTEM_LOG_VIEW", Name="Xem nhật ký hệ thống", Module="Identity & Report" },
            new Permission { Code="SYSTEM_SETTING", Name="Cài đặt hệ thống", Module="Identity & Report" },
            new Permission { Code="PROFILE_MANAGE", Name="Cập nhật hồ sơ cá nhân", Module="Identity & Report" }
        };

        foreach (var seed in permissionSeeds)
        {
            var permission = await db.Permissions.FirstOrDefaultAsync(x => x.Code == seed.Code);
            if (permission is null)
            {
                db.Permissions.Add(seed);
            }
            else
            {
                permission.Name = seed.Name;
                permission.Module = seed.Module;
                permission.Description = seed.Description;
            }
        }
        await db.SaveChangesAsync();

        var adminRole = await EnsureRoleAsync(db, AppRoles.Admin, "Toàn quyền quản trị hệ thống", true);
        var librarianRole = await EnsureRoleAsync(db, AppRoles.Librarian, "Vận hành thư viện và xử lý mượn/trả", true);
        var readerRole = await EnsureRoleAsync(db, AppRoles.Reader, "Truy cập thư viện theo tài khoản cá nhân", true);
        var catalogRole = await EnsureRoleAsync(db, "Quản lý Catalog", "Quản trị dữ liệu sách và danh mục", false);
        var reportRole = await EnsureRoleAsync(db, AppRoles.Reporter, "Chỉ xem báo cáo, sự kiện và nhật ký", false);
        await db.SaveChangesAsync();

        var allPermissions = await db.Permissions.ToListAsync();
        await EnsurePermissionsAsync(db, adminRole, allPermissions.Select(x => x.Code).ToArray());
        await EnsurePermissionsAsync(db, librarianRole, "BOOK_VIEW", "READER_VIEW", "READER_MANAGE", "CARD_VALIDATE", "CARD_MANAGE", "REPORT_VIEW", "PROFILE_MANAGE");
        await EnsurePermissionsAsync(db, readerRole, "BOOK_VIEW", "PROFILE_MANAGE");
        await EnsurePermissionsAsync(db, catalogRole, "BOOK_VIEW", "BOOK_CREATE", "BOOK_UPDATE", "BOOK_DELETE", "COPY_MANAGE", "CATEGORY_MANAGE", "AUTHOR_MANAGE", "PUBLISHER_MANAGE");
        await EnsurePermissionsAsync(db, reportRole, "REPORT_VIEW", "SYSTEM_LOG_VIEW");
        await db.SaveChangesAsync();

        await EnsureUserAsync(db, "admin", "admin@digilib.edu.vn", "Admin", "0901234567", "123456", adminRole.Id);
        await EnsureUserAsync(db, "librarian", "librarian@digilib.edu.vn", "Lê Thị Mai", "0902345678", "123456", librarianRole.Id);

        await EnsureSettingAsync(db, "LibraryName", "DIGILIB Library", "Tên thư viện");
        await EnsureSettingAsync(db, "DefaultBorrowDays", "14", "Thời hạn mượn mặc định");
        await EnsureSettingAsync(db, "MaxBooksPerReader", "5", "Số sách được mượn tối đa");
        await EnsureSettingAsync(db, "MaxRenewals", "2", "Số lần gia hạn tối đa");
        await EnsureSettingAsync(db, "FinePerDay", "2000", "Phí phạt quá hạn mỗi ngày");
        await EnsureSettingAsync(db, "AllowReaderRegistration", "true", "Cho phép đăng ký độc giả mới");
        await EnsureSettingAsync(db, "LibraryCardValidMonths", "12", "Số tháng hiệu lực mặc định của thẻ thư viện");
        await db.SaveChangesAsync();

        if (!await db.SystemLogs.AnyAsync(x => x.Action == "Khởi tạo" && x.Module == "Identity & Report"))
        {
            db.SystemLogs.Add(new SystemLog
            {
                ActorName = "Hệ thống",
                Action = "Khởi tạo",
                Module = "Identity & Report",
                TargetType = "Cơ sở dữ liệu",
                Description = "Khởi tạo vai trò, quyền, tài khoản quản trị, tài khoản thủ thư và cài đặt hệ thống",
                IpAddress = "-",
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }
    }

    private static async Task<Role> EnsureRoleAsync(IdentityReportDbContext db, string name, string description, bool isSystemRole)
    {
        var role = await db.Roles.FirstOrDefaultAsync(x => x.Name == name);
        if (role is null)
        {
            role = new Role { Name = name, Description = description, IsSystemRole = isSystemRole, Status = AccountStatus.Active, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            db.Roles.Add(role);
            await db.SaveChangesAsync();
        }
        else
        {
            role.Description = description;
            role.IsSystemRole = isSystemRole;
            role.Status = AccountStatus.Active;
            role.UpdatedAt = DateTime.UtcNow;
        }
        return role;
    }

    private static async Task EnsurePermissionsAsync(IdentityReportDbContext db, Role role, params string[] codes)
    {
        var permissions = await db.Permissions.Where(x => codes.Contains(x.Code)).ToListAsync();
        foreach (var permission in permissions)
        {
            if (!await db.RolePermissions.AnyAsync(x => x.RoleId == role.Id && x.PermissionId == permission.Id))
            {
                db.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = permission.Id });
            }
        }
    }

    private static async Task EnsureUserAsync(IdentityReportDbContext db, string username, string email, string fullName, string phone, string password, Guid roleId)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Username == username || x.Email == email);
        if (user is null)
        {
            db.Users.Add(new User
            {
                FullName = fullName,
                Username = username,
                Email = email,
                Phone = phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                RoleId = roleId,
                Status = AccountStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            user.FullName = fullName;
            user.Username = username;
            user.Email = email;
            user.Phone = phone;
            user.RoleId = roleId;
            user.Status = AccountStatus.Active;
            user.UpdatedAt = DateTime.UtcNow;
        }
    }

    private static async Task EnsureSettingAsync(IdentityReportDbContext db, string key, string value, string description)
    {
        var setting = await db.SystemSettings.FirstOrDefaultAsync(x => x.Key == key);
        if (setting is null)
        {
            db.SystemSettings.Add(new SystemSetting { Key = key, Value = value, Description = description, UpdatedBy = "system", UpdatedAt = DateTime.UtcNow });
        }
        else if (string.IsNullOrWhiteSpace(setting.Value))
        {
            setting.Value = value;
            setting.Description = description;
            setting.UpdatedBy = "system";
            setting.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            setting.Description = description;
        }
    }
}
