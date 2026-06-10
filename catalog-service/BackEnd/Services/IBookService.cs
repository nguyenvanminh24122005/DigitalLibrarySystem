using CatalogService.Models;

namespace CatalogService.Services;

public interface IBookService
{
    Task<List<Book>> GetAllBooksAsync();
    Task<Book?> GetBookByIdAsync(int id);
    Task<Book> CreateBookAsync(Book book);
    Task<Book?> UpdateBookAsync(int id, Book book);
    Task<bool> DeleteBookAsync(int id);

    Task<List<Book>> SearchBooksAsync(
        string? keyword,
        string? title,
        string? author,
        string? category,
        string? isbn,
        string? publisher,
        string? status,
        string? condition);

    Task<bool> IsBookAvailableAsync(int bookId);

    Task<BookCopy?> AddCopyAsync(int bookId, BookCopy copy);
    Task<BookCopy?> UpdateCopyAsync(int bookId, int copyId, BookCopy copy);
    Task<bool> DeleteCopyAsync(int bookId, int copyId);

    Task<BookCopy?> BorrowCopyAsync(int bookId, int copyId);
    Task<BookCopy?> ReturnCopyAsync(int bookId, int copyId);
    Task<BookCopy?> GetCopyByCodeAsync(string copyCode);
    Task<BookCopy?> BorrowCopyByCodeAsync(string copyCode);
    Task<BookCopy?> ReturnCopyByCodeAsync(string copyCode);
    Task<BookCopy?> UpdateCopyDirectAsync(int copyId, BookCopy copy);
    Task<bool> DeleteCopyDirectAsync(int copyId);
}
