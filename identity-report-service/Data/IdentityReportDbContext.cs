using IdentityReportService.Models;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Data;

public sealed class IdentityReportDbContext(DbContextOptions<IdentityReportDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Reader> Readers => Set<Reader>();
    public DbSet<LibraryCard> LibraryCards => Set<LibraryCard>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<SystemLog> SystemLogs => Set<SystemLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<ConsumedEvent> ConsumedEvents => Set<ConsumedEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(x => x.Username).IsUnique();
        modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<Reader>().HasIndex(x => x.ReaderCode).IsUnique();
        modelBuilder.Entity<LibraryCard>().HasIndex(x => x.CardNumber).IsUnique();
        modelBuilder.Entity<Role>().HasIndex(x => x.Name).IsUnique();
        modelBuilder.Entity<Permission>().HasIndex(x => x.Code).IsUnique();
        modelBuilder.Entity<SystemSetting>().HasIndex(x => x.Key).IsUnique();
        modelBuilder.Entity<ConsumedEvent>().HasIndex(x => new { x.SourceService, x.ExternalEventId }).IsUnique();
        modelBuilder.Entity<RolePermission>().HasKey(x => new { x.RoleId, x.PermissionId });

        modelBuilder.Entity<Reader>()
            .HasOne(x => x.LibraryCard)
            .WithOne(x => x.Reader)
            .HasForeignKey<LibraryCard>(x => x.ReaderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>().Property(x => x.Status).HasConversion<string>();
        modelBuilder.Entity<Reader>().Property(x => x.Status).HasConversion<string>();
        modelBuilder.Entity<LibraryCard>().Property(x => x.Status).HasConversion<string>();
        modelBuilder.Entity<Role>().Property(x => x.Status).HasConversion<string>();
        modelBuilder.Entity<SystemLog>().Property(x => x.Result).HasConversion<string>();
    }
}
