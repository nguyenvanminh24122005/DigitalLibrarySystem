using System.Text;
using CirculationService.Api.Data;
using CirculationService.Api.DTOs;
using CirculationService.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Api.Services;

public class BorrowRecordService
{
    private readonly CirculationDbContext db;
    private readonly IHttpClientFactory httpClientFactory;
    private readonly IConfiguration configuration;

    public BorrowRecordService(CirculationDbContext db, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        this.db = db;
        this.httpClientFactory = httpClientFactory;
        this.configuration = configuration;
    }

    public async Task<BorrowRecord> CreateAsync(BorrowRecordCreateRequest request, CancellationToken cancellationToken = default)
    {
        var policy = await GetCurrentPolicyAsync(cancellationToken);

        var normalizedCopyCode = request.CopyCode.Trim();
        var isCopyBorrowed = await db.BorrowRecords.AnyAsync(x =>
            x.CopyCode == normalizedCopyCode &&
            x.Status == BorrowStatuses.Borrowed,
            cancellationToken);

        if (isCopyBorrowed)
            throw new InvalidOperationException("Bản sao sách này đang được mượn, không thể tạo phiếu mượn mới.");

        var currentBorrowedCount = await db.BorrowRecords.CountAsync(x =>
            x.ReaderId == request.ReaderId &&
            x.Status == BorrowStatuses.Borrowed,
            cancellationToken);

        if (currentBorrowedCount >= policy.MaxBooks)
            throw new InvalidOperationException($"Độc giả đã đạt giới hạn {policy.MaxBooks} sách đang mượn.");

        var unpaidFine = await db.Fines
            .Where(x => x.ReaderId == request.ReaderId && x.Status == FineStatuses.Unpaid)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;

        if (unpaidFine > 0)
            throw new InvalidOperationException($"Độc giả còn công nợ {unpaidFine:N0}đ, cần thanh toán trước khi mượn tiếp.");

        // Kết nối nghiệp vụ sang Catalog: chuyển bản sao sang Borrowed trước khi tạo phiếu.
        await UpdateCatalogCopyAsync(normalizedCopyCode, "borrow", cancellationToken);

        var borrowDate = request.BorrowDate ?? DateTime.Now;

        var record = new BorrowRecord
        {
            ReaderId = request.ReaderId,
            ReaderName = request.ReaderName.Trim(),
            CardNumber = request.CardNumber.Trim(),
            CopyCode = normalizedCopyCode,
            BookId = request.BookId,
            BookTitle = request.BookTitle.Trim(),
            BorrowDate = borrowDate,
            DueDate = borrowDate.AddDays(policy.MaxDays),
            ReturnDate = null,
            Status = BorrowStatuses.Borrowed,
            Fine = 0
        };

        db.BorrowRecords.Add(record);
        await db.SaveChangesAsync(cancellationToken);

        return record;
    }

    public async Task<BorrowRecord> ReturnAsync(int id, BorrowRecordReturnRequest request, CancellationToken cancellationToken = default)
    {
        var record = await db.BorrowRecords.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (record is null)
            throw new KeyNotFoundException("Không tìm thấy phiếu mượn.");

        if (record.Status == BorrowStatuses.Returned)
            throw new InvalidOperationException("Phiếu mượn này đã được trả trước đó.");

        var policy = await GetCurrentPolicyAsync(cancellationToken);
        var returnDate = request.ReturnDate ?? DateTime.Now;
        var overdueDays = CalculateOverdueDays(record.DueDate, returnDate);
        var fineAmount = overdueDays * policy.FinePerDay;

        // Kết nối nghiệp vụ sang Catalog: chuyển bản sao về Available khi trả.
        await UpdateCatalogCopyAsync(record.CopyCode, "return", cancellationToken);

        record.ReturnDate = returnDate;
        record.Status = BorrowStatuses.Returned;
        record.Fine = fineAmount;

        if (fineAmount > 0)
        {
            var fine = await db.Fines.FirstOrDefaultAsync(x =>
                x.ReaderId == record.ReaderId &&
                x.Status == FineStatuses.Unpaid,
                cancellationToken);

            if (fine is null)
            {
                db.Fines.Add(new Fine
                {
                    ReaderId = record.ReaderId,
                    ReaderName = record.ReaderName,
                    CardNumber = record.CardNumber,
                    Amount = fineAmount,
                    Status = FineStatuses.Unpaid,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            else
            {
                fine.ReaderName = record.ReaderName;
                fine.CardNumber = record.CardNumber;
                fine.Amount += fineAmount;
                fine.UpdatedAt = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        return record;
    }

    public BorrowRecordResponse ToResponse(BorrowRecord record, decimal finePerDay)
    {
        var referenceDate = record.Status == BorrowStatuses.Returned && record.ReturnDate.HasValue
            ? record.ReturnDate.Value
            : DateTime.Now;

        var overdueDays = CalculateOverdueDays(record.DueDate, referenceDate);
        return new BorrowRecordResponse
        {
            Id = record.Id,
            ReaderId = record.ReaderId,
            ReaderName = record.ReaderName,
            CardNumber = record.CardNumber,
            CopyCode = record.CopyCode,
            BookId = record.BookId,
            BookTitle = record.BookTitle,
            BorrowDate = record.BorrowDate,
            DueDate = record.DueDate,
            ReturnDate = record.ReturnDate,
            Status = record.Status,
            Fine = record.Fine,
            CurrentOverdueDays = overdueDays,
            EstimatedFine = overdueDays * finePerDay
        };
    }

    public async Task<BorrowPolicy> GetCurrentPolicyAsync(CancellationToken cancellationToken = default)
    {
        var policy = await db.BorrowPolicies
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        return policy ?? throw new InvalidOperationException("Chưa cấu hình chính sách mượn sách.");
    }

    public async Task<BorrowRecord> RenewAsync(
    int id,
    BorrowRecordRenewRequest request,
    CancellationToken cancellationToken = default)
{
    var record = await db.BorrowRecords.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    if (record is null)
        throw new KeyNotFoundException("Không tìm thấy phiếu mượn.");

    if (record.Status == BorrowStatuses.Returned)
        throw new InvalidOperationException("Phiếu mượn này đã được trả, không thể gia hạn.");

    if (record.Status != BorrowStatuses.Borrowed)
        throw new InvalidOperationException("Chỉ có thể gia hạn phiếu đang mượn.");

    var today = DateTime.Now.Date;

    if (record.DueDate.Date < today)
        throw new InvalidOperationException("Phiếu đã quá hạn, cần xử lý trả sách hoặc phí phạt trước khi gia hạn.");

    var days = request.Days.GetValueOrDefault(7);
    var newDueDate = request.NewDueDate?.Date ?? record.DueDate.Date.AddDays(days);

    if (newDueDate <= record.DueDate.Date)
        throw new InvalidOperationException("Hạn trả mới phải lớn hơn hạn trả hiện tại.");

    if ((newDueDate - record.DueDate.Date).TotalDays > 60)
        throw new InvalidOperationException("Mỗi lần gia hạn tối đa 60 ngày.");

    record.DueDate = newDueDate;

    await db.SaveChangesAsync(cancellationToken);

    return record;
}

    private async Task UpdateCatalogCopyAsync(string copyCode, string action, CancellationToken cancellationToken)
    {
        var baseUrl = configuration["CATALOG_SERVICE_URL"]
            ?? configuration["ServiceUrls:CatalogService"]
            ?? "http://catalog-service:5001";

        var encodedCode = Uri.EscapeDataString(copyCode);
        var url = $"{baseUrl.TrimEnd('/')}/api/copies/by-code/{encodedCode}/{action}";
        var client = httpClientFactory.CreateClient();
        using var content = new StringContent("{}", Encoding.UTF8, "application/json");
        var response = await client.PutAsync(url, content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var message = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"Không cập nhật được trạng thái bản sao bên Catalog ({copyCode}). {message}");
        }
    }

    private static int CalculateOverdueDays(DateTime dueDate, DateTime referenceDate)
    {
        return Math.Max(0, (referenceDate.Date - dueDate.Date).Days);
    }
}
