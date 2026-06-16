using System;

namespace IdentityReportService.Entities
{
    public class LibraryCard
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string CardNumber { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; } = DateTime.UtcNow;
        public DateTime ExpiryDate { get; set; } = DateTime.UtcNow.AddYears(1);
        public string Status { get; set; } = "Active"; // Trạng thái: Active, Expired, Locked
    }
}