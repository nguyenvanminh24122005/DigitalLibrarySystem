using CatalogService.Models;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Data;

public sealed class CatalogDbContext(DbContextOptions<CatalogDbContext> options) : DbContext(options)
{
    public DbSet<Book> Books => Set<Book>();
    public DbSet<BookCopy> BookCopies => Set<BookCopy>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<Publisher> Publishers => Set<Publisher>();
    public DbSet<CatalogEvent> CatalogEvents => Set<CatalogEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Book>().HasIndex(x => x.ISBN).IsUnique();
        modelBuilder.Entity<BookCopy>().HasIndex(x => x.CopyCode).IsUnique();
        modelBuilder.Entity<Category>().HasIndex(x => x.Name).IsUnique();
        modelBuilder.Entity<Author>().HasIndex(x => x.Name);
        modelBuilder.Entity<Publisher>().HasIndex(x => x.Name).IsUnique();

        modelBuilder.Entity<Book>().Property(x => x.Status).HasConversion<string>();
        modelBuilder.Entity<BookCopy>().Property(x => x.Condition).HasConversion<string>();
        modelBuilder.Entity<BookCopy>().Property(x => x.BorrowStatus).HasConversion<string>();
        modelBuilder.Entity<Category>().Property(x => x.Status).HasConversion<string>();
        modelBuilder.Entity<Author>().Property(x => x.Status).HasConversion<string>();
        modelBuilder.Entity<Publisher>().Property(x => x.Status).HasConversion<string>();
    }
}
