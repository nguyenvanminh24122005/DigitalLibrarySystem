using System;

namespace IdentityReportService.Integration
{
    // DTO này phải khớp cấu trúc với Event mà Nhóm 2 publish ra
    public record BookBorrowedEvent(Guid BookId, string BookTitle, string CategoryName, Guid UserId, DateTime BorrowDate);
}