using CatalogService.Data;
using CatalogService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

public class PublisherRequest
{
    public string? Name { get; set; }
    public string? Country { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? Status { get; set; }
}

[ApiController]
[Route("api/publishers")]
public class PublishersController : ControllerBase
{
    private readonly AppDbContext _context;

    public PublishersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? keyword, [FromQuery] string? status)
    {
        var query = _context.Publishers.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var key = keyword.Trim().ToLower();

            query = query.Where(x =>
                x.Name.ToLower().Contains(key) ||
                x.Country.ToLower().Contains(key) ||
                x.Email.ToLower().Contains(key) ||
                x.Phone.ToLower().Contains(key) ||
                x.Website.ToLower().Contains(key) ||
                x.Address.ToLower().Contains(key));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        var data = await query
            .OrderByDescending(x => x.UpdatedAt)
            .ThenBy(x => x.Name)
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _context.Publishers.FindAsync(id);

        return item == null
            ? NotFound("Không tìm thấy nhà xuất bản.")
            : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PublisherRequest request)
    {
        if (request == null)
        {
            return BadRequest("Dữ liệu gửi lên không hợp lệ.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Tên nhà xuất bản không được để trống.");
        }

        var publisher = new Publisher
        {
            Name = request.Name.Trim(),
            Country = request.Country?.Trim() ?? string.Empty,
            Email = request.Email?.Trim() ?? string.Empty,
            Phone = request.Phone?.Trim() ?? string.Empty,
            Website = request.Website?.Trim() ?? string.Empty,
            Address = request.Address?.Trim() ?? string.Empty,
            Status = string.IsNullOrWhiteSpace(request.Status)
                ? "Hoạt động"
                : request.Status.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Publishers.Add(publisher);
        await _context.SaveChangesAsync();

        return Ok(publisher);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PublisherRequest request)
    {
        var item = await _context.Publishers.FindAsync(id);

        if (item == null)
        {
            return NotFound("Không tìm thấy nhà xuất bản để cập nhật.");
        }

        if (request == null)
        {
            return BadRequest("Dữ liệu gửi lên không hợp lệ.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Tên nhà xuất bản không được để trống.");
        }

        item.Name = request.Name.Trim();
        item.Country = request.Country?.Trim() ?? string.Empty;
        item.Email = request.Email?.Trim() ?? string.Empty;
        item.Phone = request.Phone?.Trim() ?? string.Empty;
        item.Website = request.Website?.Trim() ?? string.Empty;
        item.Address = request.Address?.Trim() ?? string.Empty;

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            item.Status = request.Status.Trim();
        }

        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Publishers.FindAsync(id);

        if (item == null)
        {
            return NotFound("Không tìm thấy nhà xuất bản để xóa.");
        }

        item.Status = "Ngưng sử dụng";
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Đã ngưng hợp tác nhà xuất bản.",
            data = item
        });
    }
}