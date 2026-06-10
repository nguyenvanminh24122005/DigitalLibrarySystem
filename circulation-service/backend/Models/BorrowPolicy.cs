namespace CirculationService.Models;

public class BorrowPolicy
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int MaxBooks { get; set; } = 5;
    public int MaxDays { get; set; } = 14;
    public decimal FinePerDay { get; set; } = 5000;
}
