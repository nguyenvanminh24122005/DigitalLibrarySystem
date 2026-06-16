using System;

namespace IdentityReportService.Entities
{
    public class ReportBorrowingStat
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BookId { get; set; } // Plain column, không dùng khóa ngoại
        public string BookTitle { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public Guid UserId { get; set; } // Plain column
        public DateTime BorrowDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public decimal FineAmount { get; set; } = 0;
        public bool IsOverdue { get; set; } = false;
    }
}