using CatalogService.Data;
using CatalogService.Dtos;
using CatalogService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Authorize]
public sealed class LookupsController(CatalogDbContext db) : ControllerBase
{
    [HttpGet("api/categories")]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories() =>
        Ok(await db.Categories.OrderBy(x => x.Name).Select(x => new CategoryDto(x.Id, x.Name, x.Description, x.Status, x.UpdatedAt)).ToListAsync());

    [HttpPost("api/categories")]
    public async Task<ActionResult<CategoryDto>> CreateCategory(CreateCategoryRequest request)
    {
        if (await db.Categories.AnyAsync(x => x.Name == request.Name)) return Conflict("Tên thể loại đã tồn tại.");
        var entity = new Category { Name = request.Name.Trim(), Description = request.Description, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Categories.Add(entity);
        await db.SaveChangesAsync();
        return Ok(new CategoryDto(entity.Id, entity.Name, entity.Description, entity.Status, entity.UpdatedAt));
    }

    [HttpPut("api/categories/{id:guid}")]
    public async Task<IActionResult> UpdateCategory(Guid id, CreateCategoryRequest request)
    {
        var entity = await db.Categories.FindAsync(id);
        if (entity is null) return NotFound();
        entity.Name = request.Name.Trim();
        entity.Description = request.Description;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("api/categories/{id:guid}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var entity = await db.Categories.FindAsync(id);
        if (entity is null) return NotFound();
        entity.Status = CatalogStatus.Inactive;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("api/authors")]
    public async Task<ActionResult<IEnumerable<AuthorDto>>> GetAuthors() =>
        Ok(await db.Authors.OrderBy(x => x.Name).Select(x => new AuthorDto(x.Id, x.Name, x.Nationality, x.Description, x.Status, x.UpdatedAt)).ToListAsync());

    [HttpPost("api/authors")]
    public async Task<ActionResult<AuthorDto>> CreateAuthor(CreateAuthorRequest request)
    {
        var entity = new Author { Name = request.Name.Trim(), Nationality = request.Nationality, Description = request.Description, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Authors.Add(entity);
        await db.SaveChangesAsync();
        return Ok(new AuthorDto(entity.Id, entity.Name, entity.Nationality, entity.Description, entity.Status, entity.UpdatedAt));
    }

    [HttpPut("api/authors/{id:guid}")]
    public async Task<IActionResult> UpdateAuthor(Guid id, CreateAuthorRequest request)
    {
        var entity = await db.Authors.FindAsync(id);
        if (entity is null) return NotFound();
        entity.Name = request.Name.Trim();
        entity.Nationality = request.Nationality;
        entity.Description = request.Description;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("api/authors/{id:guid}")]
    public async Task<IActionResult> DeleteAuthor(Guid id)
    {
        var entity = await db.Authors.FindAsync(id);
        if (entity is null) return NotFound();
        entity.Status = CatalogStatus.Inactive;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("api/publishers")]
    public async Task<ActionResult<IEnumerable<PublisherDto>>> GetPublishers() =>
        Ok(await db.Publishers.OrderBy(x => x.Name).Select(x => new PublisherDto(x.Id, x.Name, x.Country, x.Address, x.Email, x.Phone, x.Status, x.UpdatedAt)).ToListAsync());

    [HttpPost("api/publishers")]
    public async Task<ActionResult<PublisherDto>> CreatePublisher(CreatePublisherRequest request)
    {
        var entity = new Publisher { Name = request.Name.Trim(), Country = request.Country, Address = request.Address, Email = request.Email, Phone = request.Phone, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Publishers.Add(entity);
        await db.SaveChangesAsync();
        return Ok(new PublisherDto(entity.Id, entity.Name, entity.Country, entity.Address, entity.Email, entity.Phone, entity.Status, entity.UpdatedAt));
    }

    [HttpPut("api/publishers/{id:guid}")]
    public async Task<IActionResult> UpdatePublisher(Guid id, CreatePublisherRequest request)
    {
        var entity = await db.Publishers.FindAsync(id);
        if (entity is null) return NotFound();
        entity.Name = request.Name.Trim();
        entity.Country = request.Country;
        entity.Address = request.Address;
        entity.Email = request.Email;
        entity.Phone = request.Phone;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("api/publishers/{id:guid}")]
    public async Task<IActionResult> DeletePublisher(Guid id)
    {
        var entity = await db.Publishers.FindAsync(id);
        if (entity is null) return NotFound();
        entity.Status = CatalogStatus.Inactive;
        entity.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
