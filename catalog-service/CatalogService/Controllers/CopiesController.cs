using CatalogService.Models;
using CatalogService.Services;
using Microsoft.AspNetCore.Mvc;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/copies")]
public class CopiesController : ControllerBase
{
    private readonly IBookService _bookService;

    public CopiesController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? bookId)
    {
        var copies = bookId.HasValue
            ? await _bookService.GetCopiesByBookIdAsync(bookId.Value)
            : await _bookService.GetAllCopiesAsync();

        return Ok(copies.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var copy = await _bookService.GetCopyByIdAsync(id);
        return copy == null ? NotFound("Không tìm thấy bản sao.") : Ok(ToDto(copy));
    }

    [HttpGet("by-code/{copyCode}")]
    public async Task<IActionResult> GetByCode(string copyCode)
    {
        var copy = await _bookService.GetCopyByCodeAsync(copyCode);
        return copy == null ? NotFound("Không tìm thấy bản sao.") : Ok(ToDto(copy));
    }

    [HttpPost]
    public async Task<IActionResult> Create(BookCopy input)
    {
        if (input.BookId <= 0) return BadRequest("BookId không hợp lệ.");
        var copy = await _bookService.AddCopyAsync(input.BookId, input);
        return copy == null ? NotFound("Không tìm thấy sách để thêm bản sao.") : Ok(ToDto(copy));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, BookCopy input)
    {
        var copy = await _bookService.UpdateCopyByIdAsync(id, input);
        return copy == null ? NotFound("Không tìm thấy bản sao để cập nhật.") : Ok(ToDto(copy));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _bookService.DeleteCopyByIdAsync(id);
        return !result ? NotFound("Không tìm thấy bản sao để xóa.") : Ok("Xóa bản sao thành công.");
    }

    [HttpPut("{id:int}/borrow")]
    public async Task<IActionResult> BorrowById(int id)
    {
        var copy = await _bookService.GetCopyByIdAsync(id);
        if (copy == null) return NotFound("Không tìm thấy bản sao.");
        var updated = await _bookService.BorrowCopyAsync(copy.BookId, copy.Id);
        return updated == null ? NotFound("Không tìm thấy bản sao.") : Ok(ToDto(updated));
    }

    [HttpPut("{id:int}/return")]
    public async Task<IActionResult> ReturnById(int id)
    {
        var copy = await _bookService.GetCopyByIdAsync(id);
        if (copy == null) return NotFound("Không tìm thấy bản sao.");
        var updated = await _bookService.ReturnCopyAsync(copy.BookId, copy.Id);
        return updated == null ? NotFound("Không tìm thấy bản sao.") : Ok(ToDto(updated));
    }

    [HttpPut("by-code/{copyCode}/borrow")]
    public async Task<IActionResult> BorrowByCode(string copyCode)
    {
        var updated = await _bookService.BorrowCopyByCodeAsync(copyCode);
        return updated == null ? NotFound("Không tìm thấy bản sao.") : Ok(ToDto(updated));
    }

    [HttpPut("by-code/{copyCode}/return")]
    public async Task<IActionResult> ReturnByCode(string copyCode)
    {
        var updated = await _bookService.ReturnCopyByCodeAsync(copyCode);
        return updated == null ? NotFound("Không tìm thấy bản sao.") : Ok(ToDto(updated));
    }

    private static object ToDto(BookCopy c)
    {
        return new
        {
            id = c.Id,
            copyId = c.Id,
            bookId = c.BookId,
            bookTitle = c.Book?.Title ?? string.Empty,
            isbn = c.Book?.ISBN ?? string.Empty,
            coverImage = c.Book?.CoverImage ?? string.Empty,
            copyCode = c.CopyCode,
            barcode = c.CopyCode,
            status = c.Status,
            borrowStatus = c.Status,
            condition = c.Condition,
            location = c.Location,
            shelfLocation = c.Location,
            note = c.Note
        };
    }
}
