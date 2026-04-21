# Quickstart: Goal Tracker

## Prerequisites

- **Node.js** 20+ (for Angular CLI)
- **npm** 10+
- **.NET 8 SDK**
- **SQL Server** (Express, Developer, or full edition)
- **Git**

## Setup

### 1. Clone and install

```bash
git clone <repository-url>
cd GoalsTracker
```

### 2. Backend setup

```bash
cd backend

# Restore .NET packages
dotnet restore

# Copy environment template and fill in your values
cp appsettings.Development.example.json appsettings.Development.json

# Update connection string in appsettings.Development.json:
# "ConnectionStrings": {
#   "DefaultConnection": "Server=localhost;Database=GoalsTracker;Trusted_Connection=true;TrustServerCertificate=true;"
# }

# Run database migrations
dotnet ef database update

# Start the API server (runs on https://localhost:5001)
dotnet run
```

### 3. Frontend setup

```bash
cd frontend

# Install npm packages
npm install

# Start Angular dev server (runs on http://localhost:4200)
ng serve
```

### 4. Verify

1. Open `http://localhost:4200` in your browser
2. Register a new account
3. Create your first goal
4. Mark it complete and check your points

## Docker Setup (hosting-ready)

```bash
# Build and start all services
docker-compose up --build

# Access the application at http://localhost:80
```

The Docker setup includes:
- **frontend**: Nginx serving Angular static build
- **backend**: ASP.NET Core API
- **db**: SQL Server container (or connect to external SQL Server)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ConnectionStrings__DefaultConnection` | Yes | SQL Server connection string |
| `Jwt__Secret` | Yes | JWT signing key (min 32 chars) |
| `Jwt__Issuer` | Yes | JWT issuer (your domain) |
| `Jwt__Audience` | Yes | JWT audience (your domain) |
| `Jwt__ExpiryMinutes` | No | Token expiry (default: 15) |
| `Email__SmtpHost` | Yes | SMTP server for password reset |
| `Email__SmtpPort` | No | SMTP port (default: 587) |
| `Email__FromAddress` | Yes | Sender email address |
| `ASPNETCORE_ENVIRONMENT` | No | Production / Development |

## Running Tests

```bash
# Backend unit tests
cd backend
dotnet test

# Frontend unit tests
cd frontend
ng test

# Frontend with coverage
ng test --code-coverage
```

## Common Commands

```bash
# Add a new EF migration
cd backend
dotnet ef migrations add <MigrationName>

# Generate Angular component
cd frontend
ng generate component features/<name>

# Build for production
cd frontend && ng build --configuration production
cd backend && dotnet publish -c Release -o ./publish
```
