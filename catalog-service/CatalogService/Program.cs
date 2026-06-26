using CatalogService.Data;
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

// CORS
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

// Tự động áp dụng migration khi chạy local để các bảng User/Favorite/Borrowing/Notification/Tài liệu số được tạo.
// Nếu database đã tồn tại hoặc máy chưa sẵn LocalDB/SQL Server, không cho app crash trắng màn hình Swagger.
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}
catch (Exception ex)
{
    Console.WriteLine($"[DIGILIB] Không thể tự động migrate database: {ex.Message}");
    Console.WriteLine("[DIGILIB] Backend vẫn khởi động. Hãy kiểm tra SQL Server/LocalDB nếu API trả lỗi 500.");
}


// Swagger
app.UseSwagger();
app.UseSwaggerUI();

// CORS
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Chạy bằng IP LAN
app.Run("http://0.0.0.0:5002");