using CatalogService.Data;
using CatalogService.Services;
using CatalogService.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// Auto-migrate and Seed Database
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await DatabaseSeeder.SeedAsync(context);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred during database seeding/migrations: {ex.Message}");
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "Catalog Service" }));

app.Run();

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new Category { Name = "Công nghệ thông tin", Description = "Sách về lập trình, mạng máy tính, AI, thiết kế phần mềm" },
                new Category { Name = "Kinh tế & Quản trị", Description = "Sách kinh doanh, quản trị doanh nghiệp, marketing, đầu tư" },
                new Category { Name = "Văn học & Nghệ thuật", Description = "Tiểu thuyết, truyện ngắn, thơ, nghệ thuật sống" }
            };
            
            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        if (!await context.Books.AnyAsync())
        {
            var cat1 = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Công nghệ thông tin");
            var cat2 = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Kinh tế & Quản trị");
            var cat3 = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Văn học & Nghệ thuật");

            var books = new List<Book>
            {
                new Book
                {
                    Title = "Clean Code",
                    Author = "Robert C. Martin",
                    CategoryId = cat1?.Id,
                    Category = cat1?.Name ?? "Công nghệ thông tin",
                    ISBN = "978-0132350884",
                    Publisher = "Prentice Hall",
                    PublishedYear = 2008,
                    Description = "Cuốn sách kinh điển hướng dẫn viết mã nguồn sạch và dễ bảo trì.",
                    CoverImage = "https://images-na.ssl-images-amazon.com/images/I/41xShOLq1FL._SX396_BO1,204,203,200_.jpg",
                    Copies = new List<BookCopy>
                    {
                        new BookCopy { CopyCode = "CC-001", Status = "Available", Condition = "Mới" },
                        new BookCopy { CopyCode = "CC-002", Status = "Available", Condition = "Mới" },
                        new BookCopy { CopyCode = "CC-003", Status = "Available", Condition = "Cũ" }
                    }
                },
                new Book
                {
                    Title = "Design Patterns",
                    Author = "Erich Gamma, Richard Helm",
                    CategoryId = cat1?.Id,
                    Category = cat1?.Name ?? "Công nghệ thông tin",
                    ISBN = "978-0201633610",
                    Publisher = "Addison-Wesley",
                    PublishedYear = 1994,
                    Description = "Cuốn sách nền tảng về các mẫu thiết kế hướng đối tượng.",
                    CoverImage = "https://images-na.ssl-images-amazon.com/images/I/81gtKoapHFL.jpg",
                    Copies = new List<BookCopy>
                    {
                        new BookCopy { CopyCode = "DP-001", Status = "Available", Condition = "Mới" },
                        new BookCopy { CopyCode = "DP-002", Status = "Available", Condition = "Mới" }
                    }
                },
                new Book
                {
                    Title = "Đắc Nhân Tâm",
                    Author = "Dale Carnegie",
                    CategoryId = cat3?.Id,
                    Category = cat3?.Name ?? "Văn học & Nghệ thuật",
                    ISBN = "978-6045880531",
                    Publisher = "NXB Tổng Hợp TPHCM",
                    PublishedYear = 1936,
                    Description = "Cuốn sách bán chạy nhất mọi thời đại về nghệ thuật đối nhân xử thế.",
                    CoverImage = "https://images-na.ssl-images-amazon.com/images/I/718yG-+t5FL.jpg",
                    Copies = new List<BookCopy>
                    {
                        new BookCopy { CopyCode = "DNT-001", Status = "Available", Condition = "Mới" },
                        new BookCopy { CopyCode = "DNT-002", Status = "Available", Condition = "Mới" },
                        new BookCopy { CopyCode = "DNT-003", Status = "Available", Condition = "Mới" }
                    }
                },
                new Book
                {
                    Title = "Nhà Giả Kim",
                    Author = "Paulo Coelho",
                    CategoryId = cat3?.Id,
                    Category = cat3?.Name ?? "Văn học & Nghệ thuật",
                    ISBN = "978-6045629116",
                    Publisher = "NXB Hội Nhà Văn",
                    PublishedYear = 1988,
                    Description = "Câu chuyện ngụ ngôn tuyệt đẹp thúc giục con người theo đuổi ước mơ.",
                    CoverImage = "https://images-na.ssl-images-amazon.com/images/I/51wUor1d1RL._SX342_SY445_QL70_ML2_.jpg",
                    Copies = new List<BookCopy>
                    {
                        new BookCopy { CopyCode = "NGK-001", Status = "Available", Condition = "Mới" },
                        new BookCopy { CopyCode = "NGK-002", Status = "Available", Condition = "Cũ" }
                    }
                },
                new Book
                {
                    Title = "Nghĩ Giàu Và Làm Giàu",
                    Author = "Napoleon Hill",
                    CategoryId = cat2?.Id,
                    Category = cat2?.Name ?? "Kinh tế & Quản trị",
                    ISBN = "978-6045852576",
                    Publisher = "NXB Tổng Hợp TPHCM",
                    PublishedYear = 1937,
                    Description = "Quyển sách hướng dẫn chi tiết cách rèn luyện tư duy để đạt thành công tài chính.",
                    CoverImage = "https://images-na.ssl-images-amazon.com/images/I/81x2W8d-v4L.jpg",
                    Copies = new List<BookCopy>
                    {
                        new BookCopy { CopyCode = "NGLG-001", Status = "Available", Condition = "Mới" },
                        new BookCopy { CopyCode = "NGLG-002", Status = "Available", Condition = "Mới" }
                    }
                },
                new Book
                {
                    Title = "Sapiens: Lược Sử Loài Người",
                    Author = "Yuval Noah Harari",
                    CategoryId = cat3?.Id,
                    Category = cat3?.Name ?? "Văn học & Nghệ thuật",
                    ISBN = "978-6045876350",
                    Publisher = "NXB Thế Giới",
                    PublishedYear = 2011,
                    Description = "Khám phá lịch sử loài người từ thời tiền sử đến thế kỷ 21.",
                    CoverImage = "https://images-na.ssl-images-amazon.com/images/I/41+eK8zBwQL._SX319_BO1,204,203,200_.jpg",
                    Copies = new List<BookCopy>
                    {
                        new BookCopy { CopyCode = "SPS-001", Status = "Available", Condition = "Mới" },
                        new BookCopy { CopyCode = "SPS-002", Status = "Available", Condition = "Mới" }
                    }
                },
                new Book
                {
                    Title = "Zero to One",
                    Author = "Peter Thiel",
                    CategoryId = cat2?.Id,
                    Category = cat2?.Name ?? "Kinh tế & Quản trị",
                    ISBN = "978-0804139298",
                    Publisher = "Crown Business",
                    PublishedYear = 2014,
                    Description = "Tư duy khởi nghiệp sáng tạo để xây dựng tương lai đi từ không đến một.",
                    CoverImage = "https://images-na.ssl-images-amazon.com/images/I/71mU-Fio7ML.jpg",
                    Copies = new List<BookCopy>
                    {
                        new BookCopy { CopyCode = "ZTO-001", Status = "Available", Condition = "Mới" }
                    }
                },
                new Book
                {
                    Title = "The Pragmatic Programmer",
                    Author = "Andrew Hunt, David Thomas",
                    CategoryId = cat1?.Id,
                    Category = cat1?.Name ?? "Công nghệ thông tin",
                    ISBN = "978-0135957059",
                    Publisher = "Addison-Wesley",
                    PublishedYear = 1999,
                    Description = "Cẩm nang quý báu dành cho lập trình viên chuyên nghiệp.",
                    CoverImage = "https://images-na.ssl-images-amazon.com/images/I/41as+45FJOL._SX396_BO1,204,203,200_.jpg",
                    Copies = new List<BookCopy>
                    {
                        new BookCopy { CopyCode = "TPP-001", Status = "Available", Condition = "Mới" },
                        new BookCopy { CopyCode = "TPP-002", Status = "Available", Condition = "Mới" }
                    }
                },
                new Book
                {
                    Title = "Kinh Điển Về Khởi Nghiệp",
                    Author = "Bill Aulet",
                    CategoryId = cat2?.Id,
                    Category = cat2?.Name ?? "Kinh tế & Quản trị",
                    ISBN = "978-6045889343",
                    Publisher = "NXB Tổng Hợp TPHCM",
                    PublishedYear = 2013,
                    Description = "24 bước cụ thể giúp bạn khởi nghiệp thành công.",
                    CoverImage = "https://images-na.ssl-images-amazon.com/images/I/81xY3B9V6dL.jpg",
                    Copies = new List<BookCopy>
                    {
                        new BookCopy { CopyCode = "KDKN-001", Status = "Available", Condition = "Mới" }
                    }
                },
                new Book
                {
                    Title = "Tuần Làm Việc 4 Giờ",
                    Author = "Timothy Ferriss",
                    CategoryId = cat2?.Id,
                    Category = cat2?.Name ?? "Kinh tế & Quản trị",
                    ISBN = "978-0307465351",
                    Publisher = "Crown",
                    PublishedYear = 2007,
                    Description = "Bản tuyên ngôn giải thoát bạn khỏi văn phòng 9-5 để sống tự do.",
                    CoverImage = "https://images-na.ssl-images-amazon.com/images/I/81q77Q3WnlL.jpg",
                    Copies = new List<BookCopy>
                    {
                        new BookCopy { CopyCode = "TLV4G-001", Status = "Available", Condition = "Mới" }
                    }
                }
            };

            context.Books.AddRange(books);
            await context.SaveChangesAsync();
        }
    }
}