using CatalogService.Data;
using CatalogService.Models;
using CatalogService.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IBookService, BookService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    db.Database.Migrate();

    db.Database.ExecuteSqlRaw(@"
IF OBJECT_ID(N'[Categories]', N'U') IS NULL
BEGIN
    CREATE TABLE [Categories] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_Categories] PRIMARY KEY,
        [Name] NVARCHAR(200) NOT NULL,
        [Description] NVARCHAR(MAX) NOT NULL DEFAULT N'',
        [Status] NVARCHAR(50) NOT NULL DEFAULT N'Hoạt động',
        [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX [IX_Categories_Name] ON [Categories] ([Name]);
END;

IF OBJECT_ID(N'[Authors]', N'U') IS NULL
BEGIN
    CREATE TABLE [Authors] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_Authors] PRIMARY KEY,
        [Name] NVARCHAR(200) NOT NULL,
        [Nationality] NVARCHAR(100) NOT NULL DEFAULT N'',
        [Description] NVARCHAR(MAX) NOT NULL DEFAULT N'',
        [Status] NVARCHAR(50) NOT NULL DEFAULT N'Hoạt động',
        [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX [IX_Authors_Name] ON [Authors] ([Name]);
END;

IF OBJECT_ID(N'[Publishers]', N'U') IS NULL
BEGIN
    CREATE TABLE [Publishers] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_Publishers] PRIMARY KEY,
        [Name] NVARCHAR(200) NOT NULL,
        [Country] NVARCHAR(100) NOT NULL DEFAULT N'',
        [Email] NVARCHAR(200) NOT NULL DEFAULT N'',
        [Phone] NVARCHAR(50) NOT NULL DEFAULT N'',
        [Website] NVARCHAR(300) NOT NULL DEFAULT N'',
        [Address] NVARCHAR(MAX) NOT NULL DEFAULT N'',
        [Status] NVARCHAR(50) NOT NULL DEFAULT N'Hoạt động',
        [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX [IX_Publishers_Name] ON [Publishers] ([Name]);
END;

IF COL_LENGTH('BookCopies', 'Location') IS NULL
BEGIN
    ALTER TABLE [BookCopies] ADD [Location] NVARCHAR(MAX) NOT NULL CONSTRAINT [DF_BookCopies_Location] DEFAULT N'';
END;

IF COL_LENGTH('BookCopies', 'Note') IS NULL
BEGIN
    ALTER TABLE [BookCopies] ADD [Note] NVARCHAR(MAX) NOT NULL CONSTRAINT [DF_BookCopies_Note] DEFAULT N'';
END;
");

    var defaultCategories = new[]
    {
        "Công nghệ thông tin",
        "Lập trình",
        "Khoa học dữ liệu",
        "Trí tuệ nhân tạo",
        "Mạng máy tính",
        "An toàn thông tin",
        "Cơ sở dữ liệu",
        "Kỹ thuật phần mềm",
        "Kinh tế",
        "Quản trị kinh doanh",
        "Tài chính - Ngân hàng",
        "Kế toán",
        "Marketing",
        "Luật",
        "Y học",
        "Dược học",
        "Giáo dục",
        "Tâm lý học",
        "Văn học Việt Nam",
        "Văn học nước ngoài",
        "Lịch sử",
        "Địa lý",
        "Ngoại ngữ",
        "Kỹ năng sống",
        "Thiếu nhi"
    };

    foreach (var name in defaultCategories)
    {
        if (!db.Categories.Any(x => x.Name == name))
        {
            db.Categories.Add(new Category
            {
                Name = name,
                Description = $"Danh mục {name}",
                Status = "Hoạt động",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }

    db.SaveChanges();
}
catch (Exception ex)
{
    Console.WriteLine($"[DIGILIB] Không thể tự động migrate hoặc tạo bảng database: {ex.Message}");
    Console.WriteLine("[DIGILIB] Backend vẫn khởi động. Hãy kiểm tra SQL Server nếu API trả lỗi 500.");
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowAll");
app.UseStaticFiles();
app.UseAuthorization();
app.MapControllers();
app.Run();
