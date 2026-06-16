using System.ComponentModel.DataAnnotations;

namespace CirculationService.Api.DTOs;

public class FinePaymentRequest
{
    [Range(1, 100000000)]
    public decimal Amount { get; set; }
}

public class DebtSummaryResponse
{
    public int ReaderId { get; set; }
    public decimal UnpaidAmount { get; set; }
}
