# Dockerfile — Multi-stage build for GoalsTracker API.
# Produces a minimal runtime image running as non-root user.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer caching
COPY GoalsTracker.slnx .
COPY GoalsTracker.Api/GoalsTracker.Api.csproj GoalsTracker.Api/
RUN dotnet restore GoalsTracker.Api/GoalsTracker.Api.csproj

# Copy source and publish
COPY GoalsTracker.Api/ GoalsTracker.Api/
RUN dotnet publish GoalsTracker.Api/GoalsTracker.Api.csproj \
    -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Run as non-root for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

COPY --from=build /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "GoalsTracker.Api.dll"]
