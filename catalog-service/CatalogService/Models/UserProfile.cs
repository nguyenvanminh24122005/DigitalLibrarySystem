namespace CatalogService.Models;

public class UserProfile
{
    public int Id { get; set; }
    public string UserId { get; set; } = "demo-user";
    public string FullName { get; set; } = "Tạ Công Thắng";
    public string Role { get; set; } = "Sinh viên";
    public string Avatar { get; set; } = "https://api.dicebear.com/7.x/initials/svg?seed=Ta%20Cong%20Thang";
    public string Email { get; set; } = "thang17200@gmail.com";
    public string Phone { get; set; } = "0987217508";
    public string StudentCode { get; set; } = "177102625";
    public string ReaderCode { get; set; } = "DG17100105";
    public string Faculty { get; set; } = "Công nghệ thông tin";
    public string ClassName { get; set; } = "CNTT 17-10";
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime CardExpiredAt { get; set; } = DateTime.UtcNow.AddYears(1);
    public string Status { get; set; } = "Đang hoạt động";
    public string Address { get; set; } = "";
    public string Gender { get; set; } = "Nam";
    public DateTime? DateOfBirth { get; set; } = new DateTime(2003, 3, 12);
}
