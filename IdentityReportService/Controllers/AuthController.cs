using IdentityReportService.Data;
using IdentityReportService.Entities;
using IdentityReportService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IdentityReportDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(IdentityReportDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        // DTO nhận dữ liệu từ client
        public record RegisterDto(string Username, string Password, string FullName, string Email, string Role);
        public record LoginDto(string Username, string Password);

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return BadRequest("Tên tài khoản đã tồn tại.");

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password), // Mã hóa mật khẩu
                FullName = dto.FullName,
                Email = dto.Email,
                Role = dto.Role 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đăng ký thành công" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            
            // Kiểm tra mật khẩu bằng BCrypt
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Tài khoản hoặc mật khẩu không chính xác.");

            var token = _tokenService.GenerateToken(user);
            return Ok(new { token, user = new { user.Id, user.Username, user.FullName, user.Role } });
        }
    }
}