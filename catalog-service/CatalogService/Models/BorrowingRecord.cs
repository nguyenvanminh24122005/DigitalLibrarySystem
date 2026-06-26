namespace CatalogService.Models;

public class BorrowingRecord
{
    public int Id { get; set; }
    public string LoanCode { get; set; } = string.Empty;
    public string UserId { get; set; } = "demo-user";
    public int BookId { get; set; }
    public int CopyId { get; set; }
    public string CopyCode { get; set; } = string.Empty;
    public DateTime BorrowedAt { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(14);
    public DateTime? ReturnedAt { get; set; }
    public string Status { get; set; } = "Borrowed";
    public int RenewCount { get; set; }
    public decimal FineAmount { get; set; }
    public string Note { get; set; } = string.Empty;
    public Book? Book { get; set; }
    public BookCopy? Copy { get; set; }
}
