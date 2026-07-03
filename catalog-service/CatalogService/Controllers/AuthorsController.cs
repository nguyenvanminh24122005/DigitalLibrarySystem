using CatalogService.Data;
using CatalogService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/authors")]
public class AuthorsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthorsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? keyword, [FromQuery] string? status)
    {
        var query = _context.Authors.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var key = keyword.Trim().ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(key) ||
                x.Nationality.ToLower().Contains(key) ||
                x.Description.ToLower().Contains(key));
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
        var item = await _context.Authors.FindAsync(id);

        return item == null
            ? NotFound("Không tìm thấy tác giả.")
            : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Author author)
    {
        if (string.IsNullOrWhiteSpace(author.Name))
        {
            return BadRequest("Tên tác giả không được để trống.");
        }

        author.Name = author.Name.Trim();
        author.Nationality = author.Nationality?.Trim() ?? string.Empty;
        author.Description = author.Description?.Trim() ?? string.Empty;
        author.Status = string.IsNullOrWhiteSpace(author.Status)
            ? "Hoạt động"
            : author.Status.Trim();

        author.CreatedAt = DateTime.UtcNow;
        author.UpdatedAt = DateTime.UtcNow;

        _context.Authors.Add(author);
        await _context.SaveChangesAsync();

        return Ok(author);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Author input)
    {
        var item = await _context.Authors.FindAsync(id);

        if (item == null)
        {
            return NotFound("Không tìm thấy tác giả để cập nhật.");
        }

        if (string.IsNullOrWhiteSpace(input.Name))
        {
            return BadRequest("Tên tác giả không được để trống.");
        }

        item.Name = input.Name.Trim();
        item.Nationality = input.Nationality?.Trim() ?? string.Empty;
        item.Description = input.Description?.Trim() ?? string.Empty;

        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            item.Status = input.Status.Trim();
        }

        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Authors.FindAsync(id);

        if (item == null)
        {
            return NotFound("Không tìm thấy tác giả để xóa.");
        }

        item.Status = "Ngưng sử dụng";
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Đã ngưng hiển thị tác giả.",
            data = item
        });
    }
}