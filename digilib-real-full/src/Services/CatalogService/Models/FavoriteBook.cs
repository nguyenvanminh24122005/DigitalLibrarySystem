namespace CatalogService.Models;

public class FavoriteBook
{
    public int Id { get; set; }
    public string UserId { get; set; } = "demo-user";
    public int BookId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Book? Book { get; set; }
}
