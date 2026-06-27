namespace CatalogService.Models;

public enum CatalogStatus
{
    Active = 1,
    Inactive = 2
}

public enum CopyCondition
{
    Good = 1,
    Damaged = 2,
    Lost = 3,
    Maintenance = 4
}

public enum BorrowStatus
{
    Available = 1,
    Borrowed = 2,
    Unavailable = 3
}

public sealed class Book
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ISBN { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? DeweyCode { get; set; }
    public Guid? AuthorId { get; set; }
    public Author? Author { get; set; }
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public Guid? PublisherId { get; set; }
    public Publisher? Publisher { get; set; }
    public int PublishYear { get; set; }
    public string Language { get; set; } = "Tiếng Việt";
    public int PageCount { get; set; }
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public CatalogStatus Status { get; set; } = CatalogStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<BookCopy> Copies { get; set; } = new();
}

public sealed class BookCopy
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BookId { get; set; }
    public Book? Book { get; set; }
    public string CopyCode { get; set; } = string.Empty;
    public string ShelfLocation { get; set; } = string.Empty;
    public CopyCondition Condition { get; set; } = CopyCondition.Good;
    public BorrowStatus BorrowStatus { get; set; } = BorrowStatus.Available;
    public string? CurrentBorrowTicketCode { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CatalogStatus Status { get; set; } = CatalogStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Author
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Nationality { get; set; }
    public string? Description { get; set; }
    public CatalogStatus Status { get; set; } = CatalogStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Publisher
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public CatalogStatus Status { get; set; } = CatalogStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class CatalogEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Payload { get; set; }
    public string CreatedBy { get; set; } = "system";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
