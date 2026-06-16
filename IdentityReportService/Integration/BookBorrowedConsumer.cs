using IdentityReportService.Data;
using IdentityReportService.Entities;
using MassTransit;
using System.Threading.Tasks;

namespace IdentityReportService.Integration
{
    public class BookBorrowedConsumer : IConsumer<BookBorrowedEvent>
    {
        private readonly IdentityReportDbContext _dbContext;

        public BookBorrowedConsumer(IdentityReportDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task Consume(ConsumeContext<BookBorrowedEvent> context)
        {
            var data = context.Message;
            
            // Tự động lưu dữ liệu vào bảng thống kê
            var stat = new ReportBorrowingStat
            {
                BookId = data.BookId,
                BookTitle = data.BookTitle,
                CategoryName = data.CategoryName,
                UserId = data.UserId,
                BorrowDate = data.BorrowDate,
                ReturnDate = null,
                IsOverdue = false,
                FineAmount = 0
            };

            _dbContext.ReportBorrowingStats.Add(stat);
            await _dbContext.SaveChangesAsync();
        }
    }
}