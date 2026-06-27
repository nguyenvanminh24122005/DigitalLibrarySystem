namespace IdentityReportService.Common;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Librarian = "Thủ thư";
    public const string Reader = "Độc giả";
    public const string Reporter = "Báo cáo viên";

    public const string AdminOnly = Admin;
    public const string Staff = Admin + "," + Librarian;
    public const string ReaderOnly = Reader;
    public const string AdminOrReporter = Admin + "," + Reporter;
    public const string AdminLibrarianReporter = Admin + "," + Librarian + "," + Reporter;
}
