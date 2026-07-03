IF DB_ID(N'CirculationDB') IS NULL
BEGIN
    CREATE DATABASE CirculationDB;
END;
GO

USE CirculationDB;
GO

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
GO

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
GO

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
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[BORROW_POLICIES])
BEGIN
    INSERT INTO [dbo].[BORROW_POLICIES] ([Name], [MaxBooks], [MaxDays], [FinePerDay])
    VALUES (N'Default policy', 5, 14, 5000);
END;
GO
