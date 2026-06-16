using System;

namespace IdentityReportService.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Reader"; // Các quyền: Admin, Librarian, Reader
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}