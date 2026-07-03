using CatalogService.Models;
using CatalogService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CatalogService.Data;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;
    private readonly AppDbContext _context;

    public BooksController(IBookService bookService, AppDbContext context)
    {
        _bookService = bookService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBooks()
    {
        var books = await _bookService.GetAllBooksAsync();
        return Ok(books);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBookById(int id)
    {
        var book = await _bookService.GetBookByIdAsync(id);
        return book == null ? NotFound("Không tìm thấy sách.") : Ok(book);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBook(Book book)
    {
        if (string.IsNullOrWhiteSpace(book.Title)) return BadRequest("Tên sách không được để trống.");
        var createdBook = await _bookService.CreateBookAsync(book);
        return Ok(createdBook);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBook(int id, Book book)
    {
        var updatedBook = await _bookService.UpdateBookAsync(id, book);
        return updatedBook == null ? NotFound("Không tìm thấy sách để cập nhật.") : Ok(updatedBook);
    }

    [HttpDelete("{id:int}")]
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

    [HttpGet("{id:int}/availability")]
    public async Task<IActionResult> CheckAvailability(int id)
    {
        var book = await _context.Books
            .Include(b => b.Copies)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null) return NotFound("Không tìm thấy sách.");

        var copies = book.Copies.Select(c => ToCopyDto(c, book.Title)).ToList();

        var availableCopies = book.Copies.Count(c => IsAvailable(c));
        return Ok(new
        {
            bookId = id,
            available = availableCopies > 0,
            availableCopies,
            totalCopies = book.Copies.Count,
            copies,
            message = availableCopies > 0 ? "Sách còn có thể mượn." : "Sách hiện không còn bản sao khả dụng."
        });
    }

    [HttpGet("{bookId:int}/copies")]
    public async Task<IActionResult> GetCopiesByBookId(int bookId)
    {
        var book = await _context.Books
            .Include(b => b.Copies)
            .FirstOrDefaultAsync(b => b.Id == bookId);

        if (book == null) return NotFound("Không tìm thấy sách.");

        return Ok(book.Copies.OrderBy(c => c.Id).Select(c => ToCopyDto(c, book.Title)).ToList());
    }

    [HttpPost("{bookId:int}/copies")]
    public async Task<IActionResult> AddCopy(int bookId, BookCopy copy)
    {
        var createdCopy = await _bookService.AddCopyAsync(bookId, copy);
        return createdCopy == null ? NotFound("Không tìm thấy sách để thêm bản sao.") : Ok(ToCopyDto(createdCopy, createdCopy.Book?.Title));
    }

    [HttpPut("{bookId:int}/copies/{copyId:int}")]
    public async Task<IActionResult> UpdateCopy(int bookId, int copyId, BookCopy copy)
    {
        var updatedCopy = await _bookService.UpdateCopyAsync(bookId, copyId, copy);
        return updatedCopy == null ? NotFound("Không tìm thấy bản sao để cập nhật.") : Ok(ToCopyDto(updatedCopy, updatedCopy.Book?.Title));
    }

    [HttpDelete("{bookId:int}/copies/{copyId:int}")]
    public async Task<IActionResult> DeleteCopy(int bookId, int copyId)
    {
        var result = await _bookService.DeleteCopyAsync(bookId, copyId);
        return !result ? NotFound("Không tìm thấy bản sao để xóa.") : Ok("Xóa bản sao thành công.");
    }

    [HttpPut("{bookId:int}/copies/{copyId:int}/borrow")]
    public async Task<IActionResult> BorrowCopy(int bookId, int copyId)
    {
        try
        {
            var copy = await _bookService.BorrowCopyAsync(bookId, copyId);
            return copy == null ? NotFound("Không tìm thấy bản sao để cho mượn.") : Ok(ToCopyDto(copy, copy.Book?.Title));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{bookId:int}/copies/{copyId:int}/return")]
    public async Task<IActionResult> ReturnCopy(int bookId, int copyId)
    {
        var copy = await _bookService.ReturnCopyAsync(bookId, copyId);
        return copy == null ? NotFound("Không tìm thấy bản sao để trả sách.") : Ok(ToCopyDto(copy, copy.Book?.Title));
    }

    private static bool IsAvailable(BookCopy c)
    {
        var status = (c.Status ?? string.Empty).Trim().ToLowerInvariant();
        var condition = (c.Condition ?? string.Empty).Trim().ToLowerInvariant();
        var statusAvailable = status == "available" || status.Contains("có thể") || status.Contains("co the");
        var conditionOk = !condition.Contains("hỏng") && !condition.Contains("hong") && !condition.Contains("mất") && !condition.Contains("mat");
        return statusAvailable && conditionOk;
    }

    private static object ToCopyDto(BookCopy c, string? bookTitle)
    {
        return new
        {
            id = c.Id,
            copyId = c.Id,
            bookId = c.BookId,
            bookTitle = bookTitle ?? c.Book?.Title ?? string.Empty,
            barcode = c.CopyCode,
            copyCode = c.CopyCode,
            status = c.Status,
            borrowStatus = c.Status,
            condition = c.Condition,
            location = c.Location,
            shelfLocation = c.Location,
            note = c.Note
        };
    }
}
