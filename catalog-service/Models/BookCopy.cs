using System.Text.Json.Serialization;

namespace CatalogService.Models;

public class BookCopy
{
    public int Id { get; set; }

    public int BookId { get; set; }

    public string CopyCode { get; set; } = string.Empty;

    // Trạng thái mượn/trả
    public string Status { get; set; } = "Available";

    // Tình trạng vật lý
    public string Condition { get; set; } = "Mới";

    [JsonIgnore]
    public Book? Book { get; set; }
}