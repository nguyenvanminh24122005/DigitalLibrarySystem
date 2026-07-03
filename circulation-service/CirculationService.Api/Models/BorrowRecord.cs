namespace CirculationService.Api.Models;

public class BorrowRecord
{
    public int Id { get; set; }
    public int ReaderId { get; set; }
    public string ReaderName { get; set; } = string.Empty;
    public string CardNumber { get; set; } = string.Empty;
    public string CopyCode { get; set; } = string.Empty;
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public DateTime BorrowDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public string Status { get; set; } = BorrowStatuses.Borrowed;
    public decimal Fine { get; set; }
}
