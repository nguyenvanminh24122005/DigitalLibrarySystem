using System.ComponentModel.DataAnnotations;

namespace CirculationService.Api.DTOs;

public class BorrowPolicyCreateRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Range(1, 100)]
    public int MaxBooks { get; set; }

    [Range(1, 365)]
    public int MaxDays { get; set; }

    [Range(0, 100000000)]
    public decimal FinePerDay { get; set; }
}

public class BorrowPolicyUpdateRequest : BorrowPolicyCreateRequest
{
}
