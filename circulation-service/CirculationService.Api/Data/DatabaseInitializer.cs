using CirculationService.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Api.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(CirculationDbContext db, bool seedSampleData, CancellationToken cancellationToken = default)
    {
        await db.Database.EnsureCreatedAsync(cancellationToken);
        await CreateTablesIfMissingAsync(db, cancellationToken);

        if (!await db.BorrowPolicies.AnyAsync(cancellationToken))
        {
            db.BorrowPolicies.Add(new BorrowPolicy
            {
                Name = "Default policy",
                MaxBooks = 5,
                MaxDays = 14,
                FinePerDay = 5000
            });

            await db.SaveChangesAsync(cancellationToken);
        }

        if (seedSampleData && !await db.BorrowRecords.AnyAsync(cancellationToken))
        {
            var now = DateTime.Now;
            db.BorrowRecords.AddRange(
                new BorrowRecord
                {
                    ReaderId = 1,
                    ReaderName = "Nguyễn Văn A",
                    CardNumber = "LIB001",
                    CopyCode = "COPY-001",
                    BookId = 101,
                    BookTitle = "Lập trình ASP.NET Core",
                    BorrowDate = now.AddDays(-3),
                    DueDate = now.AddDays(11),
                    Status = BorrowStatuses.Borrowed,
                    Fine = 0
                },
                new BorrowRecord
                {
                    ReaderId = 2,
                    ReaderName = "Trần Thị B",
                    CardNumber = "LIB002",
                    CopyCode = "COPY-002",
                    BookId = 102,
                    BookTitle = "Cơ sở dữ liệu SQL Server",
                    BorrowDate = now.AddDays(-20),
                    DueDate = now.AddDays(-6),
                    Status = BorrowStatuses.Borrowed,
                    Fine = 0
                }
            );

            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task CreateTablesIfMissingAsync(CirculationDbContext db, CancellationToken cancellationToken)
    {
        const string sql = """
IF OBJECT_ID(N'[dbo].[BORROW_POLICIES]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[BORROW_POLICIES]
    (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_BORROW_POLICIES] PRIMARY KEY,
        [Name] NVARCHAR(200) NOT NULL,
        [MaxBooks] INT NOT NULL,
        [MaxDays] INT NOT NULL,
        [FinePerDay] DECIMAL(18,2) NOT NULL
    );
END;

IF OBJECT_ID(N'[dbo].[BORROW_RECORDS]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[BORROW_RECORDS]
    (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_BORROW_RECORDS] PRIMARY KEY,
        [ReaderId] INT NOT NULL,
        [ReaderName] NVARCHAR(200) NOT NULL,
        [CardNumber] NVARCHAR(100) NOT NULL,
        [CopyCode] NVARCHAR(100) NOT NULL,
        [BookId] INT NOT NULL,
        [BookTitle] NVARCHAR(300) NOT NULL,
        [BorrowDate] DATETIME2 NOT NULL,
        [DueDate] DATETIME2 NOT NULL,
        [ReturnDate] DATETIME2 NULL,
        [Status] NVARCHAR(20) NOT NULL,
        [Fine] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_BORROW_RECORDS_Fine] DEFAULT 0
    );

    CREATE INDEX [IX_BORROW_RECORDS_ReaderId] ON [dbo].[BORROW_RECORDS]([ReaderId]);
    CREATE INDEX [IX_BORROW_RECORDS_CardNumber] ON [dbo].[BORROW_RECORDS]([CardNumber]);
    CREATE INDEX [IX_BORROW_RECORDS_CopyCode] ON [dbo].[BORROW_RECORDS]([CopyCode]);
    CREATE INDEX [IX_BORROW_RECORDS_Status] ON [dbo].[BORROW_RECORDS]([Status]);
END;

IF OBJECT_ID(N'[dbo].[FINES]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[FINES]
    (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_FINES] PRIMARY KEY,
        [ReaderId] INT NOT NULL,
        [ReaderName] NVARCHAR(200) NOT NULL,
        [CardNumber] NVARCHAR(100) NOT NULL,
        [Amount] DECIMAL(18,2) NOT NULL,
        [Status] NVARCHAR(20) NOT NULL,
        [UpdatedAt] DATETIME2 NOT NULL
    );

    CREATE INDEX [IX_FINES_ReaderId] ON [dbo].[FINES]([ReaderId]);
    CREATE INDEX [IX_FINES_CardNumber] ON [dbo].[FINES]([CardNumber]);
    CREATE INDEX [IX_FINES_Status] ON [dbo].[FINES]([Status]);
END;
""";

        await db.Database.ExecuteSqlRawAsync(sql, cancellationToken);
    }
}
