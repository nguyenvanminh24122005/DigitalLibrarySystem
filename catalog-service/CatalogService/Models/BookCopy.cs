using System.Text.Json.Serialization;

namespace CatalogService.Models;

public class BookCopy
{
    public int Id { get; set; }

    public int BookId { get; set; }

    public string CopyCode { get; set; } = string.Empty;

    // Trạng thái mượn/trả: Available, Borrowed, Damaged, Lost, Unavailable
    public string Status { get; set; } = "Available";

    // Tình trạng vật lý: Mới, Cũ, Hỏng, Mất
    public string Condition { get; set; } = "Mới";

    public string Location { get; set; } = string.Empty;

    public string Note { get; set; } = string.Empty;

    [JsonIgnore]
    public Book? Book { get; set; }
}
