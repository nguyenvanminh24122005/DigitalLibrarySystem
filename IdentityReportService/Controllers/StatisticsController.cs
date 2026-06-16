using IdentityReportService.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Controllers
{
    [ApiController]
    [Route("api/statistics")]
    [Authorize(Roles = "Admin,Librarian")] // Chỉ Admin và Thủ thư được xem báo cáo
    public class StatisticsController : ControllerBase
    {
        private readonly IdentityReportDbContext _context;

        public StatisticsController(IdentityReportDbContext context)
        {
            _context = context;
        }

        // 1. Tiêu chí 11: Thống kê số lượng sách theo danh mục và Top sách mượn nhiều nhất
        [HttpGet("books-frequency")]
        public async Task<IActionResult> GetBookBorrowingFrequency()
        {
            var categoryStats = await _context.ReportBorrowingStats
                .GroupBy(s => s.CategoryName)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToListAsync();

            var topBooks = await _context.ReportBorrowingStats
                .GroupBy(s => s.BookTitle)
                .Select(g => new { BookTitle = g.Key, BorrowCount = g.Count() })
                .OrderByDescending(b => b.BorrowCount)
                .Take(5) // Lấy Top 5
                .ToListAsync();

            return Ok(new { categoryStats, topBooks });
        }

        // 2. Tiêu chí 12: Báo cáo tổng hợp mượn trả, tổng tiền phạt thu được theo thời gian
        [HttpGet("summary-report")]
        public async Task<IActionResult> GetSummaryReport([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            var reports = await _context.ReportBorrowingStats
                .Where(s => s.BorrowDate >= fromDate && s.BorrowDate <= toDate)
                .ToListAsync();

            var totalBorrowed = reports.Count;
            var totalReturned = reports.Count(s => s.ReturnDate != null);
            var totalOverdue = reports.Count(s => s.IsOverdue);
            var totalFines = reports.Sum(s => s.FineAmount);

            // 3. Trích xuất danh sách sách chưa trả quá hạn để cảnh báo lên Dashboard (Tiêu chí 13)
            var alertBooks = reports
                .Where(s => s.ReturnDate == null && s.BorrowDate.AddDays(14) < DateTime.UtcNow) // Giả sử hạn mượn là 14 ngày
                .Select(s => new { s.BookTitle, s.UserId, s.BorrowDate })
                .ToList();

            return Ok(new {
                totalBorrowed,
                totalReturned,
                totalOverdue,
                totalFines,
                alertBooks
            });
        }
    }
}