using CatalogService.Data;
using CatalogService.Models;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Services;

public class BookService : IBookService
{
    private readonly AppDbContext _context;

    public BookService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Book>> GetAllBooksAsync()
    {
        return await _context.Books
            .Include(b => b.Copies)
            .OrderByDescending(b => b.Id)
            .ToListAsync();
    }

    public async Task<Book?> GetBookByIdAsync(int id)
    {
        return await _context.Books
            .Include(b => b.Copies)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Book> CreateBookAsync(Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return book;
    }

    public async Task<Book?> UpdateBookAsync(int id, Book book)
    {
        var existingBook = await _context.Books.FindAsync(id);
        if (existingBook == null) return null;

        existingBook.Title = book.Title;
        existingBook.Author = book.Author;
        existingBook.Category = book.Category;
        existingBook.CategoryId = book.CategoryId;
        existingBook.ISBN = book.ISBN;
        existingBook.Publisher = book.Publisher;
        existingBook.PublishedYear = book.PublishedYear;
        existingBook.CoverImage = book.CoverImage;
        existingBook.Description = book.Description;

        await _context.SaveChangesAsync();
        return existingBook;
    }

    public async Task<bool> DeleteBookAsync(int id)
    {
        var book = await _context.Books
            .Include(b => b.Copies)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null) return false;

        _context.BookCopies.RemoveRange(book.Copies);
        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<Book>> SearchBooksAsync(
        string? keyword,
        string? title,
        string? author,
        string? category,
        string? isbn,
        string? publisher,
        string? status,
        string? condition)
    {
        var query = _context.Books.Include(b => b.Copies).AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            keyword = keyword.Trim();
            query = query.Where(b =>
                b.Title.Contains(keyword) ||
                b.Author.Contains(keyword) ||
                b.Category.Contains(keyword) ||
                b.ISBN.Contains(keyword) ||
                b.Publisher.Contains(keyword) ||
                b.PublishedYear.ToString().Contains(keyword));
        }

        if (!string.IsNullOrWhiteSpace(title)) query = query.Where(b => b.Title.Contains(title.Trim()));
        if (!string.IsNullOrWhiteSpace(author)) query = query.Where(b => b.Author.Contains(author.Trim()));
        if (!string.IsNullOrWhiteSpace(category)) query = query.Where(b => b.Category.Contains(category.Trim()));
        if (!string.IsNullOrWhiteSpace(isbn)) query = query.Where(b => b.ISBN.Contains(isbn.Trim()));
        if (!string.IsNullOrWhiteSpace(publisher)) query = query.Where(b => b.Publisher.Contains(publisher.Trim()));
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(b => b.Copies.Any(c => c.Status == status));
        if (!string.IsNullOrWhiteSpace(condition)) query = query.Where(b => b.Copies.Any(c => c.Condition == condition));

        return await query.OrderByDescending(b => b.Id).ToListAsync();
    }

    public async Task<bool> IsBookAvailableAsync(int bookId)
    {
        return await _context.BookCopies.AnyAsync(c =>
            c.BookId == bookId &&
            c.Status == "Available" &&
            c.Condition != "Hỏng" &&
            c.Condition != "Mất");
    }

    public async Task<BookCopy?> AddCopyAsync(int bookId, BookCopy copy)
    {
        var bookExists = await _context.Books.AnyAsync(b => b.Id == bookId);
        if (!bookExists) return null;

        copy.BookId = bookId;
        copy.CopyCode = string.IsNullOrWhiteSpace(copy.CopyCode)
            ? $"BC-{bookId:0000}-{DateTime.Now:HHmmss}"
            : copy.CopyCode.Trim();
        copy.Status = NormalizeStatus(copy.Status);
        copy.Condition = NormalizeCondition(copy.Condition);

        _context.BookCopies.Add(copy);
        await _context.SaveChangesAsync();
        return copy;
    }

    public async Task<BookCopy?> UpdateCopyAsync(int bookId, int copyId, BookCopy copy)
    {
        var existingCopy = await _context.BookCopies.FirstOrDefaultAsync(c => c.BookId == bookId && c.Id == copyId);
        if (existingCopy == null) return null;

        existingCopy.CopyCode = string.IsNullOrWhiteSpace(copy.CopyCode) ? existingCopy.CopyCode : copy.CopyCode.Trim();
        existingCopy.Status = NormalizeStatus(copy.Status);
        existingCopy.Condition = NormalizeCondition(copy.Condition);

        if (existingCopy.Condition == "Hỏng") existingCopy.Status = "Damaged";
        if (existingCopy.Condition == "Mất") existingCopy.Status = "Lost";

        await _context.SaveChangesAsync();
        return existingCopy;
    }

    public async Task<bool> DeleteCopyAsync(int bookId, int copyId)
    {
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.BookId == bookId && c.Id == copyId);
        if (copy == null) return false;

        _context.BookCopies.Remove(copy);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<BookCopy?> BorrowCopyAsync(int bookId, int copyId)
    {
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.BookId == bookId && c.Id == copyId);
        if (copy == null) return null;

        if (copy.Condition == "Hỏng" || copy.Condition == "Mất" || copy.Status == "Damaged" || copy.Status == "Lost")
        {
            throw new InvalidOperationException("Bản sao đang hỏng hoặc mất nên không thể cho mượn.");
        }

        if (copy.Status == "Borrowed")
        {
            throw new InvalidOperationException("Bản sao này đang được mượn.");
        }

        copy.Status = "Borrowed";
        await _context.SaveChangesAsync();
        return copy;
    }

    public async Task<BookCopy?> ReturnCopyAsync(int bookId, int copyId)
    {
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.BookId == bookId && c.Id == copyId);
        if (copy == null) return null;

        if (copy.Condition == "Hỏng") copy.Status = "Damaged";
        else if (copy.Condition == "Mất") copy.Status = "Lost";
        else copy.Status = "Available";

        await _context.SaveChangesAsync();
        return copy;
    }

    private static string NormalizeStatus(string? status)
    {
        return status switch
        {
            "Borrowed" => "Borrowed",
            "Damaged" => "Damaged",
            "Lost" => "Lost",
            _ => "Available"
        };
    }

    private static string NormalizeCondition(string? condition)
    {
        return condition switch
        {
            "Cũ" => "Cũ",
            "Hỏng" => "Hỏng",
            "Mất" => "Mất",
            _ => "Mới"
        };
    }

    public async Task<BookCopy?> GetCopyByCodeAsync(string copyCode)
    {
        return await _context.BookCopies
            .Include(c => c.Book)
            .FirstOrDefaultAsync(c => c.CopyCode == copyCode);
    }

    public async Task<BookCopy?> BorrowCopyByCodeAsync(string copyCode)
    {
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.CopyCode == copyCode);
        if (copy == null) return null;
        if (copy.Status == "Borrowed") throw new InvalidOperationException("Bản sao này đang được mượn.");
        copy.Status = "Borrowed";
        await _context.SaveChangesAsync();
        return copy;
    }

    public async Task<BookCopy?> ReturnCopyByCodeAsync(string copyCode)
    {
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.CopyCode == copyCode);
        if (copy == null) return null;
        copy.Status = "Available";
        await _context.SaveChangesAsync();
        return copy;
    }

    public async Task<BookCopy?> UpdateCopyDirectAsync(int copyId, BookCopy copy)
    {
        var existingCopy = await _context.BookCopies.FindAsync(copyId);
        if (existingCopy == null) return null;

        existingCopy.CopyCode = string.IsNullOrWhiteSpace(copy.CopyCode) ? existingCopy.CopyCode : copy.CopyCode.Trim();
        existingCopy.Status = NormalizeStatus(copy.Status);
        existingCopy.Condition = NormalizeCondition(copy.Condition);

        await _context.SaveChangesAsync();
        return existingCopy;
    }

    public async Task<bool> DeleteCopyDirectAsync(int copyId)
    {
        var copy = await _context.BookCopies.FindAsync(copyId);
        if (copy == null) return false;

        _context.BookCopies.Remove(copy);
        await _context.SaveChangesAsync();
        return true;
    }
}
