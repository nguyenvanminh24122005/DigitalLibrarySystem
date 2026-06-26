namespace CatalogService.Models;

public class DigitalResource
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    public string Type { get; set; } = "Tài liệu";
    public string Field { get; set; } = "Khác";
    public int Year { get; set; } = DateTime.UtcNow.Year;
    public string Language { get; set; } = "Tiếng Việt";
    public string Size { get; set; } = "1 MB";
    public int Pages { get; set; }
    public int Views { get; set; }
    public int Downloads { get; set; }
    public string Format { get; set; } = "PDF";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string CoverUrl { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Keywords { get; set; } = string.Empty;
    public string ContentsJson { get; set; } = "[]";
}
