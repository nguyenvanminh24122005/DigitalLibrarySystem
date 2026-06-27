namespace CatalogService.Models;

public class NotificationItem
{
    public int Id { get; set; }
    public string UserId { get; set; } = "demo-user";
    public string Type { get; set; } = "system";
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }
    public int? RelatedBookId { get; set; }
}
