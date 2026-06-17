FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY IdentityReportService.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish IdentityReportService.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 5003
ENTRYPOINT ["dotnet", "IdentityReportService.dll"]

