using System.ComponentModel.DataAnnotations;

namespace CirculationService.Api.DTOs;

public class BorrowRecordCreateRequest
{
    [Range(1, int.MaxValue)]
    public int ReaderId { get; set; }

    [Required, MaxLength(200)]
    public string ReaderName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string CardNumber { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string CopyCode { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int BookId { get; set; }

    [Required, MaxLength(300)]
    public string BookTitle { get; set; } = string.Empty;

    public DateTime? BorrowDate { get; set; }
}

public class BorrowRecordReturnRequest
{
    public DateTime? ReturnDate { get; set; }
}

public class BorrowRecordResponse
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
    public string Status { get; set; } = string.Empty;
    public decimal Fine { get; set; }
    public int CurrentOverdueDays { get; set; }
    public decimal EstimatedFine { get; set; }
}
