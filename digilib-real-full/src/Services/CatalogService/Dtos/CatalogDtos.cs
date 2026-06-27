using CatalogService.Models;

namespace CatalogService.Dtos;

public record CategoryDto(Guid Id, string Name, string? Description, CatalogStatus Status, DateTime UpdatedAt);
public record AuthorDto(Guid Id, string Name, string? Nationality, string? Description, CatalogStatus Status, DateTime UpdatedAt);
public record PublisherDto(Guid Id, string Name, string? Country, string? Address, string? Email, string? Phone, CatalogStatus Status, DateTime UpdatedAt);

public sealed record CreateCategoryRequest(string Name, string? Description);
public sealed record CreateAuthorRequest(string Name, string? Nationality, string? Description);
public sealed record CreatePublisherRequest(string Name, string? Country, string? Address, string? Email, string? Phone);

public sealed record BookDto(
    Guid Id,
    string ISBN,
    string Title,
    string? Subtitle,
    string? DeweyCode,
    Guid? AuthorId,
    string? AuthorName,
    Guid? CategoryId,
    string? CategoryName,
    Guid? PublisherId,
    string? PublisherName,
    int PublishYear,
    string Language,
    int PageCount,
    string? Description,
    string? CoverImageUrl,
    CatalogStatus Status,
    int TotalCopies,
    int AvailableCopies,
    int BorrowedCopies,
    int DamagedCopies,
    int LostCopies,
    bool CanBorrow,
    DateTime UpdatedAt);

public sealed record CreateBookRequest(
    string ISBN,
    string Title,
    string? Subtitle,
    string? DeweyCode,
    Guid? AuthorId,
    Guid? CategoryId,
    Guid? PublisherId,
    int PublishYear,
    string Language,
    int PageCount,
    string? Description,
    string? CoverImageUrl,
    int InitialCopies,
    string? ShelfLocation,
    string? Note);

public sealed record UpdateBookRequest(
    string ISBN,
    string Title,
    string? Subtitle,
    string? DeweyCode,
    Guid? AuthorId,
    Guid? CategoryId,
    Guid? PublisherId,
    int PublishYear,
    string Language,
    int PageCount,
    string? Description,
    string? CoverImageUrl,
    CatalogStatus Status);

public sealed record BookCopyDto(
    Guid Id,
    Guid BookId,
    string BookTitle,
    string ISBN,
    string CopyCode,
    string ShelfLocation,
    CopyCondition Condition,
    BorrowStatus BorrowStatus,
    string? CurrentBorrowTicketCode,
    string? Note,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record CreateBookCopyRequest(Guid BookId, string? CopyCode, string ShelfLocation, CopyCondition Condition, BorrowStatus BorrowStatus, string? Note);
public sealed record UpdateBookCopyRequest(string ShelfLocation, CopyCondition Condition, BorrowStatus BorrowStatus, string? CurrentBorrowTicketCode, string? Note);
public sealed record AdjustBookCopiesRequest(int DesiredTotalCopies, string? ShelfLocation, string? Note);

public sealed record BookAvailabilityDto(
    Guid BookId,
    string ISBN,
    string Title,
    int TotalCopies,
    int AvailableCopies,
    int BorrowedCopies,
    int DamagedCopies,
    int LostCopies,
    bool CanBorrow);

public sealed record BorrowCopyRequest(string? BorrowTicketCode);
public sealed record ReturnCopyRequest(string? Note, CopyCondition? Condition);
