using IdentityReportService.Entities;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Data
{
    public class IdentityReportDbContext : DbContext
    {
        public IdentityReportDbContext(DbContextOptions<IdentityReportDbContext> options) : base(options) { }

        // Khai báo 3 bảng sẽ được tạo trong database
        public DbSet<User> Users { get; set; }
        public DbSet<LibraryCard> LibraryCards { get; set; }
        public DbSet<ReportBorrowingStat> ReportBorrowingStats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Thiết lập Username và số thẻ thư viện là duy nhất (không được trùng lặp)
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<LibraryCard>().HasIndex(c => c.CardNumber).IsUnique();

            // Định nghĩa độ chính xác cho cột tiền phạt (18 chữ số, 2 số thập phân)
            modelBuilder.Entity<ReportBorrowingStat>()
                .Property(r => r.FineAmount)
                .HasPrecision(18, 2);
        }
    }
}