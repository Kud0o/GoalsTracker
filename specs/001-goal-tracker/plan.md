# Implementation Plan: Goal Tracker with Points & Competitive Dashboard

**Branch**: `001-goal-tracker` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-goal-tracker/spec.md`

## Summary

Multi-user goal tracking web application with timeline-based goals
(weekly, monthly, yearly), a gamified points encouragement system,
competitive leaderboard with achievement levels, and strength analysis
derived from completion history. Backend is ASP.NET Core 8 Web API
with SQL Server via Entity Framework Core. Frontend is Angular 18 with
Tailwind CSS and DaisyUI. Minimal external dependencies, thoroughly
commented code, and Docker-based hosting readiness.

## Technical Context

**Language/Version**: C# / .NET 8 (backend), TypeScript / Angular 18 (frontend)
**Primary Dependencies**: EF Core SqlServer, ASP.NET Identity, JWT Bearer (backend); Tailwind CSS, DaisyUI (frontend)
**Storage**: SQL Server (EF Core Code-First migrations)
**Testing**: xUnit (backend unit + integration), Karma + Jasmine (frontend)
**Target Platform**: Linux/Windows server via Docker; modern evergreen browsers
**Project Type**: Web application (SPA + REST API)
**Performance Goals**: <200ms API p95 response, <3s initial page load, 1000 concurrent users
**Constraints**: Minimum libraries, all code commented, hosting-ready with Docker
**Scale/Scope**: ~1000 users, 6 user stories, ~15 screens, 7 database tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Pre-Design | Post-Design | How Addressed |
|-----------|-----------|-------------|---------------|
| I. Quality-First | PASS | PASS | SOLID service layer; consistent naming via .editorconfig; Angular style guide; manual DTO mapping (explicit over magic); commented code per user request |
| II. Security by Design | PASS | PASS | ASP.NET Identity for password hashing; JWT + refresh token rotation; input validation via Data Annotations; parameterized queries via EF Core; CORS; secrets in environment variables only; user data isolation enforced at service layer |
| III. Comprehensive Testing | PASS | PASS | xUnit unit tests for all service classes; Jasmine component tests; integration tests for goal-complete-points workflow; edge case coverage per spec |
| IV. User Experience | PASS | PASS | DaisyUI component library for consistent semi-formal UI; loading spinners; empty state components; actionable error messages; WCAG 2.1 AA via semantic HTML + DaisyUI defaults; responsive design |
| V. Performance | PASS | PASS | Materialized leaderboard SQL view; indexed queries for all list/filter operations; Angular lazy-loaded routes; pagination on all list endpoints; production build budgets in angular.json |

**Gate result**: ALL PASS — no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-goal-tracker/
├── plan.md              # This file
├── research.md          # Technology decisions and rationale
├── data-model.md        # SQL Server schema (7 tables, 2 views)
├── quickstart.md        # Local + Docker setup instructions
├── contracts/
│   └── api-contracts.md # 16 REST API endpoints
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
backend/
├── GoalsTracker.Api/
│   ├── Program.cs                         # Entry point: service registration, middleware pipeline
│   ├── appsettings.json                   # Base config (non-secret defaults)
│   ├── appsettings.Development.example.json  # Template for local dev secrets
│   ├── Controllers/
│   │   ├── AuthController.cs              # POST register, login, refresh, forgot/reset password
│   │   ├── GoalsController.cs             # CRUD + complete + filtered list
│   │   ├── PointsController.cs            # GET history, summary
│   │   ├── LeaderboardController.cs       # GET ranked list (public)
│   │   ├── AnalyticsController.cs         # GET strength analysis
│   │   ├── CategoriesController.cs        # GET predefined categories (public)
│   │   └── UserController.cs              # GET/PUT profile
│   ├── Models/
│   │   ├── Entities/
│   │   │   ├── User.cs                    # Extends IdentityUser with points, streak, timezone
│   │   │   ├── Goal.cs                    # Title, timeline type, status, target date
│   │   │   ├── Category.cs               # Predefined goal categories
│   │   │   ├── Tag.cs                     # User-defined labels
│   │   │   ├── GoalTag.cs                # Many-to-many join
│   │   │   ├── PointTransaction.cs        # Immutable points ledger
│   │   │   └── AchievementLevel.cs        # Tier thresholds
│   │   ├── Dtos/
│   │   │   ├── Auth/                      # RegisterDto, LoginDto, TokenDto
│   │   │   ├── Goals/                     # CreateGoalDto, UpdateGoalDto, GoalResponseDto
│   │   │   ├── Points/                    # PointHistoryDto, PointsSummaryDto
│   │   │   ├── Leaderboard/              # LeaderboardEntryDto
│   │   │   └── Analytics/                 # StrengthAnalysisDto, CategoryBreakdownDto
│   │   └── Enums/
│   │       ├── TimelineType.cs            # Weekly=1, Monthly=2, Yearly=3
│   │       ├── GoalStatus.cs              # Active=1, Completed=2, Overdue=3
│   │       └── TransactionType.cs         # Completion=1, EarlyBonus=2, Streak=3
│   ├── Services/
│   │   ├── IAuthService.cs + AuthService.cs           # JWT generation, refresh tokens, password reset
│   │   ├── IGoalService.cs + GoalService.cs           # Goal CRUD, overdue detection, filtering
│   │   ├── IPointsService.cs + PointsService.cs       # Point calculation, streaks, bonuses, level-up
│   │   ├── ILeaderboardService.cs + LeaderboardService.cs  # Ranking queries, period filtering
│   │   └── IAnalyticsService.cs + AnalyticsService.cs      # Category stats, trends, strength identification
│   ├── Data/
│   │   ├── AppDbContext.cs                # EF Core DbContext with Fluent API config
│   │   ├── Migrations/                    # Auto-generated EF Core migrations
│   │   └── Seed/
│   │       └── SeedData.cs               # Categories + achievement level defaults
│   ├── Middleware/
│   │   └── ExceptionMiddleware.cs         # Global error → friendly JSON responses
│   └── Helpers/
│       ├── DateTimeHelper.cs              # Timezone-aware deadline evaluation
│       └── PaginationHelper.cs            # Reusable page/offset logic
├── GoalsTracker.Api.Tests/
│   ├── Services/
│   │   ├── GoalServiceTests.cs            # CRUD, status transitions, overdue
│   │   ├── PointsServiceTests.cs          # Base points, bonuses, streaks, level-up
│   │   ├── LeaderboardServiceTests.cs     # Ranking, period filters, pagination
│   │   └── AnalyticsServiceTests.cs       # Category stats, trends, minimum data guard
│   ├── Controllers/
│   │   ├── AuthControllerTests.cs         # Register, login, validation
│   │   └── GoalsControllerTests.cs        # Authorization, input validation
│   └── Integration/
│       └── GoalWorkflowTests.cs           # Create → complete → points → leaderboard update
├── Dockerfile                             # Multi-stage: restore → build → publish → runtime
└── GoalsTracker.sln

frontend/
├── src/
│   ├── app/
│   │   ├── app.component.ts              # Root shell with navbar + router-outlet
│   │   ├── app.config.ts                 # provideHttpClient, provideRouter
│   │   ├── app.routes.ts                 # Lazy-loaded feature routes
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts         # Redirect unauthenticated to /login
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts   # Attach JWT, handle 401 → refresh
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts       # Login, register, token storage, refresh
│   │   │   │   ├── api.service.ts        # Typed HTTP wrapper with error handling
│   │   │   │   └── notification.service.ts  # DaisyUI toast alerts
│   │   │   └── models/
│   │   │       ├── user.model.ts         # User, Profile interfaces
│   │   │       ├── goal.model.ts         # Goal, GoalFilter interfaces
│   │   │       ├── points.model.ts       # PointTransaction, PointsSummary
│   │   │       └── api-response.model.ts # PagedResponse<T>, ErrorResponse
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/login.component.ts
│   │   │   │   ├── register/register.component.ts
│   │   │   │   └── forgot-password/forgot-password.component.ts
│   │   │   ├── dashboard/dashboard.component.ts       # Summary cards, recent goals, points
│   │   │   ├── goals/
│   │   │   │   ├── goal-list/goal-list.component.ts   # Filtered list with tabs
│   │   │   │   ├── goal-form/goal-form.component.ts   # Create + edit (shared reactive form)
│   │   │   │   └── goal-detail/goal-detail.component.ts
│   │   │   ├── points/
│   │   │   │   ├── points-summary/points-summary.component.ts
│   │   │   │   └── points-history/points-history.component.ts
│   │   │   ├── leaderboard/leaderboard.component.ts   # Ranked table with filters
│   │   │   ├── analytics/strength-analysis.component.ts  # Category bars + trend
│   │   │   └── profile/profile.component.ts
│   │   └── shared/
│   │       ├── components/
│   │       │   ├── navbar/navbar.component.ts          # Top nav with user menu
│   │       │   ├── empty-state/empty-state.component.ts
│   │       │   ├── loading-spinner/loading-spinner.component.ts
│   │       │   ├── pagination/pagination.component.ts
│   │       │   └── achievement-badge/achievement-badge.component.ts
│   │       └── pipes/
│   │           └── relative-date.pipe.ts               # "3 days ago", "in 2 weeks"
│   ├── environments/
│   │   ├── environment.ts                # apiUrl: http://localhost:5001/api
│   │   └── environment.prod.ts           # apiUrl from env at build time
│   ├── styles.css                        # @tailwind base/components/utilities
│   └── index.html
├── tailwind.config.js                    # DaisyUI plugin, custom theme
├── angular.json                          # Budget: 500kB initial, 1MB lazy
├── Dockerfile                            # Build stage + Nginx serve stage
├── nginx.conf                            # SPA fallback, gzip, cache headers
└── package.json

# Root hosting files
docker-compose.yml                        # backend + frontend + sqlserver (optional)
docker-compose.prod.yml                   # Production overrides (no SQL container)
.dockerignore
.gitignore
.editorconfig                             # Consistent formatting across editors
```

**Structure Decision**: Web application (Option 2) — Angular SPA
communicates with ASP.NET Core REST API. SQL Server for persistence.
Docker Compose orchestrates all services. Nginx serves the Angular
production build as static files with SPA routing fallback.

## Key Design Decisions

### Minimal Libraries Philosophy

| Concern | Chosen (built-in or minimal) | Avoided | Rationale |
|---------|------------------------------|---------|-----------|
| ORM | EF Core (in .NET SDK) | Dapper, NHibernate | Migrations + LINQ + change tracking built-in |
| Auth | ASP.NET Identity + JWT | IdentityServer, Auth0 | Framework-native, zero extra packages |
| Validation | Data Annotations | FluentValidation | Zero NuGet additions |
| Object mapping | Manual DTO constructors | AutoMapper | Explicit, no reflection, easier to debug |
| Logging | ILogger (built-in) | Serilog, NLog | Built into .NET hosting |
| Mediator | Direct service injection | MediatR | Over-engineering for this scope |
| State (frontend) | Angular Signals + Services | NgRx, Akita | Simple state; no store boilerplate |
| Charts | DaisyUI progress bars + CSS | Chart.js, D3, ng2-charts | Sufficient for v1 category bars and trends |
| HTTP (frontend) | Angular HttpClient | Axios | Built into Angular |
| Forms (frontend) | Reactive Forms | ngx-formly | Built into Angular |

**Total external packages**:
- Backend: 3 NuGet packages (EF Core SqlServer, Identity.EF, JWT Bearer)
- Frontend: 2 npm packages (tailwindcss, daisyui) beyond Angular CLI

### Commented Code Strategy

Per user request, every source file will include:
1. **File-level**: Single line describing the file's responsibility
2. **Class-level**: Purpose and key dependencies
3. **Public methods**: XML doc (C#) or JSDoc (TS) with param/return descriptions
4. **Complex blocks**: Inline `// why:` comments explaining non-obvious decisions
5. **Controllers**: XML comments that auto-generate Swagger/OpenAPI docs

### Hosting-Ready Configuration

| Aspect | Implementation |
|--------|---------------|
| **Containerization** | Multi-stage Dockerfiles for both backend and frontend |
| **Orchestration** | docker-compose.yml with health checks |
| **Configuration** | All secrets via environment variables (never in committed files) |
| **Static assets** | Nginx with gzip, cache-control headers, SPA fallback |
| **Health probes** | GET /api/health for load balancer readiness |
| **HTTPS** | Handled by reverse proxy / cloud load balancer |
| **Database** | Connection string via env var; supports Azure SQL or any SQL Server |
| **CORS** | Configured per environment; locked to production domain |
| **Non-root user** | Docker containers run as non-root |

## Complexity Tracking

> No constitution violations. All design decisions use the simplest
> viable approach for the requirements.

| Decision | Justification |
|----------|--------------|
| Two projects (frontend + backend) | Required: SPA + API is the minimum for this architecture |
| Docker Compose | Required: User requested hosting readiness |
| JWT refresh tokens | Required: Constitution mandates token rotation for security |
