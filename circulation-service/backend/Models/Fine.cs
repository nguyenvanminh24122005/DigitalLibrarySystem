using System;

namespace CirculationService.Models;

public class Fine
{
    public int Id { get; set; }
    public int ReaderId { get; set; }
    public string ReaderName { get; set; } = string.Empty;
    public string CardNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Unpaid"; // Unpaid, Paid
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
