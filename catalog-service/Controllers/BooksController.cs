using CatalogService.Models;
using CatalogService.Services;
using Microsoft.AspNetCore.Mvc;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBooks()
    {
        var books = await _bookService.GetAllBooksAsync();
        return Ok(books);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBookById(int id)
    {
        var book = await _bookService.GetBookByIdAsync(id);
        return book == null ? NotFound("Không tìm thấy sách.") : Ok(book);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBook(Book book)
    {
        var createdBook = await _bookService.CreateBookAsync(book);
        return Ok(createdBook);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(int id, Book book)
    {
        var updatedBook = await _bookService.UpdateBookAsync(id, book);
        return updatedBook == null ? NotFound("Không tìm thấy sách để cập nhật.") : Ok(updatedBook);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var result = await _bookService.DeleteBookAsync(id);
        return !result ? NotFound("Không tìm thấy sách để xóa.") : Ok("Xóa sách thành công.");
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchBooks(
        [FromQuery] string? keyword,
        [FromQuery] string? title,
        [FromQuery] string? author,
        [FromQuery] string? category,
        [FromQuery] string? isbn,
        [FromQuery] string? publisher,
        [FromQuery] string? status,
        [FromQuery] string? condition)
    {
        var books = await _bookService.SearchBooksAsync(keyword, title, author, category, isbn, publisher, status, condition);
        return Ok(books);
    }

    [HttpGet("{id}/availability")]
    public async Task<IActionResult> CheckAvailability(int id)
    {
        var isAvailable = await _bookService.IsBookAvailableAsync(id);
        return Ok(new
        {
            bookId = id,
            available = isAvailable,
            message = isAvailable ? "Sách còn có thể mượn." : "Sách hiện không còn bản sao khả dụng."
        });
    }

    [HttpPost("{bookId}/copies")]
    public async Task<IActionResult> AddCopy(int bookId, BookCopy copy)
    {
        var createdCopy = await _bookService.AddCopyAsync(bookId, copy);
        return createdCopy == null ? NotFound("Không tìm thấy sách để thêm bản sao.") : Ok(createdCopy);
    }

    [HttpPut("{bookId}/copies/{copyId}")]
    public async Task<IActionResult> UpdateCopy(int bookId, int copyId, BookCopy copy)
    {
        var updatedCopy = await _bookService.UpdateCopyAsync(bookId, copyId, copy);
        return updatedCopy == null ? NotFound("Không tìm thấy bản sao để cập nhật.") : Ok(updatedCopy);
    }

    [HttpDelete("{bookId}/copies/{copyId}")]
    public async Task<IActionResult> DeleteCopy(int bookId, int copyId)
    {
        var result = await _bookService.DeleteCopyAsync(bookId, copyId);
        return !result ? NotFound("Không tìm thấy bản sao để xóa.") : Ok("Xóa bản sao thành công.");
    }

    [HttpPut("{bookId}/copies/{copyId}/borrow")]
    public async Task<IActionResult> BorrowCopy(int bookId, int copyId)
    {
        try
        {
            var copy = await _bookService.BorrowCopyAsync(bookId, copyId);
            return copy == null ? NotFound("Không tìm thấy bản sao để cho mượn.") : Ok(copy);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{bookId}/copies/{copyId}/return")]
    public async Task<IActionResult> ReturnCopy(int bookId, int copyId)
    {
        var copy = await _bookService.ReturnCopyAsync(bookId, copyId);
        return copy == null ? NotFound("Không tìm thấy bản sao để trả sách.") : Ok(copy);
    }
}
