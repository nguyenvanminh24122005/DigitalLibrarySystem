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

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<Publisher> Publishers => Set<Publisher>();

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<FavoriteBook> FavoriteBooks => Set<FavoriteBook>();
    public DbSet<BorrowingRecord> BorrowingRecords => Set<BorrowingRecord>();
    public DbSet<NotificationItem> Notifications => Set<NotificationItem>();
    public DbSet<DigitalResource> DigitalResources => Set<DigitalResource>();
    public DbSet<ReadingProgressRecord> ReadingProgressRecords => Set<ReadingProgressRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =========================
        // CATEGORY
        // =========================
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(x => x.Description)
                .HasDefaultValue(string.Empty);

            entity.Property(x => x.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Hoạt động");

            entity.Property(x => x.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.Property(x => x.UpdatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasIndex(x => x.Name);
        });

        // =========================
        // AUTHOR
        // =========================
        modelBuilder.Entity<Author>(entity =>
        {
            entity.ToTable("Authors");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(x => x.Nationality)
                .HasMaxLength(100)
                .HasDefaultValue(string.Empty);

            entity.Property(x => x.Description)
                .HasDefaultValue(string.Empty);

            entity.Property(x => x.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Hoạt động");

            entity.Property(x => x.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.Property(x => x.UpdatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasIndex(x => x.Name);
        });

        // =========================
        // PUBLISHER
        // =========================
        modelBuilder.Entity<Publisher>(entity =>
        {
            entity.ToTable("Publishers");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(x => x.Country)
                .HasMaxLength(100)
                .HasDefaultValue(string.Empty);

            entity.Property(x => x.Email)
                .HasMaxLength(200)
                .HasDefaultValue(string.Empty);

            entity.Property(x => x.Phone)
                .HasMaxLength(50)
                .HasDefaultValue(string.Empty);

            entity.Property(x => x.Website)
                .HasMaxLength(300)
                .HasDefaultValue(string.Empty);

            entity.Property(x => x.Address)
                .HasDefaultValue(string.Empty);

            entity.Property(x => x.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Hoạt động");

            entity.Property(x => x.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.Property(x => x.UpdatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasIndex(x => x.Name);
        });

        // =========================
        // USER PROFILE
        // =========================
        modelBuilder.Entity<UserProfile>()
            .HasIndex(x => x.UserId)
            .IsUnique();

        // =========================
        // FAVORITE BOOK
        // =========================
        modelBuilder.Entity<FavoriteBook>()
            .HasIndex(x => new { x.UserId, x.BookId })
            .IsUnique();

        modelBuilder.Entity<FavoriteBook>()
            .HasOne(x => x.Book)
            .WithMany()
            .HasForeignKey(x => x.BookId)
            .OnDelete(DeleteBehavior.Cascade);

        // =========================
        // BORROWING RECORD
        // =========================
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

        // =========================
        // READING PROGRESS
        // =========================
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