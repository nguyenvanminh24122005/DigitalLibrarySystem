using IdentityReportService.Data;
using IdentityReportService.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityReportService.Controllers
{
    [ApiController]
    [Route("api/cards")]
    public class CardsController : ControllerBase
    {
        private readonly IdentityReportDbContext _context;

        public CardsController(IdentityReportDbContext context)
        {
            _context = context;
        }

        // 1. Cấp thẻ mới (Tiêu chí 10 - Chỉ Admin hoặc Thủ thư mới được làm)
        [Authorize(Roles = "Admin,Librarian")]
        [HttpPost("issue")]
        public async Task<IActionResult> IssueCard([FromBody] Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("Không tìm thấy người dùng trong hệ thống.");

            var existingCard = await _context.LibraryCards.FirstOrDefaultAsync(c => c.UserId == userId);
            if (existingCard != null) return BadRequest("Người dùng này đã có thẻ thư viện.");

            var card = new LibraryCard
            {
                UserId = userId,
                CardNumber = "LIB-" + new Random().Next(100000, 999999).ToString()
            };

            _context.LibraryCards.Add(card);
            await _context.SaveChangesAsync();
            return Ok(card);
        }

        // 2. Khóa thẻ hoặc Gia hạn thẻ (Tiêu chí 10)
        [Authorize(Roles = "Admin,Librarian")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            var card = await _context.LibraryCards.FindAsync(id);
            if (card == null) return NotFound("Không tìm thấy thẻ.");

            // Nếu truyền chữ "Renew" thì gia hạn thêm 1 năm
            if (status == "Renew")
            {
                card.ExpiryDate = DateTime.UtcNow.AddYears(1);
                card.Status = "Active";
            }
            else
            {
                card.Status = status; // Ghi đè trạng thái (ví dụ: "Locked")
            }

            await _context.SaveChangesAsync();
            return Ok(card);
        }

        // 3. API Liên thông (Tiêu chí 14 - Nhóm 2 sẽ gọi API này qua Gateway)
        [HttpGet("validate-status/{userId}")]
        public async Task<IActionResult> ValidateCardStatus(Guid userId)
        {
            var card = await _context.LibraryCards.FirstOrDefaultAsync(c => c.UserId == userId);
            
            if (card == null) return Ok(new { isValid = false, reason = "Độc giả chưa đăng ký thẻ thư viện" });
            if (card.Status == "Locked") return Ok(new { isValid = false, reason = "Thẻ đã bị khóa do vi phạm" });
            if (card.ExpiryDate < DateTime.UtcNow) return Ok(new { isValid = false, reason = "Thẻ đã hết hạn sử dụng" });

            return Ok(new { isValid = true, reason = "Thẻ hợp lệ" });
        }
    }
}