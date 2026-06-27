using System.Text.Json;
using CatalogService.Data;
using CatalogService.Dtos;
using CatalogService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/books")]
[Authorize]
public sealed class BooksController(CatalogDbContext db) : ControllerBase
{
    // ADMIN + USER
    // GET /api/books?q=...&author=...&category=...&publishYear=2024&availableOnly=true
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks(
        [FromQuery] string? q,
        [FromQuery] string? keyword,
        [FromQuery] string? title,
        [FromQuery] string? author,
        [FromQuery] Guid? categoryId,
        [FromQuery] string? category,
        [FromQuery] Guid? authorId,
        [FromQuery] Guid? publisherId,
        [FromQuery] string? publisher,
        [FromQuery] int? publishYear,
        [FromQuery] int? year,
        [FromQuery] int? yearFrom,
        [FromQuery] int? yearTo,
        [FromQuery] CatalogStatus? status,
        [FromQuery] bool? availableOnly)
    {
        var query = BaseBookQuery();

        var searchKeyword = FirstNotEmpty(q, keyword);
        if (!string.IsNullOrWhiteSpace(searchKeyword))
        {
            var value = searchKeyword.Trim();
            query = query.Where(x =>
                x.Title.Contains(value) ||
                x.ISBN.Contains(value) ||
                (x.Subtitle != null && x.Subtitle.Contains(value)) ||
                (x.Author != null && x.Author.Name.Contains(value)) ||
                (x.Category != null && x.Category.Name.Contains(value)) ||
                (x.Publisher != null && x.Publisher.Name.Contains(value)));
        }

        if (!string.IsNullOrWhiteSpace(title)) query = query.Where(x => x.Title.Contains(title.Trim()));
        if (!string.IsNullOrWhiteSpace(author)) query = query.Where(x => x.Author != null && x.Author.Name.Contains(author.Trim()));
        if (!string.IsNullOrWhiteSpace(category)) query = query.Where(x => x.Category != null && x.Category.Name.Contains(category.Trim()));
        if (!string.IsNullOrWhiteSpace(publisher)) query = query.Where(x => x.Publisher != null && x.Publisher.Name.Contains(publisher.Trim()));

        if (categoryId.HasValue) query = query.Where(x => x.CategoryId == categoryId);
        if (authorId.HasValue) query = query.Where(x => x.AuthorId == authorId);
        if (publisherId.HasValue) query = query.Where(x => x.PublisherId == publisherId);

        var finalYear = publishYear ?? year;
        if (finalYear.HasValue) query = query.Where(x => x.PublishYear == finalYear.Value);
        if (yearFrom.HasValue) query = query.Where(x => x.PublishYear >= yearFrom.Value);
        if (yearTo.HasValue) query = query.Where(x => x.PublishYear <= yearTo.Value);

        if (status.HasValue) query = query.Where(x => x.Status == status.Value);
        if (availableOnly == true)
        {
            query = query.Where(x =>
                x.Status == CatalogStatus.Active &&
                x.Copies.Any(c => c.BorrowStatus == BorrowStatus.Available && c.Condition == CopyCondition.Good));
        }

        var books = await query.OrderByDescending(x => x.UpdatedAt).ToListAsync();
        return Ok(books.Select(ToDto));
    }

    // USER-COMPATIBLE ALIAS
    // GET /api/books/search?keyword=java&author=...&category=...&year=2024&publisher=...
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<BookDto>>> SearchBooks(
        [FromQuery] string? q,
        [FromQuery] string? keyword,
        [FromQuery] string? title,
        [FromQuery] string? author,
        [FromQuery] string? category,
        [FromQuery] string? publisher,
        [FromQuery] int? publishYear,
        [FromQuery] int? year,
        [FromQuery] bool? availableOnly)
    {
        return await GetBooks(
            q: q,
            keyword: keyword,
            title: title,
            author: author,
            categoryId: null,
            category: category,
            authorId: null,
            publisherId: null,
            publisher: publisher,
            publishYear: publishYear,
            year: year,
            yearFrom: null,
            yearTo: null,
            status: CatalogStatus.Active,
            availableOnly: availableOnly);
    }

    // ADMIN + USER
    // GET /api/books/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookDto>> GetBook(Guid id)
    {
        var book = await BaseBookQuery().FirstOrDefaultAsync(x => x.Id == id);
        return book is null ? NotFound() : Ok(ToDto(book));
    }

    // ADMIN
    // POST /api/books
    [HttpPost]
    public async Task<ActionResult<BookDto>> CreateBook(CreateBookRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ISBN) || string.IsNullOrWhiteSpace(request.Title))
            return BadRequest("ISBN và tên sách là bắt buộc.");

        if (request.PublishYear < 1000 || request.PublishYear > DateTime.UtcNow.Year + 1)
            return BadRequest("Năm xuất bản không hợp lệ.");

        if (await db.Books.AnyAsync(x => x.ISBN == request.ISBN.Trim()))
            return Conflict("ISBN đã tồn tại trong hệ thống.");

        var book = new Book
        {
            ISBN = request.ISBN.Trim(),
            Title = request.Title.Trim(),
            Subtitle = request.Subtitle,
            DeweyCode = request.DeweyCode,
            AuthorId = request.AuthorId,
            CategoryId = request.CategoryId,
            PublisherId = request.PublisherId,
            PublishYear = request.PublishYear,
            Language = string.IsNullOrWhiteSpace(request.Language) ? "Tiếng Việt" : request.Language.Trim(),
            PageCount = Math.Max(0, request.PageCount),
            Description = request.Description,
            CoverImageUrl = request.CoverImageUrl,
            Status = CatalogStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Books.Add(book);
        await db.SaveChangesAsync();

        var copyCount = request.InitialCopies <= 0 ? 1 : request.InitialCopies;
        var currentCount = await db.BookCopies.CountAsync() + 1;
        for (var i = 0; i < copyCount; i++)
        {
            db.BookCopies.Add(new BookCopy
            {
                BookId = book.Id,
                CopyCode = $"BLB{currentCount + i:0000}",
                ShelfLocation = string.IsNullOrWhiteSpace(request.ShelfLocation) ? "Chưa phân kệ" : request.ShelfLocation.Trim(),
                Condition = CopyCondition.Good,
                BorrowStatus = BorrowStatus.Available,
                Note = request.Note,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        db.CatalogEvents.Add(CreateEvent("book.created", "Book", book.Id.ToString(), $"Thêm sách mới {book.Title}", new
        {
            book.Id,
            book.ISBN,
            book.Title,
            initialCopies = copyCount
        }));

        db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", book.Id.ToString(), $"Tạo {copyCount} bản sao ban đầu cho sách {book.Title}", new
        {
            bookId = book.Id,
            oldTotal = 0,
            newTotal = copyCount,
            oldAvailable = 0,
            newAvailable = copyCount
        }));

        await db.SaveChangesAsync();

        var created = await BaseBookQuery().FirstAsync(x => x.Id == book.Id);
        return CreatedAtAction(nameof(GetBook), new { id = book.Id }, ToDto(created));
    }

    // ADMIN
    // PUT /api/books/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateBook(Guid id, UpdateBookRequest request)
    {
        var book = await db.Books.FindAsync(id);
        if (book is null) return NotFound();
        if (string.IsNullOrWhiteSpace(request.ISBN) || string.IsNullOrWhiteSpace(request.Title)) return BadRequest("ISBN và tên sách là bắt buộc.");
        if (await db.Books.AnyAsync(x => x.Id != id && x.ISBN == request.ISBN.Trim())) return Conflict("ISBN đã tồn tại.");

        book.ISBN = request.ISBN.Trim();
        book.Title = request.Title.Trim();
        book.Subtitle = request.Subtitle;
        book.DeweyCode = request.DeweyCode;
        book.AuthorId = request.AuthorId;
        book.CategoryId = request.CategoryId;
        book.PublisherId = request.PublisherId;
        book.PublishYear = request.PublishYear;
        book.Language = string.IsNullOrWhiteSpace(request.Language) ? "Tiếng Việt" : request.Language.Trim();
        book.PageCount = Math.Max(0, request.PageCount);
        book.Description = request.Description;
        book.CoverImageUrl = request.CoverImageUrl;
        book.Status = request.Status;
        book.UpdatedAt = DateTime.UtcNow;

        db.CatalogEvents.Add(CreateEvent("book.updated", "Book", book.Id.ToString(), $"Cập nhật sách {book.Title}", new
        {
            book.Id,
            book.ISBN,
            book.Title,
            book.Status
        }));

        await db.SaveChangesAsync();
        return NoContent();
    }

    // ADMIN
    // DELETE /api/books/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBook(Guid id)
    {
        var book = await db.Books.Include(x => x.Copies).FirstOrDefaultAsync(x => x.Id == id);
        if (book is null) return NotFound();

        var before = BuildAvailability(book);
        var hasBorrowedCopy = book.Copies.Any(x => x.BorrowStatus == BorrowStatus.Borrowed);
        if (hasBorrowedCopy)
        {
            book.Status = CatalogStatus.Inactive;
            book.UpdatedAt = DateTime.UtcNow;
            db.CatalogEvents.Add(CreateEvent("book.inactivated", "Book", id.ToString(), $"Ngừng hoạt động sách {book.Title} vì còn bản sao đang mượn", before));
        }
        else
        {
            db.Books.Remove(book);
            db.CatalogEvents.Add(CreateEvent("book.deleted", "Book", id.ToString(), $"Xóa sách {book.Title}", before));
            db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", id.ToString(), $"Xóa toàn bộ bản sao của sách {book.Title}", new
            {
                bookId = id,
                oldTotal = before.TotalCopies,
                newTotal = 0,
                oldAvailable = before.AvailableCopies,
                newAvailable = 0
            }));
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    // USER-COMPATIBLE
    // GET /api/books/{id}/availability
    [HttpGet("{id:guid}/availability")]
    public async Task<ActionResult<BookAvailabilityDto>> GetAvailability(Guid id)
    {
        var book = await db.Books.Include(x => x.Copies).FirstOrDefaultAsync(x => x.Id == id);
        return book is null ? NotFound() : Ok(BuildAvailability(book));
    }

    // ADMIN
    // POST /api/books/{id}/copies/adjust
    [HttpPost("{id:guid}/copies/adjust")]
    public async Task<ActionResult<BookAvailabilityDto>> AdjustCopies(Guid id, AdjustBookCopiesRequest request)
    {
        if (request.DesiredTotalCopies < 0) return BadRequest("Số lượng bản sao không hợp lệ.");

        var book = await db.Books.Include(x => x.Copies).FirstOrDefaultAsync(x => x.Id == id);
        if (book is null) return NotFound();

        var before = BuildAvailability(book);
        var current = book.Copies.Count;
        if (request.DesiredTotalCopies == current) return Ok(before);

        if (request.DesiredTotalCopies > current)
        {
            var toAdd = request.DesiredTotalCopies - current;
            var globalCount = await db.BookCopies.CountAsync() + 1;
            for (var i = 0; i < toAdd; i++)
            {
                db.BookCopies.Add(new BookCopy
                {
                    BookId = book.Id,
                    CopyCode = $"BLB{globalCount + i:0000}",
                    ShelfLocation = string.IsNullOrWhiteSpace(request.ShelfLocation) ? "Chưa phân kệ" : request.ShelfLocation.Trim(),
                    Condition = CopyCondition.Good,
                    BorrowStatus = BorrowStatus.Available,
                    Note = request.Note,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }
        else
        {
            var toRemove = current - request.DesiredTotalCopies;
            var removable = book.Copies
                .Where(x => x.BorrowStatus != BorrowStatus.Borrowed)
                .OrderByDescending(x => x.CreatedAt)
                .Take(toRemove)
                .ToList();

            if (removable.Count < toRemove)
                return BadRequest("Không thể giảm số lượng vì còn bản sao đang được mượn.");

            db.BookCopies.RemoveRange(removable);
        }

        book.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var updated = await db.Books.Include(x => x.Copies).FirstAsync(x => x.Id == id);
        var after = BuildAvailability(updated);
        db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", id.ToString(), $"Điều chỉnh số lượng bản sao sách {book.Title}: {before.TotalCopies} -> {after.TotalCopies}", new { before, after }));
        await db.SaveChangesAsync();

        return Ok(after);
    }

    // ADMIN + USER
    // GET /api/books/{id}/copies
    [HttpGet("{id:guid}/copies")]
    public async Task<ActionResult<IEnumerable<BookCopyDto>>> GetBookCopies(Guid id)
    {
        var bookExists = await db.Books.AnyAsync(x => x.Id == id);
        if (!bookExists) return NotFound("Sách không tồn tại.");

        var copies = await db.BookCopies
            .Include(x => x.Book)
            .Where(x => x.BookId == id)
            .OrderBy(x => x.CopyCode)
            .ToListAsync();

        return Ok(copies.Select(CopiesController.ToDto));
    }

    // USER-COMPATIBLE ALIAS FOR COPY CREATE
    // POST /api/books/{bookId}/copies
    [HttpPost("{bookId:guid}/copies")]
    public async Task<ActionResult<BookCopyDto>> CreateCopyForBook(Guid bookId, CreateBookCopyRequest request)
    {
        if (request.BookId != Guid.Empty && request.BookId != bookId)
            return BadRequest("BookId trong URL và body không khớp.");

        var book = await db.Books.Include(x => x.Copies).FirstOrDefaultAsync(x => x.Id == bookId);
        if (book is null) return NotFound("Sách không tồn tại.");

        var oldAvailable = CountAvailable(book.Copies);
        var copyCode = string.IsNullOrWhiteSpace(request.CopyCode)
            ? $"BLB{await db.BookCopies.CountAsync() + 1:0000}"
            : request.CopyCode.Trim();

        if (await db.BookCopies.AnyAsync(x => x.CopyCode == copyCode))
            return Conflict("Mã bản sao đã tồn tại.");

        var copy = new BookCopy
        {
            BookId = bookId,
            CopyCode = copyCode,
            ShelfLocation = string.IsNullOrWhiteSpace(request.ShelfLocation) ? "Chưa phân kệ" : request.ShelfLocation.Trim(),
            Condition = request.Condition,
            BorrowStatus = request.BorrowStatus,
            Note = request.Note,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.BookCopies.Add(copy);
        db.CatalogEvents.Add(CreateEvent("book.copy_added", "BookCopy", copy.Id.ToString(), $"Thêm bản sao mới {copy.CopyCode}", new
        {
            copy.BookId,
            copy.CopyCode,
            copy.Condition,
            copy.BorrowStatus
        }));

        if (copy.BorrowStatus == BorrowStatus.Available && copy.Condition == CopyCondition.Good)
        {
            db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", book.Id.ToString(), $"Tăng số lượng có thể mượn của sách {book.Title}", new
            {
                bookId = book.Id,
                oldAvailable,
                newAvailable = oldAvailable + 1
            }));
        }

        await db.SaveChangesAsync();

        var created = await db.BookCopies.Include(x => x.Book).FirstAsync(x => x.Id == copy.Id);
        return CreatedAtAction(nameof(GetBookCopies), new { id = bookId }, CopiesController.ToDto(created));
    }

    // USER-COMPATIBLE ALIAS FOR COPY UPDATE
    // PUT /api/books/{bookId}/copies/{copyId}
    [HttpPut("{bookId:guid}/copies/{copyId:guid}")]
    public async Task<IActionResult> UpdateCopyForBook(Guid bookId, Guid copyId, UpdateBookCopyRequest request)
    {
        var copy = await db.BookCopies.Include(x => x.Book).FirstOrDefaultAsync(x => x.Id == copyId && x.BookId == bookId);
        if (copy is null) return NotFound("Bản sao không tồn tại.");

        var oldCondition = copy.Condition;
        var oldStatus = copy.BorrowStatus;
        var oldAvailable = await CountAvailableAsync(bookId);

        copy.ShelfLocation = string.IsNullOrWhiteSpace(request.ShelfLocation) ? copy.ShelfLocation : request.ShelfLocation.Trim();
        copy.Condition = request.Condition;
        copy.BorrowStatus = request.Condition == CopyCondition.Lost || request.Condition == CopyCondition.Damaged
            ? BorrowStatus.Unavailable
            : request.BorrowStatus;
        copy.CurrentBorrowTicketCode = copy.BorrowStatus == BorrowStatus.Available ? null : request.CurrentBorrowTicketCode;
        copy.Note = request.Note;
        copy.UpdatedAt = DateTime.UtcNow;

        db.CatalogEvents.Add(CreateEvent("book.copy_updated", "BookCopy", copy.Id.ToString(), $"Cập nhật bản sao {copy.CopyCode}", new
        {
            oldCondition,
            newCondition = copy.Condition,
            oldStatus,
            newStatus = copy.BorrowStatus
        }));

        var newAvailable = await CountAvailableAfterCurrentCopyAsync(bookId, copy);
        if (oldAvailable != newAvailable || oldStatus != copy.BorrowStatus || oldCondition != copy.Condition)
        {
            db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", copy.BookId.ToString(), $"Thay đổi trạng thái bản sao {copy.CopyCode}: {oldStatus}/{oldCondition} -> {copy.BorrowStatus}/{copy.Condition}", new
            {
                copy.BookId,
                copy.CopyCode,
                oldStatus,
                newStatus = copy.BorrowStatus,
                oldCondition,
                newCondition = copy.Condition,
                oldAvailable,
                newAvailable
            }));
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    // USER-COMPATIBLE ALIAS FOR COPY DELETE
    // DELETE /api/books/{bookId}/copies/{copyId}
    [HttpDelete("{bookId:guid}/copies/{copyId:guid}")]
    public async Task<IActionResult> DeleteCopyForBook(Guid bookId, Guid copyId)
    {
        var copy = await db.BookCopies.Include(x => x.Book).FirstOrDefaultAsync(x => x.Id == copyId && x.BookId == bookId);
        if (copy is null) return NotFound("Bản sao không tồn tại.");
        if (copy.BorrowStatus == BorrowStatus.Borrowed) return BadRequest("Không thể xóa bản sao đang được mượn.");

        var oldAvailable = await CountAvailableAsync(bookId);

        db.BookCopies.Remove(copy);
        db.CatalogEvents.Add(CreateEvent("book.copy_deleted", "BookCopy", copy.Id.ToString(), $"Xóa bản sao {copy.CopyCode}", new
        {
            copy.BookId,
            copy.CopyCode
        }));

        if (copy.BorrowStatus == BorrowStatus.Available && copy.Condition == CopyCondition.Good)
        {
            db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", copy.BookId.ToString(), $"Giảm số lượng có thể mượn của sách {copy.Book?.Title}", new
            {
                copy.BookId,
                oldAvailable,
                newAvailable = Math.Max(0, oldAvailable - 1)
            }));
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    // THỦ THƯ / CIRCULATION SERVICE
    // PUT /api/books/{bookId}/copies/{copyId}/borrow
    [HttpPut("{bookId:guid}/copies/{copyId:guid}/borrow")]
    public async Task<ActionResult<BookCopyDto>> BorrowCopy(Guid bookId, Guid copyId, [FromBody] BorrowCopyRequest? request = null)
    {
        var copy = await db.BookCopies.Include(x => x.Book).FirstOrDefaultAsync(x => x.Id == copyId && x.BookId == bookId);
        if (copy is null) return NotFound("Bản sao không tồn tại.");
        if (copy.Condition != CopyCondition.Good) return BadRequest("Bản sao không ở tình trạng tốt nên không thể mượn.");
        if (copy.BorrowStatus != BorrowStatus.Available) return BadRequest("Bản sao này hiện không sẵn sàng để mượn.");

        var oldAvailable = await CountAvailableAsync(bookId);
        var oldStatus = copy.BorrowStatus;

        copy.BorrowStatus = BorrowStatus.Borrowed;
        copy.CurrentBorrowTicketCode = request?.BorrowTicketCode;
        copy.UpdatedAt = DateTime.UtcNow;

        db.CatalogEvents.Add(CreateEvent("book.copy_borrowed", "BookCopy", copy.Id.ToString(), $"Bản sao {copy.CopyCode} được mượn", new
        {
            copy.BookId,
            copy.CopyCode,
            oldStatus,
            newStatus = copy.BorrowStatus,
            request?.BorrowTicketCode
        }));

        db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", bookId.ToString(), $"Giảm số lượng có thể mượn do mượn bản sao {copy.CopyCode}", new
        {
            bookId,
            copyId,
            oldAvailable,
            newAvailable = Math.Max(0, oldAvailable - 1)
        }));

        await db.SaveChangesAsync();

        var updated = await db.BookCopies.Include(x => x.Book).FirstAsync(x => x.Id == copyId);
        return Ok(CopiesController.ToDto(updated));
    }

    // THỦ THƯ / CIRCULATION SERVICE
    // PUT /api/books/{bookId}/copies/{copyId}/return
    [HttpPut("{bookId:guid}/copies/{copyId:guid}/return")]
    public async Task<ActionResult<BookCopyDto>> ReturnCopy(Guid bookId, Guid copyId, [FromBody] ReturnCopyRequest? request = null)
    {
        var copy = await db.BookCopies.Include(x => x.Book).FirstOrDefaultAsync(x => x.Id == copyId && x.BookId == bookId);
        if (copy is null) return NotFound("Bản sao không tồn tại.");

        var oldAvailable = await CountAvailableAsync(bookId);
        var oldStatus = copy.BorrowStatus;
        var oldCondition = copy.Condition;

        copy.Condition = request?.Condition ?? copy.Condition;
        copy.BorrowStatus = copy.Condition == CopyCondition.Good ? BorrowStatus.Available : BorrowStatus.Unavailable;
        copy.CurrentBorrowTicketCode = null;
        copy.Note = string.IsNullOrWhiteSpace(request?.Note) ? copy.Note : request!.Note;
        copy.UpdatedAt = DateTime.UtcNow;

        db.CatalogEvents.Add(CreateEvent("book.copy_returned", "BookCopy", copy.Id.ToString(), $"Bản sao {copy.CopyCode} được trả", new
        {
            copy.BookId,
            copy.CopyCode,
            oldStatus,
            newStatus = copy.BorrowStatus,
            oldCondition,
            newCondition = copy.Condition
        }));

        var newAvailable = oldAvailable;
        if (oldStatus != BorrowStatus.Available && copy.BorrowStatus == BorrowStatus.Available && copy.Condition == CopyCondition.Good)
        {
            newAvailable = oldAvailable + 1;
        }
        else if (oldStatus == BorrowStatus.Available && copy.BorrowStatus != BorrowStatus.Available)
        {
            newAvailable = Math.Max(0, oldAvailable - 1);
        }

        if (newAvailable != oldAvailable || oldStatus != copy.BorrowStatus || oldCondition != copy.Condition)
        {
            db.CatalogEvents.Add(CreateEvent("book.availability.changed", "Book", bookId.ToString(), $"Thay đổi số lượng có thể mượn do trả bản sao {copy.CopyCode}", new
            {
                bookId,
                copyId,
                oldAvailable,
                newAvailable,
                oldStatus,
                newStatus = copy.BorrowStatus,
                oldCondition,
                newCondition = copy.Condition
            }));
        }

        await db.SaveChangesAsync();

        var updated = await db.BookCopies.Include(x => x.Book).FirstAsync(x => x.Id == copyId);
        return Ok(CopiesController.ToDto(updated));
    }

    // ADMIN + REPORT
    // GET /api/books/{id}/history
    [HttpGet("{id:guid}/history")]
    public async Task<ActionResult<IEnumerable<CatalogEvent>>> GetBookHistory(Guid id)
    {
        var events = await db.CatalogEvents
            .Where(x => x.EntityId == id.ToString() || x.Description.Contains(id.ToString()))
            .OrderByDescending(x => x.CreatedAt)
            .Take(50)
            .ToListAsync();

        return Ok(events);
    }

    private IQueryable<Book> BaseBookQuery() => db.Books
        .Include(x => x.Author)
        .Include(x => x.Category)
        .Include(x => x.Publisher)
        .Include(x => x.Copies)
        .AsQueryable();

    private CatalogEvent CreateEvent(string type, string entityType, string entityId, string description, object? payload = null) => new()
    {
        EventType = type,
        EntityType = entityType,
        EntityId = entityId,
        Description = description,
        Payload = payload is null ? null : JsonSerializer.Serialize(payload),
        CreatedBy = User.Identity?.Name ?? "Admin",
        CreatedAt = DateTime.UtcNow
    };

    private static BookAvailabilityDto BuildAvailability(Book book)
    {
        var total = book.Copies.Count;
        var available = CountAvailable(book.Copies);
        var borrowed = book.Copies.Count(x => x.BorrowStatus == BorrowStatus.Borrowed);
        var damaged = book.Copies.Count(x => x.Condition == CopyCondition.Damaged);
        var lost = book.Copies.Count(x => x.Condition == CopyCondition.Lost);

        return new BookAvailabilityDto(
            book.Id,
            book.ISBN,
            book.Title,
            total,
            available,
            borrowed,
            damaged,
            lost,
            book.Status == CatalogStatus.Active && available > 0);
    }

    private static BookDto ToDto(Book book)
    {
        var availability = BuildAvailability(book);
        return new BookDto(
            book.Id,
            book.ISBN,
            book.Title,
            book.Subtitle,
            book.DeweyCode,
            book.AuthorId,
            book.Author?.Name,
            book.CategoryId,
            book.Category?.Name,
            book.PublisherId,
            book.Publisher?.Name,
            book.PublishYear,
            book.Language,
            book.PageCount,
            book.Description,
            book.CoverImageUrl,
            book.Status,
            availability.TotalCopies,
            availability.AvailableCopies,
            availability.BorrowedCopies,
            availability.DamagedCopies,
            availability.LostCopies,
            availability.CanBorrow,
            book.UpdatedAt);
    }

    private static int CountAvailable(IEnumerable<BookCopy> copies)
    {
        return copies.Count(x => x.BorrowStatus == BorrowStatus.Available && x.Condition == CopyCondition.Good);
    }

    private async Task<int> CountAvailableAsync(Guid bookId)
    {
        return await db.BookCopies.CountAsync(x => x.BookId == bookId && x.BorrowStatus == BorrowStatus.Available && x.Condition == CopyCondition.Good);
    }

    private async Task<int> CountAvailableAfterCurrentCopyAsync(Guid bookId, BookCopy currentCopy)
    {
        var otherAvailable = await db.BookCopies.CountAsync(x =>
            x.BookId == bookId &&
            x.Id != currentCopy.Id &&
            x.BorrowStatus == BorrowStatus.Available &&
            x.Condition == CopyCondition.Good);

        return otherAvailable + (currentCopy.BorrowStatus == BorrowStatus.Available && currentCopy.Condition == CopyCondition.Good ? 1 : 0);
    }

    private static string? FirstNotEmpty(params string?[] values)
    {
        return values.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x));
    }
}
