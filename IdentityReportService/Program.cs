using IdentityReportService.Data;
using IdentityReportService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using MassTransit;
using IdentityReportService.Integration;

var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký Database SQL Server
builder.Services.AddDbContext<IdentityReportDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Đăng ký TokenService để AuthController có thể sử dụng
builder.Services.AddScoped<TokenService>();

// 3. Cấu hình bảo mật JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Cấu hình MassTransit với RabbitMQ
builder.Services.AddMassTransit(x =>
{
    // Đăng ký Consumer
    x.AddConsumer<BookBorrowedConsumer>();

    x.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host("localhost", "/", h => {
            h.Username("guest");
            h.Password("guest");
        });

        // Tạo hàng đợi (Queue) tên là identity-report-queue để hứng event
        cfg.ReceiveEndpoint("identity-report-queue", e => {
            e.ConfigureConsumer<BookBorrowedConsumer>(ctx);
        });
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Chỉ định đúng cổng của VueJS
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 4. Cấu hình Swagger tự động chuẩn hóa Token
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Identity Report API (Nhóm 3)", Version = "v1" });
    
    // Dùng loại Http/Bearer để Swagger TỰ ĐỘNG ghép chữ "Bearer " vào trước Token
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Chỉ cần dán trực tiếp chuỗi Token (eyJ...) vào đây, KHÔNG cần gõ chữ Bearer nữa!"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Hiển thị Swagger trên trình duyệt
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

// 5. Kích hoạt Middleware bảo mật (Thứ tự rất quan trọng: Auth trước, Roles sau)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();