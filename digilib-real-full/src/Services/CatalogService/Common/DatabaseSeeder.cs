using CatalogService.Data;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Common;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(CatalogDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        // Không seed sách / bản sao mẫu.
        // Dữ liệu Catalog sẽ được tạo thật từ Admin hoặc import dữ liệu thật.
        // Việc để database trống giúp frontend Admin/Thủ thư không hiển thị dữ liệu fake.
        await Task.CompletedTask;
    }
}
