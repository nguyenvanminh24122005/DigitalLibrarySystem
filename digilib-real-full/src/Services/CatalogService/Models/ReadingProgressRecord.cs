namespace CatalogService.Models;

public class ReadingProgressRecord
{
    public int Id { get; set; }
    public string UserId { get; set; } = "demo-user";
    public int BookId { get; set; }
    public int Progress { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Book? Book { get; set; }
}
