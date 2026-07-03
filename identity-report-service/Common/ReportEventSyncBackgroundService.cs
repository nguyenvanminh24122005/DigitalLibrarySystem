using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using IdentityReportService.Data;
using IdentityReportService.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace IdentityReportService.Common;

public sealed class ReportEventSyncBackgroundService(
    IServiceProvider serviceProvider,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<ReportEventSyncBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Chạy lần đầu sau khi các service đã kịp khởi động.
        await Task.Delay(TimeSpan.FromSeconds(45), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var result = await SyncOnceAsync(stoppingToken);
                if (result.CatalogAdded + result.CirculationAdded > 0)
                {
                    logger.LogInformation("Report event sync added {Catalog} catalog events and {Circulation} circulation events.", result.CatalogAdded, result.CirculationAdded);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Background report event sync failed.");
            }

            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }

    private async Task<(int CatalogAdded, int CirculationAdded)> SyncOnceAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityReportDbContext>();

        var catalogEvents = await GetArrayFromService("CatalogService", "/api/books", cancellationToken);
        var circulationEvents = await GetArrayFromService("CirculationService", "/api/borrow-records", cancellationToken);
        var catalogAdded = 0;
        var circulationAdded = 0;

        foreach (var e in catalogEvents)
        {
            var id = GetString(e, "id") ?? Guid.NewGuid().ToString();
            if (await db.ConsumedEvents.AnyAsync(x => x.SourceService == "CatalogService" && x.ExternalEventId == id, cancellationToken)) continue;

            db.ConsumedEvents.Add(new ConsumedEvent
            {
                SourceService = "CatalogService",
                ExternalEventId = id,
                EventType = GetString(e, "eventType") ?? "catalog.event",
                EntityType = GetString(e, "entityType") ?? "Catalog",
                EntityId = GetString(e, "entityId"),
                Description = GetString(e, "description") ?? string.Empty,
                Payload = GetString(e, "payload"),
                OccurredAt = GetDate(e, "createdAt") ?? DateTime.UtcNow,
                ConsumedAt = DateTime.UtcNow
            });
            catalogAdded++;
        }

        foreach (var e in circulationEvents)
        {
            var id = GetString(e, "id") ?? Guid.NewGuid().ToString();
            if (await db.ConsumedEvents.AnyAsync(x => x.SourceService == "CirculationService" && x.ExternalEventId == id, cancellationToken)) continue;

            db.ConsumedEvents.Add(new ConsumedEvent
            {
                SourceService = "CirculationService",
                ExternalEventId = id,
                EventType = GetString(e, "action") ?? "circulation.event",
                EntityType = "CirculationLog",
                EntityId = GetString(e, "borrowTicketCode"),
                Description = GetString(e, "description") ?? string.Empty,
                Payload = e.GetRawText(),
                OccurredAt = GetDate(e, "createdAt") ?? DateTime.UtcNow,
                ConsumedAt = DateTime.UtcNow
            });
            circulationAdded++;
        }

        if (catalogAdded + circulationAdded > 0)
        {
            db.SystemLogs.Add(new SystemLog
            {
                ActorName = "Report Sync Service",
                Action = "Tự động đồng bộ báo cáo",
                Module = "Identity & Report",
                TargetType = "ConsumedEvents",
                Description = $"Tự động consume {catalogAdded} event Catalog và {circulationAdded} event Circulation"
            });
            await db.SaveChangesAsync(cancellationToken);
        }

        return (catalogAdded, circulationAdded);
    }

    private async Task<List<JsonElement>> GetArrayFromService(string serviceName, string path, CancellationToken cancellationToken)
    {
        try
        {
            var baseUrl = configuration[$"ServiceUrls:{serviceName}"] ?? serviceName switch
            {
                "CatalogService" => "http://catalog-service:5001",
                "CirculationService" => "http://circulation-service:5002",
                _ => string.Empty
            };
            if (string.IsNullOrWhiteSpace(baseUrl)) return new List<JsonElement>();

            var client = httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, $"{baseUrl.TrimEnd('/')}/{path.TrimStart('/')}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", CreateServiceToken());

            var response = await client.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode) return new List<JsonElement>();

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
            if (document.RootElement.ValueKind == JsonValueKind.Array)
                return document.RootElement.EnumerateArray().Select(x => x.Clone()).ToList();

            foreach (var property in new[] { "value", "data", "items", "$values" })
            {
                if (document.RootElement.ValueKind == JsonValueKind.Object &&
                    document.RootElement.TryGetProperty(property, out var array) &&
                    array.ValueKind == JsonValueKind.Array)
                {
                    return array.EnumerateArray().Select(x => x.Clone()).ToList();
                }
            }

            return new List<JsonElement>();
        }
        catch
        {
            return new List<JsonElement>();
        }
    }

    private string CreateServiceToken()
    {
        var secret = configuration["Jwt:Secret"] ?? "THIS_IS_A_DEVELOPMENT_SECRET_KEY_FOR_DIGILIB_ADMIN_2024_MINIMUM_32_CHARS";
        var issuer = configuration["Jwt:Issuer"] ?? "DIGILIB.Identity";
        var audience = configuration["Jwt:Audience"] ?? "DIGILIB.Services";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "Report Sync Service"),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim("role", "Admin"),
            new Claim("scope", "internal-report-sync")
        };
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow.AddMinutes(-1),
            expires: DateTime.UtcNow.AddMinutes(10),
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string? GetString(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return null;
        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString(),
            JsonValueKind.Number => value.GetRawText(),
            _ => value.ToString()
        };
    }

    private static DateTime? GetDate(JsonElement element, string property)
    {
        if (!element.TryGetProperty(property, out var value)) return null;
        if (value.ValueKind == JsonValueKind.String && DateTime.TryParse(value.GetString(), out var date)) return date;
        return null;
    }
}
