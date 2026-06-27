using IdentityReportService.Models;

namespace IdentityReportService.Dtos;

public sealed record LoginRequest(string UsernameOrEmail, string Password);
public sealed record RegisterRequest(string FullName, string Username, string Email, string? Phone, string Password, DateTime? DateOfBirth, string? Gender, string? Address);
public sealed record LoginResponse(string Token, DateTime ExpiresAt, UserDto User);

public sealed record UserDto(Guid Id, string FullName, string Username, string Email, string? Phone, string RoleName, AccountStatus Status, DateTime CreatedAt, DateTime? LastLoginAt);
public sealed record CreateUserRequest(string FullName, string Username, string Email, string? Phone, string Password, Guid RoleId, AccountStatus Status);
public sealed record UpdateUserRequest(string FullName, string Email, string? Phone, Guid RoleId, AccountStatus Status);

public sealed record ReaderDto(
    Guid Id,
    string ReaderCode,
    string FullName,
    string Email,
    string? Phone,
    DateTime? DateOfBirth,
    string? Gender,
    string? Address,
    string MemberType,
    AccountStatus Status,
    DateTime CreatedAt,
    string? CardNumber,
    DateTime? CardIssuedAt,
    DateTime? CardExpiredAt,
    AccountStatus? CardStatus,
    int? BorrowLimit,
    bool HasValidCard);

public sealed record CreateReaderRequest(string FullName, string Email, string? Phone, DateTime? DateOfBirth, string? Gender, string? Address, string MemberType, AccountStatus Status);
public sealed record UpdateMyReaderRequest(string FullName, string Email, string? Phone, DateTime? DateOfBirth, string? Gender, string? Address);
public sealed record IssueLibraryCardRequest(int ValidMonths, int BorrowLimit);
public sealed record RenewLibraryCardRequest(int ExtendMonths);
public sealed record LockLibraryCardRequest(string? Reason);
public sealed record LibraryCardDto(Guid Id, Guid ReaderId, string ReaderCode, string CardNumber, DateTime IssuedAt, DateTime ExpiredAt, AccountStatus Status, int BorrowLimit, string? LockedReason, bool IsExpired, bool CanBorrow);
public sealed record CardStatusDto(Guid ReaderId, string ReaderCode, string ReaderName, string? CardNumber, AccountStatus ReaderStatus, AccountStatus? CardStatus, DateTime? ExpiredAt, int BorrowLimit, bool CanBorrow, string Message);

public sealed record RoleDto(Guid Id, string Name, string Description, bool IsSystemRole, AccountStatus Status, int UserCount, IEnumerable<string> PermissionCodes);
public sealed record CreateRoleRequest(string Name, string Description, bool IsSystemRole);
public sealed record UpdateRolePermissionsRequest(IEnumerable<Guid> PermissionIds);
public sealed record PermissionDto(Guid Id, string Code, string Name, string Module, string? Description);

public sealed record OverviewReportDto(
    int TotalBooks,
    int TotalCopies,
    int ActiveReaders,
    int BorrowCountThisMonth,
    int OverdueCount,
    IEnumerable<DailyBorrowReturnDto> DailyBorrowReturns,
    IEnumerable<NameValueDto> BookStatusRate,
    IEnumerable<NameValueDto> TopBooks,
    IEnumerable<NameValueDto> TopReaders);

public sealed record DailyBorrowReturnDto(string Date, int BorrowCount, int ReturnCount);
public sealed record NameValueDto(string Name, int Value);
public sealed record SyncEventsResultDto(int CatalogEventsAdded, int CirculationEventsAdded, DateTime SyncedAt);
