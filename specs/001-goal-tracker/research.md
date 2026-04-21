# Research: Goal Tracker with Points & Competitive Dashboard

**Date**: 2026-04-21
**Spec**: [spec.md](./spec.md)

## Technology Stack Decision

### Backend: ASP.NET Core 8 Web API

**Why**: Natural pairing with SQL Server. Minimal footprint, built-in
dependency injection, JWT authentication out of the box. Ships as a
single executable for easy hosting. No additional ORM library needed
beyond Entity Framework Core (included in the SDK).

**Minimum libraries approach**:
- `Microsoft.EntityFrameworkCore.SqlServer` — SQL Server provider
- `Microsoft.AspNetCore.Authentication.JwtBearer` — JWT auth
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore` — user management
- No third-party logging (use built-in `ILogger`)
- No AutoMapper (use manual mapping — fewer dependencies, explicit)
- No MediatR (direct service calls — simpler for this scope)

### Frontend: Angular 18 + Tailwind CSS + DaisyUI

**Why**: User-specified. Angular provides strong typing, built-in
routing, forms, HTTP client, and dependency injection without
additional packages. Tailwind + DaisyUI handle all styling with
zero custom CSS framework needed.

**Minimum libraries approach**:
- `tailwindcss` + `daisyui` — styling (user-specified)
- `@angular/forms` — reactive forms (built-in)
- `@angular/router` — routing (built-in)
- No NgRx (use Angular signals + services for state — simpler)
- No chart library initially (use CSS-based progress bars from DaisyUI;
  add `chart.js` only for strength analysis trends if CSS is insufficient)

### Database: SQL Server

**Why**: User-specified. Entity Framework Core migrations handle
schema management. SQL Server Express is free for development;
production can use any SQL Server edition or Azure SQL.

### Hosting Readiness

**Strategy**: Docker containers for both frontend and backend.
- Backend: ASP.NET Core publishes as a self-contained executable
- Frontend: Angular builds to static files served by Nginx
- Docker Compose orchestrates both + SQL Server
- Environment variables for all configuration (connection strings,
  JWT secrets, email settings)
- Health check endpoints for load balancers
- CORS configured for production domain

## Architecture Decisions

### Authentication: JWT with Refresh Tokens

ASP.NET Core Identity handles user storage and password hashing.
JWT tokens for API authentication. Refresh tokens stored in the
database for session management. No external identity provider
needed for v1.

### Points Calculation: Server-Side, Event-Driven

Points are calculated on the backend when a goal status changes.
A `PointsService` encapsulates all scoring logic (base points,
early completion bonus, streak tracking). Point transactions are
immutable records for audit trail.

### Leaderboard: Materialized View Pattern

A `UserStats` table/view pre-aggregates total points, rank, and
achievement level. Updated via SQL Server trigger or application-level
event after each point transaction. Avoids expensive aggregation
queries on every leaderboard load.

### Strength Analysis: SQL-Based Aggregation

Completion rates by category computed via SQL queries with
GROUP BY. Trend calculation uses windowed functions over weekly
buckets. No machine learning — straightforward statistics.

### Code Comments Strategy

Per user request, all code will include:
- File-level comment explaining the file's purpose
- Method-level comments explaining intent (not restating the code)
- Complex logic sections annotated with "why" comments
- API endpoints documented with XML comments for Swagger generation
- Angular components with purpose comments in the class header

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| SQL Server licensing cost | Use Express for dev, document upgrade path |
| Leaderboard performance at scale | Materialized stats table, pagination |
| Point calculation race conditions | Database transactions, optimistic concurrency |
| JWT token theft | Short expiry (15min), refresh token rotation |
| Bundle size creep | Angular budgets in angular.json, CI enforcement |
