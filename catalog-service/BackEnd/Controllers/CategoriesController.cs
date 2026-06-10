using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CatalogService.Data;
using CatalogService.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetAll()
    {
        return await db.Categories.ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetById(int id)
    {
        var category = await db.Categories.FindAsync(id);
        if (category == null) return NotFound(new { message = "Không tìm thấy thể loại" });
        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<Category>> Create(Category category)
    {
        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Category category)
    {
        var existing = await db.Categories.FindAsync(id);
        if (existing == null) return NotFound(new { message = "Không tìm thấy thể loại" });

        existing.Name = category.Name;
        existing.Description = category.Description;

        await db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await db.Categories.FindAsync(id);
        if (category == null) return NotFound(new { message = "Không tìm thấy thể loại" });

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        return Ok(new { message = "Xóa thể loại thành công" });
    }
}
