using System;
using System.ComponentModel.DataAnnotations;

namespace IdentityReportService.Models;

public class User {
  public int Id { get; set; }
  [Required, MaxLength(120)] public string FullName { get; set; } = string.Empty;
  [Required, EmailAddress, MaxLength(160)] public string Email { get; set; } = string.Empty;
  [Required] public string PasswordHash { get; set; } = string.Empty;
  [Required, MaxLength(30)] public string Role { get; set; } = "Reader"; // Admin, Librarian, Reader
  public bool IsActive { get; set; } = true;
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  
  [MaxLength(20)]
  public string? Phone { get; set; }
  
  [MaxLength(250)]
  public string? Address { get; set; }

  public LibraryCard? LibraryCard { get; set; }
}
