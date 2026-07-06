namespace CirculationService.Api.Models;

public static class BorrowStatuses
{
    public const string Pending = "Pending";
    public const string Borrowed = "Borrowed";
    public const string Returned = "Returned";
    public const string Rejected = "Rejected";
}

public static class FineStatuses
{
    public const string Unpaid = "Unpaid";
    public const string Paid = "Paid";
}
