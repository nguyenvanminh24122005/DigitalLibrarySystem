using CatalogService.Data;
using CatalogService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? keyword, [FromQuery] string? status)
    {
        var query = _context.Categories.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var key = keyword.Trim().ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(key) ||
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
        var item = await _context.Categories.FindAsync(id);

        return item == null
            ? NotFound("Không tìm thấy thể loại.")
            : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Category category)
    {
        if (string.IsNullOrWhiteSpace(category.Name))
        {
            return BadRequest("Tên thể loại không được để trống.");
        }

        category.Name = category.Name.Trim();
        category.Description = category.Description?.Trim() ?? string.Empty;
        category.Status = string.IsNullOrWhiteSpace(category.Status)
            ? "Hoạt động"
            : category.Status.Trim();

        category.CreatedAt = DateTime.UtcNow;
        category.UpdatedAt = DateTime.UtcNow;

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return Ok(category);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Category input)
    {
        var item = await _context.Categories.FindAsync(id);

        if (item == null)
        {
            return NotFound("Không tìm thấy thể loại để cập nhật.");
        }

        if (string.IsNullOrWhiteSpace(input.Name))
        {
            return BadRequest("Tên thể loại không được để trống.");
        }

        item.Name = input.Name.Trim();
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
        var item = await _context.Categories.FindAsync(id);

        if (item == null)
        {
            return NotFound("Không tìm thấy thể loại để xóa.");
        }

        item.Status = "Ngưng sử dụng";
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Đã ngưng sử dụng thể loại.",
            data = item
        });
    }
}