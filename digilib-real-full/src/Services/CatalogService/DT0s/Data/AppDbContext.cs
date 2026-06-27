using CatalogService.Models;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Book> Books => Set<Book>();
    public DbSet<BookCopy> BookCopies => Set<BookCopy>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<FavoriteBook> FavoriteBooks => Set<FavoriteBook>();
    public DbSet<BorrowingRecord> BorrowingRecords => Set<BorrowingRecord>();
    public DbSet<NotificationItem> Notifications => Set<NotificationItem>();
    public DbSet<DigitalResource> DigitalResources => Set<DigitalResource>();
    public DbSet<ReadingProgressRecord> ReadingProgressRecords => Set<ReadingProgressRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserProfile>()
            .HasIndex(x => x.UserId)
            .IsUnique();

        modelBuilder.Entity<FavoriteBook>()
            .HasIndex(x => new { x.UserId, x.BookId })
            .IsUnique();

        modelBuilder.Entity<FavoriteBook>()
            .HasOne(x => x.Book)
            .WithMany()
            .HasForeignKey(x => x.BookId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BorrowingRecord>()
            .Property(x => x.FineAmount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<BorrowingRecord>()
            .HasOne(x => x.Book)
            .WithMany()
            .HasForeignKey(x => x.BookId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<BorrowingRecord>()
            .HasOne(x => x.Copy)
            .WithMany()
            .HasForeignKey(x => x.CopyId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ReadingProgressRecord>()
            .HasIndex(x => new { x.UserId, x.BookId })
            .IsUnique();

        modelBuilder.Entity<ReadingProgressRecord>()
            .HasOne(x => x.Book)
            .WithMany()
            .HasForeignKey(x => x.BookId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
