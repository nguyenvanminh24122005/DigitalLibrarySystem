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
        book.Title = (book.Title ?? string.Empty).Trim();
        book.Author = (book.Author ?? string.Empty).Trim();
        book.Category = (book.Category ?? string.Empty).Trim();
        book.Publisher = (book.Publisher ?? string.Empty).Trim();
        book.ISBN = (book.ISBN ?? string.Empty).Trim();
        book.Description = book.Description ?? string.Empty;
        book.CoverImage = book.CoverImage ?? string.Empty;

        if (book.Copies is { Count: > 0 })
        {
            var index = 1;
            foreach (var copy in book.Copies)
            {
                ApplyCopyDefaults(copy, book.Id, book.ISBN, index++);
            }
        }

        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return await GetBookByIdAsync(book.Id) ?? book;
    }

    public async Task<Book?> UpdateBookAsync(int id, Book book)
    {
        var existingBook = await _context.Books.FindAsync(id);
        if (existingBook == null) return null;

        existingBook.Title = book.Title ?? existingBook.Title;
        existingBook.Author = book.Author ?? existingBook.Author;
        existingBook.Category = book.Category ?? existingBook.Category;
        existingBook.ISBN = book.ISBN ?? existingBook.ISBN;
        existingBook.Publisher = book.Publisher ?? existingBook.Publisher;
        existingBook.PublishedYear = book.PublishedYear == 0 ? existingBook.PublishedYear : book.PublishedYear;
        existingBook.CoverImage = book.CoverImage ?? existingBook.CoverImage;
        existingBook.Description = book.Description ?? existingBook.Description;

        await _context.SaveChangesAsync();
        return await GetBookByIdAsync(id);
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

    public async Task<List<BookCopy>> GetCopiesByBookIdAsync(int bookId)
    {
        return await _context.BookCopies
            .AsNoTracking()
            .Where(c => c.BookId == bookId)
            .OrderBy(c => c.Id)
            .ToListAsync();
    }

    public async Task<BookCopy?> GetCopyByIdAsync(int copyId)
    {
        return await _context.BookCopies
            .Include(c => c.Book)
            .FirstOrDefaultAsync(c => c.Id == copyId);
    }

    public async Task<BookCopy?> GetCopyByCodeAsync(string copyCode)
    {
        var normalized = (copyCode ?? string.Empty).Trim();
        return await _context.BookCopies
            .Include(c => c.Book)
            .FirstOrDefaultAsync(c => c.CopyCode == normalized);
    }

    public async Task<List<BookCopy>> GetAllCopiesAsync()
    {
        return await _context.BookCopies
            .Include(c => c.Book)
            .OrderByDescending(c => c.Id)
            .ToListAsync();
    }

    public async Task<BookCopy?> AddCopyAsync(int bookId, BookCopy copy)
    {
        var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == bookId);
        if (book == null) return null;

        var index = await _context.BookCopies.CountAsync(c => c.BookId == bookId) + 1;
        ApplyCopyDefaults(copy, bookId, book.ISBN, index);

        _context.BookCopies.Add(copy);
        await _context.SaveChangesAsync();
        return await GetCopyByIdAsync(copy.Id);
    }

    public async Task<BookCopy?> UpdateCopyAsync(int bookId, int copyId, BookCopy copy)
    {
        var existingCopy = await _context.BookCopies.FirstOrDefaultAsync(c => c.BookId == bookId && c.Id == copyId);
        if (existingCopy == null) return null;
        UpdateCopyFields(existingCopy, copy);
        await _context.SaveChangesAsync();
        return await GetCopyByIdAsync(copyId);
    }

    public async Task<BookCopy?> UpdateCopyByIdAsync(int copyId, BookCopy copy)
    {
        var existingCopy = await _context.BookCopies.FirstOrDefaultAsync(c => c.Id == copyId);
        if (existingCopy == null) return null;
        UpdateCopyFields(existingCopy, copy);
        await _context.SaveChangesAsync();
        return await GetCopyByIdAsync(copyId);
    }

    public async Task<bool> DeleteCopyAsync(int bookId, int copyId)
    {
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.BookId == bookId && c.Id == copyId);
        if (copy == null) return false;

        _context.BookCopies.Remove(copy);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCopyByIdAsync(int copyId)
    {
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.Id == copyId);
        if (copy == null) return false;
        _context.BookCopies.Remove(copy);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<BookCopy?> BorrowCopyAsync(int bookId, int copyId)
    {
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.BookId == bookId && c.Id == copyId);
        return await BorrowCopyInternalAsync(copy);
    }

    public async Task<BookCopy?> BorrowCopyByCodeAsync(string copyCode)
    {
        var normalized = (copyCode ?? string.Empty).Trim();
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.CopyCode == normalized);
        return await BorrowCopyInternalAsync(copy);
    }

    public async Task<BookCopy?> ReturnCopyAsync(int bookId, int copyId)
    {
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.BookId == bookId && c.Id == copyId);
        return await ReturnCopyInternalAsync(copy);
    }

    public async Task<BookCopy?> ReturnCopyByCodeAsync(string copyCode)
    {
        var normalized = (copyCode ?? string.Empty).Trim();
        var copy = await _context.BookCopies.FirstOrDefaultAsync(c => c.CopyCode == normalized);
        return await ReturnCopyInternalAsync(copy);
    }

    private async Task<BookCopy?> BorrowCopyInternalAsync(BookCopy? copy)
    {
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
        return await GetCopyByIdAsync(copy.Id);
    }

    private async Task<BookCopy?> ReturnCopyInternalAsync(BookCopy? copy)
    {
        if (copy == null) return null;

        if (copy.Condition == "Hỏng") copy.Status = "Damaged";
        else if (copy.Condition == "Mất") copy.Status = "Lost";
        else copy.Status = "Available";

        await _context.SaveChangesAsync();
        return await GetCopyByIdAsync(copy.Id);
    }

    private static void ApplyCopyDefaults(BookCopy copy, int bookId, string? isbn, int index)
    {
        copy.BookId = bookId;
        copy.CopyCode = string.IsNullOrWhiteSpace(copy.CopyCode)
            ? $"{(string.IsNullOrWhiteSpace(isbn) ? $"BOOK-{bookId}" : isbn)}-{index:000}"
            : copy.CopyCode.Trim();
        copy.Status = NormalizeStatus(copy.Status);
        copy.Condition = NormalizeCondition(copy.Condition);
        copy.Location = copy.Location?.Trim() ?? string.Empty;
        copy.Note = copy.Note?.Trim() ?? string.Empty;
    }

    private static void UpdateCopyFields(BookCopy existingCopy, BookCopy input)
    {
        if (!string.IsNullOrWhiteSpace(input.CopyCode)) existingCopy.CopyCode = input.CopyCode.Trim();
        existingCopy.Status = NormalizeStatus(input.Status);
        existingCopy.Condition = NormalizeCondition(input.Condition);
        existingCopy.Location = input.Location?.Trim() ?? existingCopy.Location;
        existingCopy.Note = input.Note?.Trim() ?? existingCopy.Note;

        if (existingCopy.Condition == "Hỏng") existingCopy.Status = "Damaged";
        if (existingCopy.Condition == "Mất") existingCopy.Status = "Lost";
    }

    private static string NormalizeStatus(string? status)
    {
        var value = (status ?? string.Empty).Trim().ToLowerInvariant();
        return value switch
        {
            "borrowed" or "đang mượn" or "dang muon" => "Borrowed",
            "damaged" or "hỏng" or "hong" => "Damaged",
            "lost" or "mất" or "mat" => "Lost",
            "unavailable" or "không khả dụng" or "khong kha dung" => "Unavailable",
            _ => "Available"
        };
    }

    private static string NormalizeCondition(string? condition)
    {
        var value = (condition ?? string.Empty).Trim().ToLowerInvariant();
        return value switch
        {
            "cũ" or "cu" or "old" => "Cũ",
            "hỏng" or "hong" or "damaged" => "Hỏng",
            "mất" or "mat" or "lost" => "Mất",
            _ => "Mới"
        };
    }
}
