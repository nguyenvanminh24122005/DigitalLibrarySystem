namespace CirculationService.Models;

public enum BorrowTicketStatus
{
    Borrowing = 1,
    Returned = 2,
    Overdue = 3,
    Cancelled = 4
}

public enum FineStatus
{
    Unpaid = 1,
    PartiallyPaid = 2,
    Paid = 3,
    Cancelled = 4
}

public sealed class BorrowTicket
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TicketCode { get; set; } = string.Empty;
    public Guid ReaderId { get; set; }
    public string ReaderCode { get; set; } = string.Empty;
    public string ReaderName { get; set; } = string.Empty;
    public DateTime BorrowDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(14);
    public DateTime? ReturnDate { get; set; }
    public BorrowTicketStatus Status { get; set; } = BorrowTicketStatus.Borrowing;
    public Guid LibrarianId { get; set; }
    public string LibrarianName { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<BorrowTicketItem> Items { get; set; } = new();
}

public sealed class BorrowTicketItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BorrowTicketId { get; set; }
    public BorrowTicket? BorrowTicket { get; set; }
    public Guid BookId { get; set; }
    public Guid CopyId { get; set; }
    public string CopyCode { get; set; } = string.Empty;
    public string BookTitle { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public DateTime? ReturnedDate { get; set; }
    public BorrowTicketStatus ItemStatus { get; set; } = BorrowTicketStatus.Borrowing;
    public decimal FineAmount { get; set; }
    public string? Note { get; set; }
}

public sealed class Fine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FineCode { get; set; } = string.Empty;
    public Guid BorrowTicketId { get; set; }
    public Guid ReaderId { get; set; }
    public string ReaderCode { get; set; } = string.Empty;
    public string ReaderName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public FineStatus Status { get; set; } = FineStatus.Unpaid;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
}

public sealed class CirculationLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Action { get; set; } = string.Empty;
    public string? BorrowTicketCode { get; set; }
    public string? ReaderCode { get; set; }
    public string? LibrarianName { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
