using CirculationService.Models;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Data;

public sealed class CirculationDbContext(DbContextOptions<CirculationDbContext> options) : DbContext(options)
{
    public DbSet<BorrowTicket> BorrowTickets => Set<BorrowTicket>();
    public DbSet<BorrowTicketItem> BorrowTicketItems => Set<BorrowTicketItem>();
    public DbSet<Fine> Fines => Set<Fine>();
    public DbSet<CirculationLog> CirculationLogs => Set<CirculationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BorrowTicket>().HasIndex(x => x.TicketCode).IsUnique();
        modelBuilder.Entity<Fine>().HasIndex(x => x.FineCode).IsUnique();
        modelBuilder.Entity<BorrowTicket>().Property(x => x.Status).HasConversion<string>();
        modelBuilder.Entity<BorrowTicketItem>().Property(x => x.ItemStatus).HasConversion<string>();
        modelBuilder.Entity<Fine>().Property(x => x.Status).HasConversion<string>();
        modelBuilder.Entity<Fine>().Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Fine>().Property(x => x.PaidAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Fine>().Property(x => x.RemainingAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<BorrowTicketItem>().Property(x => x.FineAmount).HasColumnType("decimal(18,2)");
    }
}
