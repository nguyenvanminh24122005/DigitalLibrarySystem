using CirculationService.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Api.Data;

public class CirculationDbContext(DbContextOptions<CirculationDbContext> options) : DbContext(options)
{
    public DbSet<BorrowPolicy> BorrowPolicies => Set<BorrowPolicy>();
    public DbSet<BorrowRecord> BorrowRecords => Set<BorrowRecord>();
    public DbSet<Fine> Fines => Set<Fine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BorrowPolicy>(entity =>
        {
            entity.ToTable("BORROW_POLICIES");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).ValueGeneratedOnAdd();
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.MaxBooks).IsRequired();
            entity.Property(x => x.MaxDays).IsRequired();
            entity.Property(x => x.FinePerDay).HasPrecision(18, 2).IsRequired();
        });

        modelBuilder.Entity<BorrowRecord>(entity =>
        {
            entity.ToTable("BORROW_RECORDS");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).ValueGeneratedOnAdd();
            entity.Property(x => x.ReaderName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.CardNumber).HasMaxLength(100).IsRequired();
            entity.Property(x => x.CopyCode).HasMaxLength(100).IsRequired();
            entity.Property(x => x.BookTitle).HasMaxLength(300).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(20).IsRequired();
            entity.Property(x => x.Fine).HasPrecision(18, 2).IsRequired();
            entity.HasIndex(x => x.ReaderId);
            entity.HasIndex(x => x.CardNumber);
            entity.HasIndex(x => x.CopyCode);
            entity.HasIndex(x => x.Status);
        });

        modelBuilder.Entity<Fine>(entity =>
        {
            entity.ToTable("FINES");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).ValueGeneratedOnAdd();
            entity.Property(x => x.ReaderName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.CardNumber).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Amount).HasPrecision(18, 2).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(20).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();
            entity.HasIndex(x => x.ReaderId);
            entity.HasIndex(x => x.CardNumber);
            entity.HasIndex(x => x.Status);
        });
    }
}
