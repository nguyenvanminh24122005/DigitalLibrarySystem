using System.Text.Json;
using CatalogService.Data;
using CatalogService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/digital-documents")]
public class DigitalDocumentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DigitalDocumentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? keyword, [FromQuery] string? type, [FromQuery] string? field, [FromQuery] string? sort)
    {
        await EnsureSeedAsync();
        var query = _context.DigitalResources.AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var q = keyword.Trim();
            query = query.Where(x => x.Title.Contains(q) || x.Author.Contains(q) || x.Type.Contains(q) || x.Field.Contains(q) || x.Keywords.Contains(q));
        }
        if (!string.IsNullOrWhiteSpace(type)) query = query.Where(x => x.Type.Contains(type.Trim()));
        if (!string.IsNullOrWhiteSpace(field)) query = query.Where(x => x.Field.Contains(field.Trim()));

        query = sort switch
        {
            "popular" => query.OrderByDescending(x => x.Views),
            "downloads" => query.OrderByDescending(x => x.Downloads),
            _ => query.OrderByDescending(x => x.UpdatedAt)
        };

        var items = await query.ToListAsync();
        return Ok(items.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        await EnsureSeedAsync();
        var item = await _context.DigitalResources.FindAsync(id);
        return item == null ? NotFound(new { message = "Không tìm thấy tài liệu số." }) : Ok(ToDto(item));
    }

    [HttpPost("{id:int}/view")]
    public async Task<IActionResult> IncreaseView(int id)
    {
        var item = await _context.DigitalResources.FindAsync(id);
        if (item == null) return NotFound(new { message = "Không tìm thấy tài liệu số." });
        item.Views += 1;
        await _context.SaveChangesAsync();
        return Ok(ToDto(item));
    }

    [HttpPost("{id:int}/download")]
    public async Task<IActionResult> IncreaseDownload(int id)
    {
        var item = await _context.DigitalResources.FindAsync(id);
        if (item == null) return NotFound(new { message = "Không tìm thấy tài liệu số." });
        item.Downloads += 1;
        await _context.SaveChangesAsync();
        return Ok(ToDto(item));
    }

    private async Task EnsureSeedAsync()
    {
        if (await _context.DigitalResources.AnyAsync()) return;

        var resources = new[]
        {
            new DigitalResource
            {
                Title = "Trí tuệ nhân tạo: Ứng dụng và triển vọng",
                Author = "Nguyễn Văn A, Trần Thị B",
                Publisher = "Nhà xuất bản Khoa học và Kỹ thuật",
                Type = "Giáo trình",
                Field = "Công nghệ thông tin, Trí tuệ nhân tạo",
                Year = 2024,
                Language = "Tiếng Việt",
                Size = "2.45 MB",
                Pages = 112,
                Views = 1258,
                Downloads = 542,
                Format = "PDF",
                UpdatedAt = new DateTime(2025, 6, 10),
                CoverUrl = "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=650&q=80",
                Description = "Tài liệu cung cấp cái nhìn tổng quan về trí tuệ nhân tạo, phương pháp tiếp cận, ứng dụng thực tiễn và xu hướng phát triển trong tương lai.",
                Keywords = "Trí tuệ nhân tạo,AI,Machine Learning,Deep Learning,Ứng dụng AI,Công nghệ",
                ContentsJson = JsonSerializer.Serialize(new[] { new object[] { "Chương 1. Tổng quan về trí tuệ nhân tạo", 1 }, new object[] { "Chương 2. Học máy", 18 }, new object[] { "Chương 3. Học sâu", 45 }, new object[] { "Chương 4. Ứng dụng AI", 78 } })
            },
            new DigitalResource
            {
                Title = "Năng lượng tái tạo và phát triển bền vững",
                Author = "Viện Khoa học Năng lượng",
                Publisher = "NXB Khoa học",
                Type = "Báo cáo nghiên cứu",
                Field = "Năng lượng, Môi trường",
                Year = 2024,
                Language = "Tiếng Việt",
                Size = "4.1 MB",
                Pages = 86,
                Views = 985,
                Downloads = 210,
                Format = "PDF",
                UpdatedAt = new DateTime(2025, 5, 20),
                CoverUrl = "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=650&q=80",
                Description = "Báo cáo phân tích vai trò của năng lượng tái tạo trong chiến lược phát triển bền vững.",
                Keywords = "Năng lượng tái tạo,Môi trường,Phát triển bền vững",
                ContentsJson = JsonSerializer.Serialize(new[] { new object[] { "Tổng quan", 1 }, new object[] { "Thực trạng", 20 }, new object[] { "Giải pháp", 55 } })
            },
            new DigitalResource
            {
                Title = "Phân tích dữ liệu với Python và Pandas",
                Author = "TS. Lê Hoàng Nam",
                Publisher = "DIGILIB Open Course",
                Type = "Giáo trình",
                Field = "Công nghệ thông tin, Dữ liệu",
                Year = 2023,
                Language = "Tiếng Việt",
                Size = "3.8 MB",
                Pages = 140,
                Views = 1500,
                Downloads = 152,
                Format = "PDF",
                UpdatedAt = new DateTime(2025, 4, 2),
                CoverUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=650&q=80",
                Description = "Tài liệu nhập môn phân tích dữ liệu với Python, NumPy và Pandas.",
                Keywords = "Python,Pandas,Data Analysis,Dữ liệu",
                ContentsJson = JsonSerializer.Serialize(new[] { new object[] { "Python cơ bản", 1 }, new object[] { "Pandas", 35 }, new object[] { "Trực quan hóa", 98 } })
            }
        };

        _context.DigitalResources.AddRange(resources);
        await _context.SaveChangesAsync();
    }

    private static object ToDto(DigitalResource item)
    {
        return new
        {
            id = item.Id,
            item.Title,
            item.Author,
            item.Publisher,
            item.Type,
            item.Field,
            item.Year,
            item.Language,
            item.Size,
            item.Pages,
            item.Views,
            item.Downloads,
            item.Format,
            item.UpdatedAt,
            item.CoverUrl,
            item.FileUrl,
            item.Description,
            keywords = string.IsNullOrWhiteSpace(item.Keywords) ? Array.Empty<string>() : item.Keywords.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
            contents = SafeContents(item.ContentsJson)
        };
    }

    private static object SafeContents(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<object>(json) ?? Array.Empty<object>();
        }
        catch
        {
            return Array.Empty<object>();
        }
    }
}
