using Microsoft.EntityFrameworkCore;
using CirculationService.Models;

namespace CirculationService.Data;

public class CirculationDbContext : DbContext
{
    public CirculationDbContext(DbContextOptions<CirculationDbContext> options) : base(options)
    {
    }

    public DbSet<BorrowRecord> BorrowRecords => Set<BorrowRecord>();
    public DbSet<Fine> Fines => Set<Fine>();
    public DbSet<BorrowPolicy> BorrowPolicies => Set<BorrowPolicy>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed default policy
        modelBuilder.Entity<BorrowPolicy>().HasData(
            new BorrowPolicy
            {
                Id = 1,
                Name = "Default Policy",
                MaxBooks = 5,
                MaxDays = 14,
                FinePerDay = 5000
            }
        );
    }
}
