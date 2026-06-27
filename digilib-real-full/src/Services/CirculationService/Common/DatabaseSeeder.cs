using CirculationService.Data;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Common;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(CirculationDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        // Không seed phiếu mượn / phí phạt mẫu.
        // Dữ liệu mượn-trả sẽ được sinh thật từ giao diện Thủ thư.
        await Task.CompletedTask;
    }
}
