using CirculationService.Api.Data;
using CirculationService.Api.DTOs;
using CirculationService.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CirculationService.Api.Services;

public class FineService(CirculationDbContext db)
{
    public async Task<Fine> PayAsync(int id, FinePaymentRequest request, CancellationToken cancellationToken = default)
    {
        var fine = await db.Fines.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (fine is null)
            throw new KeyNotFoundException("Không tìm thấy khoản phạt.");

        if (fine.Status == FineStatuses.Paid)
            throw new InvalidOperationException("Khoản phạt này đã được thanh toán.");

        if (request.Amount <= 0)
            throw new ArgumentException("Số tiền thanh toán phải lớn hơn 0.");

        fine.Amount -= request.Amount;
        if (fine.Amount <= 0)
        {
            fine.Amount = 0;
            fine.Status = FineStatuses.Paid;
        }

        fine.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return fine;
    }

    public async Task<DebtSummaryResponse> GetDebtAsync(int readerId, CancellationToken cancellationToken = default)
    {
        var amount = await db.Fines
            .Where(x => x.ReaderId == readerId && x.Status == FineStatuses.Unpaid)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;

        return new DebtSummaryResponse
        {
            ReaderId = readerId,
            UnpaidAmount = amount
        };
    }
}
