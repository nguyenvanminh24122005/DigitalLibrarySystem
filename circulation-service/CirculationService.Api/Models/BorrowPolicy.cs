namespace CirculationService.Api.Models;

public class BorrowPolicy
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int MaxBooks { get; set; }
    public int MaxDays { get; set; }
    public decimal FinePerDay { get; set; }
}
