using System.Collections.Generic;

namespace CatalogService.Models;

public class Book
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    public string CoverImage { get; set; } = string.Empty;

    public string Author { get; set; } = string.Empty;

    public int? CategoryId { get; set; }
    public string Category { get; set; } = string.Empty;

    public string ISBN { get; set; } = string.Empty;

    public int PublishedYear { get; set; }

    public string Description { get; set; } = string.Empty;

    public List<BookCopy> Copies { get; set; } = new();
}