using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Yarp.ReverseProxy.Configuration;

var builder = WebApplication.CreateBuilder(args);

var catalogUrl = Environment.GetEnvironmentVariable("CATALOG_SERVICE_URL") ?? "http://catalog-service:5001";
var circulationUrl = Environment.GetEnvironmentVariable("CIRCULATION_SERVICE_URL") ?? "http://circulation-service:5002";
var identityUrl =
    Environment.GetEnvironmentVariable("IDENTITY_SERVICE_URL")
    ?? Environment.GetEnvironmentVariable("IDENTITY_REPORT_SERVICE_URL")
    ?? "http://identity-report-service:5003";

var routes = new List<RouteConfig>();

void AddRoute(
    string routeId,
    string clusterId,
    string path,
    int order = 0,
    string? pathPattern = null)
{
    List<IReadOnlyDictionary<string, string>>? transforms = null;

    if (!string.IsNullOrWhiteSpace(pathPattern))
    {
        transforms = new List<IReadOnlyDictionary<string, string>>
        {
            new Dictionary<string, string>
            {
                ["PathPattern"] = pathPattern
            }
        };
    }

    routes.Add(new RouteConfig
    {
        RouteId = routeId,
        ClusterId = clusterId,
        Order = order,
        Match = new RouteMatch
        {
            Path = path
        },
        Transforms = transforms
    });
}

void AddRootAndAll(string routeId, string clusterId, string path, int order = 0)
{
    AddRoute($"{routeId}-root", clusterId, path, order);
    AddRoute($"{routeId}-all", clusterId, $"{path}/{{**catchAll}}", order);
}

// Catalog Service
AddRootAndAll("catalog-books", "catalog-cluster", "/api/books", 0);
AddRootAndAll("catalog-copies", "catalog-cluster", "/api/copies", 0);
AddRootAndAll("catalog-categories", "catalog-cluster", "/api/categories", 0);
AddRootAndAll("catalog-authors", "catalog-cluster", "/api/authors", 0);
AddRootAndAll("catalog-publishers", "catalog-cluster", "/api/publishers", 0);
AddRootAndAll("catalog-documents", "catalog-cluster", "/api/digital-documents", 0);
AddRootAndAll("catalog-uploads", "catalog-cluster", "/uploads", 0);
AddRootAndAll("catalog-images", "catalog-cluster", "/images", 0);

// Catalog user endpoints
AddRoute("catalog-user-profile", "catalog-cluster", "/api/users/{userId}/profile", 0);
AddRootAndAll("catalog-user-favorites", "catalog-cluster", "/api/users/{userId}/favorites", 0);
AddRootAndAll("catalog-user-borrowings", "catalog-cluster", "/api/users/{userId}/borrowings", 0);
AddRootAndAll("catalog-user-notifications", "catalog-cluster", "/api/users/{userId}/notifications", 0);
AddRootAndAll("catalog-user-reading-progress", "catalog-cluster", "/api/users/{userId}/reading-progress", 0);

// Identity Report Service
AddRootAndAll("identity-auth", "identity-cluster", "/api/auth", 10);
AddRootAndAll("identity-profile", "identity-cluster", "/api/profile", 10);
AddRootAndAll("identity-readers", "identity-cluster", "/api/readers", 10);
AddRootAndAll("identity-cards", "identity-cluster", "/api/cards", 10);
AddRootAndAll("identity-users", "identity-cluster", "/api/users", 20);
AddRootAndAll("identity-roles", "identity-cluster", "/api/roles", 10);
AddRootAndAll("identity-permissions", "identity-cluster", "/api/permissions", 10);
AddRootAndAll("identity-reports", "identity-cluster", "/api/reports", 10);
AddRootAndAll("identity-statistics", "identity-cluster", "/api/statistics", 10);
AddRootAndAll("identity-system-logs", "identity-cluster", "/api/system-logs", 10);
AddRootAndAll("identity-settings", "identity-cluster", "/api/settings", 10);

// Circulation Service
AddRootAndAll("circulation-borrow-records", "circulation-cluster", "/api/borrow-records", 10);
AddRootAndAll("circulation-borrow-policies", "circulation-cluster", "/api/borrow-policies", 10);
AddRootAndAll("circulation-fines", "circulation-cluster", "/api/fines", 10);
AddRootAndAll("circulation-history", "circulation-cluster", "/api/circulation", 10);
AddRootAndAll("circulation-health", "circulation-cluster", "/api/health", 10);

// Alias cho frontend cũ
AddRoute("circulation-borrow-tickets-root", "circulation-cluster", "/api/borrow-tickets", 5, "/api/borrow-records");
AddRoute("circulation-borrow-tickets-all", "circulation-cluster", "/api/borrow-tickets/{**catchAll}", 5, "/api/borrow-records/{**catchAll}");

AddRoute("circulation-overdue-root", "circulation-cluster", "/api/overdue", 5, "/api/borrow-records/overdue");
AddRoute("circulation-overdue-all", "circulation-cluster", "/api/overdue/{**catchAll}", 5, "/api/borrow-records/overdue/{**catchAll}");

var clusters = new List<ClusterConfig>
{
    new ClusterConfig
    {
        ClusterId = "catalog-cluster",
        Destinations = new Dictionary<string, DestinationConfig>
        {
            ["destination1"] = new DestinationConfig
            {
                Address = catalogUrl
            }
        }
    },
    new ClusterConfig
    {
        ClusterId = "circulation-cluster",
        Destinations = new Dictionary<string, DestinationConfig>
        {
            ["destination1"] = new DestinationConfig
            {
                Address = circulationUrl
            }
        }
    },
    new ClusterConfig
    {
        ClusterId = "identity-cluster",
        Destinations = new Dictionary<string, DestinationConfig>
        {
            ["destination1"] = new DestinationConfig
            {
                Address = identityUrl
            }
        }
    }
};

builder.Services
    .AddReverseProxy()
    .LoadFromMemory(routes, clusters);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    service = "API Gateway",
    catalogUrl,
    circulationUrl,
    identityUrl
}));

app.MapReverseProxy();

app.Run();
