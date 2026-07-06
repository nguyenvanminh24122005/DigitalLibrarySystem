using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using IdentityReportService.Common;
using IdentityReportService.Data;
using IdentityReportService.Dtos;
using IdentityReportService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace IdentityReportService.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IdentityReportDbContext db, IConfiguration configuration) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Vui lòng nhập tài khoản và mật khẩu.");

        var usernameOrEmail = request.UsernameOrEmail.Trim().ToLower();

        var user = await db.Users.Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email.ToLower() == usernameOrEmail || x.Username.ToLower() == usernameOrEmail);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            await WriteLog(null, "Không xác định", "Đăng nhập", "Identity & Report", "Auth", "Đăng nhập thất bại", LogResult.Failed);
            await db.SaveChangesAsync();

            return Unauthorized("Tài khoản hoặc mật khẩu không đúng.");
        }

        if (user.Status != AccountStatus.Active)
            return StatusCode(StatusCodes.Status403Forbidden, "Tài khoản đang bị khóa hoặc ngưng hoạt động.");

        user.LastLoginAt = DateTime.UtcNow;

        await WriteLog(user.Id, user.FullName, "Đăng nhập", "Identity & Report", "Auth", "Đăng nhập vào hệ thống", LogResult.Success);
        await db.SaveChangesAsync();

        var expiresAt = DateTime.UtcNow.AddMinutes(int.Parse(configuration["Jwt:ExpireMinutes"] ?? "480"));
        var token = CreateToken(user, expiresAt);

        return Ok(new LoginResponse(token, expiresAt, ToDto(user)));
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Register(RegisterRequest request)
    {
        var allowRegister = await db.SystemSettings
            .Where(x => x.Key == "AllowReaderRegistration")
            .Select(x => x.Value)
            .FirstOrDefaultAsync();

        if (string.Equals(allowRegister, "false", StringComparison.OrdinalIgnoreCase))
            return StatusCode(StatusCodes.Status403Forbidden, "Hệ thống đang tạm khóa chức năng đăng ký độc giả mới.");

        if (
            string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password)
        )
        {
            return BadRequest("Vui lòng nhập đầy đủ họ tên, email, tên đăng nhập và mật khẩu.");
        }

        if (request.Password.Length < 6)
            return BadRequest("Mật khẩu phải có tối thiểu 6 ký tự.");

        var email = request.Email.Trim().ToLower();
        var username = request.Username.Trim().ToLower();

        if (await db.Users.AnyAsync(x => x.Email.ToLower() == email || x.Username.ToLower() == username))
            return Conflict("Email hoặc tên đăng nhập đã tồn tại.");

        if (await db.Readers.AnyAsync(x => x.Email.ToLower() == email))
            return Conflict("Email này đã tồn tại trong hồ sơ độc giả.");

        var readerRole = await db.Roles.FirstOrDefaultAsync(x => x.Name == AppRoles.Reader);

        if (readerRole is null)
            return StatusCode(StatusCodes.Status500InternalServerError, "Chưa cấu hình vai trò Độc giả trong hệ thống.");

        await using var transaction = await db.Database.BeginTransactionAsync();

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Username = username,
            Email = email,
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = readerRole.Id,
            Status = AccountStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var readerCode = await GenerateReaderCodeAsync();

        var reader = new Reader
        {
            UserId = user.Id,
            ReaderCode = readerCode,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Address = request.Address,
            MemberType = "Thành viên",
            Status = AccountStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Readers.Add(reader);
        await db.SaveChangesAsync();

        var borrowLimit = await GetIntSettingAsync("MaxBooksPerReader", 5);

        db.LibraryCards.Add(new LibraryCard
        {
            ReaderId = reader.Id,
            CardNumber = await GenerateCardNumberAsync(reader.ReaderCode),
            IssuedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddYears(1),
            Status = AccountStatus.Active,
            BorrowLimit = borrowLimit,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        await WriteLog(
            user.Id,
            user.FullName,
            "Đăng ký",
            "Identity & Report",
            "Reader",
            $"Độc giả {reader.ReaderCode} đăng ký tài khoản mới và được cấp thẻ thư viện",
            LogResult.Success
        );

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        var created = await db.Users.Include(x => x.Role).FirstAsync(x => x.Id == user.Id);

        var expiresAt = DateTime.UtcNow.AddMinutes(int.Parse(configuration["Jwt:ExpireMinutes"] ?? "480"));
        var token = CreateToken(created, expiresAt);

        return Ok(new LoginResponse(token, expiresAt, ToDto(created)));
    }

    [HttpGet("google")]
    [AllowAnonymous]
    public IActionResult GoogleLogin()
    {
        var clientId = configuration["OAuth:Google:ClientId"];
        var redirectUri = configuration["OAuth:Google:RedirectUri"] ?? $"{Request.Scheme}://{Request.Host}/api/auth/google/callback";

        if (string.IsNullOrWhiteSpace(clientId))
            return BadRequest("Google OAuth chưa được cấu hình ClientId.");

        var state = CreateOAuthState("google");

        var url = QueryHelpers.AddQueryString("https://accounts.google.com/o/oauth2/v2/auth", new Dictionary<string, string?>
        {
            ["client_id"] = clientId,
            ["redirect_uri"] = redirectUri,
            ["response_type"] = "code",
            ["scope"] = "openid profile email",
            ["state"] = state,
            ["prompt"] = "select_account"
        });

        return Redirect(url);
    }

    [HttpGet("google/callback")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleCallback([FromQuery] string? code, [FromQuery] string? state)
    {
        try
        {
            ValidateOAuthState("google", state);

            if (string.IsNullOrWhiteSpace(code))
                return OAuthError("Google không trả về mã xác thực.");

            var clientId = configuration["OAuth:Google:ClientId"];
            var clientSecret = configuration["OAuth:Google:ClientSecret"];
            var redirectUri = configuration["OAuth:Google:RedirectUri"] ?? $"{Request.Scheme}://{Request.Host}/api/auth/google/callback";

            if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
                return OAuthError("Google OAuth chưa được cấu hình ClientId hoặc ClientSecret.");

            using var http = new HttpClient();

            var tokenResponse = await http.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["redirect_uri"] = redirectUri,
                ["grant_type"] = "authorization_code"
            }));

            var tokenJson = await tokenResponse.Content.ReadAsStringAsync();

            if (!tokenResponse.IsSuccessStatusCode)
                return OAuthError("Không lấy được token từ Google.");

            using var tokenDoc = JsonDocument.Parse(tokenJson);

            var accessToken = GetJsonString(tokenDoc.RootElement, "access_token");

            if (string.IsNullOrWhiteSpace(accessToken))
                return OAuthError("Google không trả về access_token.");

            using var userRequest = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v3/userinfo");
            userRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var userResponse = await http.SendAsync(userRequest);
            var userJson = await userResponse.Content.ReadAsStringAsync();

            if (!userResponse.IsSuccessStatusCode)
                return OAuthError("Không lấy được thông tin tài khoản Google.");

            using var userDoc = JsonDocument.Parse(userJson);

            var email = GetJsonString(userDoc.RootElement, "email");
            var fullName = GetJsonString(userDoc.RootElement, "name");
            var providerUserId = GetJsonString(userDoc.RootElement, "sub");

            if (string.IsNullOrWhiteSpace(email))
                return OAuthError("Tài khoản Google chưa có email hợp lệ.");

            var user = await GetOrCreateOAuthUserAsync(email, fullName, "Google", providerUserId);

            return await RedirectOAuthSuccess(user);
        }
        catch (Exception ex)
        {
            return OAuthError(ex.Message);
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me()
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(idValue, out var userId))
            return Unauthorized();

        var user = await db.Users.Include(x => x.Role).FirstOrDefaultAsync(x => x.Id == userId);

        if (user is null)
            return Unauthorized();

        if (user.Status != AccountStatus.Active)
            return StatusCode(StatusCodes.Status403Forbidden, "Tài khoản đang bị khóa hoặc ngưng hoạt động.");

        return Ok(ToDto(user));
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        return Ok(new { message = "Đăng xuất thành công. Frontend xóa token phía client." });
    }

    private string CreateOAuthState(string provider)
    {
        var state = Guid.NewGuid().ToString("N");

        Response.Cookies.Append($"digilib_oauth_state_{provider}", state, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            MaxAge = TimeSpan.FromMinutes(10)
        });

        return state;
    }

    private void ValidateOAuthState(string provider, string? state)
    {
        var cookieName = $"digilib_oauth_state_{provider}";
        var savedState = Request.Cookies[cookieName];

        Response.Cookies.Delete(cookieName);

        if (string.IsNullOrWhiteSpace(state) || string.IsNullOrWhiteSpace(savedState) || state != savedState)
            throw new InvalidOperationException("Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn.");
    }

    private IActionResult OAuthError(string message)
    {
        var loginUrl = configuration["Frontend:LoginUrl"] ?? "http://localhost:5173/login";

        return Redirect($"{loginUrl}?oauth=error&message={Uri.EscapeDataString(message)}");
    }

    private async Task<IActionResult> RedirectOAuthSuccess(User user)
    {
        var freshUser = await db.Users.Include(x => x.Role).FirstAsync(x => x.Id == user.Id);

        var expiresAt = DateTime.UtcNow.AddMinutes(int.Parse(configuration["Jwt:ExpireMinutes"] ?? "480"));
        var token = CreateToken(freshUser, expiresAt);

        var payload = new
        {
            token,
            expiresAt,
            user = ToDto(freshUser)
        };

        var json = JsonSerializer.Serialize(payload);
        var session = Base64UrlEncode(json);

        var loginUrl = configuration["Frontend:LoginUrl"] ?? "http://localhost:5173/login";

        return Redirect($"{loginUrl}?oauth=success&session={Uri.EscapeDataString(session)}");
    }

    private async Task<User> GetOrCreateOAuthUserAsync(string email, string? fullName, string provider, string? providerUserId)
    {
        email = email.Trim().ToLower();
        fullName = string.IsNullOrWhiteSpace(fullName) ? email.Split('@')[0] : fullName.Trim();

        var existingUser = await db.Users.Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email.ToLower() == email);

        if (existingUser is not null)
        {
            if (existingUser.Status != AccountStatus.Active)
                throw new InvalidOperationException("Tài khoản đang bị khóa hoặc ngưng hoạt động.");

            existingUser.LastLoginAt = DateTime.UtcNow;
            existingUser.UpdatedAt = DateTime.UtcNow;

            await WriteLog(
                existingUser.Id,
                existingUser.FullName,
                $"Đăng nhập {provider}",
                "Identity & Report",
                "Auth",
                $"Đăng nhập bằng {provider}",
                LogResult.Success
            );

            await db.SaveChangesAsync();

            return existingUser;
        }

        var allowRegister = await db.SystemSettings
            .Where(x => x.Key == "AllowReaderRegistration")
            .Select(x => x.Value)
            .FirstOrDefaultAsync();

        if (string.Equals(allowRegister, "false", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Hệ thống đang tạm khóa chức năng đăng ký độc giả mới.");

        var readerRole = await db.Roles.FirstOrDefaultAsync(x => x.Name == AppRoles.Reader);

        if (readerRole is null)
            throw new InvalidOperationException("Chưa cấu hình vai trò Độc giả trong hệ thống.");

        await using var transaction = await db.Database.BeginTransactionAsync();

        var username = await GenerateUniqueUsernameAsync(email.Split('@')[0]);

        var user = new User
        {
            FullName = fullName,
            Username = username,
            Email = email,
            Phone = null,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword($"{provider}-{providerUserId}-{Guid.NewGuid()}"),
            RoleId = readerRole.Id,
            Status = AccountStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var readerCode = await GenerateReaderCodeAsync();

        var reader = new Reader
        {
            UserId = user.Id,
            ReaderCode = readerCode,
            FullName = user.FullName,
            Email = user.Email,
            Phone = null,
            MemberType = "Thành viên",
            Status = AccountStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Readers.Add(reader);
        await db.SaveChangesAsync();

        var borrowLimit = await GetIntSettingAsync("MaxBooksPerReader", 5);

        db.LibraryCards.Add(new LibraryCard
        {
            ReaderId = reader.Id,
            CardNumber = await GenerateCardNumberAsync(reader.ReaderCode),
            IssuedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddYears(1),
            Status = AccountStatus.Active,
            BorrowLimit = borrowLimit,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        await WriteLog(
            user.Id,
            user.FullName,
            $"Đăng ký {provider}",
            "Identity & Report",
            "Reader",
            $"Độc giả {reader.ReaderCode} đăng ký bằng {provider} và được cấp thẻ thư viện",
            LogResult.Success
        );

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return await db.Users.Include(x => x.Role).FirstAsync(x => x.Id == user.Id);
    }

    private string CreateToken(User user, DateTime expiresAt)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role?.Name ?? "Unknown"),
            new("role", user.Role?.Name ?? "Unknown"),
            new("username", user.Username)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<string> GenerateReaderCodeAsync()
    {
        var prefix = $"DG{DateTime.UtcNow:yyyy}";
        var count = await db.Readers.CountAsync(x => x.ReaderCode.StartsWith(prefix));

        for (var i = count + 1; i < count + 10000; i++)
        {
            var code = $"{prefix}{i:0000}";

            if (!await db.Readers.AnyAsync(x => x.ReaderCode == code))
                return code;
        }

        return $"{prefix}{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
    }

    private async Task<string> GenerateCardNumberAsync(string readerCode)
    {
        var number = $"CARD-{readerCode}";

        if (!await db.LibraryCards.AnyAsync(x => x.CardNumber == number))
            return number;

        return $"CARD-{readerCode}-{DateTime.UtcNow:HHmmss}";
    }

    private async Task<int> GetIntSettingAsync(string key, int fallback)
    {
        var value = await db.SystemSettings
            .Where(x => x.Key == key)
            .Select(x => x.Value)
            .FirstOrDefaultAsync();

        return int.TryParse(value, out var result) && result > 0 ? result : fallback;
    }

    private async Task<string> GenerateUniqueUsernameAsync(string seed)
    {
        seed = new string(seed.ToLower().Select(c => char.IsLetterOrDigit(c) ? c : '_').ToArray()).Trim('_');

        if (string.IsNullOrWhiteSpace(seed))
            seed = "reader";

        var username = seed;
        var index = 1;

        while (await db.Users.AnyAsync(x => x.Username.ToLower() == username.ToLower()))
        {
            username = $"{seed}{index}";
            index++;
        }

        return username;
    }

    private static string? GetJsonString(JsonElement element, string name)
    {
        if (element.TryGetProperty(name, out var value) && value.ValueKind != JsonValueKind.Null)
            return value.GetString();

        return null;
    }

    private static string Base64UrlEncode(string value)
    {
        var bytes = Encoding.UTF8.GetBytes(value);

        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static UserDto ToDto(User user)
    {
        return new UserDto(
            user.Id,
            user.FullName,
            user.Username,
            user.Email,
            user.Phone,
            user.Role?.Name ?? string.Empty,
            user.Status,
            user.CreatedAt,
            user.LastLoginAt
        );
    }

    private async Task WriteLog(
        Guid? userId,
        string actor,
        string action,
        string module,
        string targetType,
        string description,
        LogResult result
    )
    {
        db.SystemLogs.Add(new SystemLog
        {
            UserId = userId,
            ActorName = actor,
            Action = action,
            Module = module,
            TargetType = targetType,
            Description = description,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            Result = result,
            CreatedAt = DateTime.UtcNow
        });

        await Task.CompletedTask;
    }
}