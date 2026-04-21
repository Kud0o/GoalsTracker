# Tasks: Goal Tracker with Points & Competitive Dashboard

**Input**: Design documents from `/specs/001-goal-tracker/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Tests**: Included — the constitution mandates comprehensive testing (Principle III), and the user requested enough unit tests for excellent consistency.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/GoalsTracker.Api/` for source, `backend/GoalsTracker.Api.Tests/` for tests
- **Frontend**: `frontend/src/app/` for source
- Paths shown use web application structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, scaffolding, and configuration for both backend and frontend

- [x] T001 Create .NET solution and API project: run `dotnet new sln -n GoalsTracker` in `backend/`, then `dotnet new webapi -n GoalsTracker.Api`, add project to solution
- [x] T002 Create xUnit test project: run `dotnet new xunit -n GoalsTracker.Api.Tests` in `backend/`, add reference to GoalsTracker.Api, add to solution
- [x] T003 Create Angular project: run `ng new frontend --style=css --routing --ssr=false` in project root, configure for standalone components
- [x] T004 [P] Install and configure Tailwind CSS + DaisyUI in `frontend/tailwind.config.js` — add DaisyUI plugin, set semi-formal theme, configure `frontend/src/styles.css` with @tailwind directives
- [x] T005 [P] Install backend NuGet packages: `Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Microsoft.AspNetCore.Identity.EntityFrameworkCore` in `backend/GoalsTracker.Api/GoalsTracker.Api.csproj`
- [x] T006 [P] Create `.editorconfig` at project root with C# and TypeScript formatting rules (indentation, line endings, naming conventions)
- [x] T007 [P] Create `.gitignore` at project root covering .NET (bin/, obj/, appsettings.Development.json), Angular (node_modules/, dist/), and IDE files
- [x] T008 [P] Create `backend/GoalsTracker.Api/appsettings.json` with base config (JWT settings placeholders, CORS origins, logging) and `appsettings.Development.example.json` with SQL Server connection string template
- [x] T009 [P] Create environment files `frontend/src/environments/environment.ts` (apiUrl: http://localhost:5001/api) and `frontend/src/environments/environment.prod.ts` (apiUrl from build config)
- [x] T010 [P] Configure Angular build budgets in `frontend/angular.json`: 500kB initial bundle warning, 1MB error

**Checkpoint**: Both projects build and run (empty shells). Backend responds to health check, frontend shows default page.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Create enum types: `TimelineType.cs`, `GoalStatus.cs`, `TransactionType.cs` in `backend/GoalsTracker.Api/Models/Enums/`
- [x] T012 [P] Create `AchievementLevel` entity in `backend/GoalsTracker.Api/Models/Entities/AchievementLevel.cs` with Id, Name, MinPoints, BadgeIcon, ColorHex properties
- [x] T013 [P] Create `Category` entity in `backend/GoalsTracker.Api/Models/Entities/Category.cs` with Id, Name, ColorHex, Icon, SortOrder properties
- [x] T014 Create `User` entity extending `IdentityUser` in `backend/GoalsTracker.Api/Models/Entities/User.cs` with Timezone, TotalPoints, CurrentStreak, BestStreak, AchievementLevelId, IsPublicOnLeaderboard, CreatedAt, UpdatedAt
- [x] T015 Create `Goal` entity in `backend/GoalsTracker.Api/Models/Entities/Goal.cs` with all columns from data-model.md (UserId FK, Title, Description, TimelineType, CategoryId FK, TargetDate, Status, CompletedAt, PointsAwarded, timestamps)
- [x] T016 [P] Create `Tag` entity in `backend/GoalsTracker.Api/Models/Entities/Tag.cs` and `GoalTag` join entity in `backend/GoalsTracker.Api/Models/Entities/GoalTag.cs`
- [x] T017 [P] Create `PointTransaction` entity in `backend/GoalsTracker.Api/Models/Entities/PointTransaction.cs` with UserId FK, GoalId FK (nullable), Points, TransactionType, Description, CreatedAt
- [x] T018 Create `AppDbContext` in `backend/GoalsTracker.Api/Data/AppDbContext.cs` — extend `IdentityDbContext<User>`, configure all entity relationships via Fluent API, add indexes from data-model.md
- [x] T019 Create `SeedData.cs` in `backend/GoalsTracker.Api/Data/Seed/SeedData.cs` — seed 6 categories (Career, Health, Finance, Education, Personal, Social) and 5 achievement levels (Bronze/0, Silver/500, Gold/2000, Platinum/5000, Diamond/10000)
- [x] T020 Configure `Program.cs` in `backend/GoalsTracker.Api/Program.cs` — register DbContext with SQL Server, Identity, JWT authentication, CORS, Swagger, health checks, call seed data on startup
- [x] T021 Generate initial EF Core migration: run `dotnet ef migrations add InitialCreate` in `backend/GoalsTracker.Api/`
- [x] T022 [P] Create `ExceptionMiddleware` in `backend/GoalsTracker.Api/Middleware/ExceptionMiddleware.cs` — catch unhandled exceptions, return friendly JSON error responses with error code and message
- [x] T023 [P] Create `PaginationHelper` in `backend/GoalsTracker.Api/Helpers/PaginationHelper.cs` — generic `PagedResponse<T>` class and `ApplyPagination` IQueryable extension
- [x] T024 [P] Create `DateTimeHelper` in `backend/GoalsTracker.Api/Helpers/DateTimeHelper.cs` — timezone-aware date comparison methods using IANA timezone IDs
- [x] T025 [P] Create shared DTO classes: `PagedResponseDto<T>` and `ErrorResponseDto` in `backend/GoalsTracker.Api/Models/Dtos/`
- [x] T026 Create Angular core models: `user.model.ts`, `goal.model.ts`, `points.model.ts`, `api-response.model.ts` (PagedResponse<T>, ErrorResponse interfaces) in `frontend/src/app/core/models/`
- [x] T027 [P] Create `ApiService` in `frontend/src/app/core/services/api.service.ts` — typed HTTP wrapper using Angular HttpClient with base URL from environment, generic GET/POST/PUT/DELETE methods, error handling
- [x] T028 [P] Create `NotificationService` in `frontend/src/app/core/services/notification.service.ts` — DaisyUI toast alert management (success, error, warning, info)
- [x] T029 [P] Create shared UI components in `frontend/src/app/shared/components/`: `loading-spinner/`, `empty-state/`, `pagination/` — each using DaisyUI classes
- [x] T030 [P] Create `NavbarComponent` in `frontend/src/app/shared/components/navbar/navbar.component.ts` — responsive top navigation with DaisyUI navbar, auth-aware (show login vs user menu)
- [x] T031 [P] Create `AchievementBadgeComponent` in `frontend/src/app/shared/components/achievement-badge/achievement-badge.component.ts` — displays tier icon with color based on achievement level
- [x] T032 [P] Create `RelativeDatePipe` in `frontend/src/app/shared/pipes/relative-date.pipe.ts` — transforms dates to "3 days ago", "in 2 weeks" format
- [x] T033 Configure `app.config.ts` in `frontend/src/app/app.config.ts` — provideHttpClient with interceptors, provideRouter with lazy routes
- [x] T034 Configure `app.routes.ts` in `frontend/src/app/app.routes.ts` — define lazy-loaded routes for auth, dashboard, goals, points, leaderboard, analytics, profile; apply auth guard to protected routes
- [x] T035 Set up `AppComponent` in `frontend/src/app/app.component.ts` — root shell with NavbarComponent and router-outlet

**Checkpoint**: Foundation ready — database created with seed data, backend serves health check with JWT middleware active, frontend renders navbar with routing shell. User story implementation can now begin.

---

## Phase 3: User Story 3 - User Registration & Authentication (Priority: P1) 🔐

**Goal**: Visitors can register, log in, log out, and reset passwords. Sessions use JWT with refresh tokens.

**Independent Test**: Register an account → log in → see dashboard → log out → cannot access protected pages. Password reset flow works end-to-end.

**Why this story first**: Authentication is a prerequisite for all other stories. Goals, points, and leaderboard all require a logged-in user.

### Tests for User Story 3

- [x] T036 [P] [US3] Write unit tests for AuthService in `backend/GoalsTracker.Api.Tests/Services/AuthServiceTests.cs` — test register (success, duplicate email, weak password), login (success, invalid credentials), token generation, refresh token rotation, password reset token generation
- [x] T037 [P] [US3] Write unit tests for AuthController in `backend/GoalsTracker.Api.Tests/Controllers/AuthControllerTests.cs` — test register endpoint validation (400 on missing fields, 409 on duplicate), login endpoint (200 on success, 401 on failure), refresh endpoint

### Implementation for User Story 3

- [x] T038 [P] [US3] Create Auth DTOs in `backend/GoalsTracker.Api/Models/Dtos/Auth/`: `RegisterDto.cs` (Email, UserName, Password, Timezone with Data Annotations), `LoginDto.cs`, `TokenDto.cs` (Token, RefreshToken, ExpiresAt), `ForgotPasswordDto.cs`, `ResetPasswordDto.cs`
- [x] T039 [US3] Create `IAuthService` and `AuthService` in `backend/GoalsTracker.Api/Services/` — implement Register (create user via UserManager, generate JWT + refresh token), Login (validate via SignInManager, generate tokens), RefreshToken (validate + rotate), ForgotPassword (generate reset token), ResetPassword (validate token + update)
- [x] T040 [US3] Create `AuthController` in `backend/GoalsTracker.Api/Controllers/AuthController.cs` — POST /api/auth/register (201), POST /api/auth/login (200), POST /api/auth/refresh (200), POST /api/auth/forgot-password (200), POST /api/auth/reset-password (200) per api-contracts.md
- [x] T041 [US3] Create `AuthService` in `frontend/src/app/core/services/auth.service.ts` — login/register/logout/refreshToken methods using ApiService, store JWT in memory + refresh token in localStorage, expose currentUser signal, isAuthenticated computed signal
- [x] T042 [US3] Create `AuthInterceptor` in `frontend/src/app/core/interceptors/auth.interceptor.ts` — attach JWT Bearer header to requests, intercept 401 responses → attempt token refresh → retry original request → redirect to login if refresh fails
- [x] T043 [US3] Create `AuthGuard` in `frontend/src/app/core/guards/auth.guard.ts` — check isAuthenticated signal, redirect to /login with returnUrl if unauthenticated
- [x] T044 [P] [US3] Create `LoginComponent` in `frontend/src/app/features/auth/login/login.component.ts` — DaisyUI card form with email + password fields, validation messages, "Forgot password?" link, "Register" link, loading state on submit
- [x] T045 [P] [US3] Create `RegisterComponent` in `frontend/src/app/features/auth/register/register.component.ts` — DaisyUI card form with email + username + password + confirm password + timezone select, validation messages, redirect to dashboard on success
- [x] T046 [P] [US3] Create `ForgotPasswordComponent` in `frontend/src/app/features/auth/forgot-password/forgot-password.component.ts` — email input, success message ("If email exists, reset link sent"), back to login link

**Checkpoint**: Users can register, log in, and access protected routes. JWT refresh works transparently. Password reset flow complete.

---

## Phase 4: User Story 1 - Create and Manage Goals (Priority: P1) 🎯 MVP

**Goal**: Authenticated users create, view, edit, delete, and complete goals with weekly/monthly/yearly timelines. Overdue goals are auto-detected.

**Independent Test**: Log in → create a goal with "Weekly" timeline and future date → see it in goal list → edit the title → mark it complete → status changes to "Completed". Filter by timeline type works.

### Tests for User Story 1

- [x] T047 [P] [US1] Write unit tests for GoalService in `backend/GoalsTracker.Api.Tests/Services/GoalServiceTests.cs` — test create (success, validation failures), update (success, not owner → 403), delete (success, not owner), complete (success, already completed → 400), list with filters (by status, timeline type), overdue detection logic
- [x] T048 [P] [US1] Write unit tests for GoalsController in `backend/GoalsTracker.Api.Tests/Controllers/GoalsControllerTests.cs` — test authorization (401 without token), input validation (400 on missing title, past target date), owner isolation (403 on other user's goal)

### Implementation for User Story 1

- [x] T049 [P] [US1] Create Goal DTOs in `backend/GoalsTracker.Api/Models/Dtos/Goals/`: `CreateGoalDto.cs` (Title required max 200, Description optional max 2000, TimelineType required, CategoryId optional, TargetDate required future date, TagNames optional), `UpdateGoalDto.cs`, `GoalResponseDto.cs`
- [x] T050 [US1] Create `IGoalService` and `GoalService` in `backend/GoalsTracker.Api/Services/` — implement CreateGoal (validate, persist, return DTO), UpdateGoal (check ownership, update fields), DeleteGoal (check ownership, retain points), CompleteGoal (set status + completedAt, delegate to PointsService), GetGoals (filtered + paginated IQueryable), GetGoalById (with ownership check), DetectOverdueGoals (query active goals past target date using DateTimeHelper)
- [x] T051 [US1] Create `GoalsController` in `backend/GoalsTracker.Api/Controllers/GoalsController.cs` — GET /api/goals (filtered list), POST /api/goals (201), GET /api/goals/:id, PUT /api/goals/:id, DELETE /api/goals/:id (204), POST /api/goals/:id/complete per api-contracts.md; all endpoints [Authorize] with user ID from claims
- [x] T052 [US1] Create `GoalListComponent` in `frontend/src/app/features/goals/goal-list/goal-list.component.ts` — DaisyUI table/cards displaying goals, tab filters for timeline type (All/Weekly/Monthly/Yearly), status filter dropdown, pagination, "Complete" button per row, empty state when no goals
- [x] T053 [US1] Create `GoalFormComponent` in `frontend/src/app/features/goals/goal-form/goal-form.component.ts` — reactive form with DaisyUI inputs: title, description textarea, timeline type radio group, target date picker, category dropdown (from /api/categories), tag input; shared for create and edit modes
- [x] T054 [US1] Create `GoalDetailComponent` in `frontend/src/app/features/goals/goal-detail/goal-detail.component.ts` — display goal details with status badge, timeline badge, category chip, edit/delete/complete action buttons, overdue warning banner
- [x] T055 [US1] Create `DashboardComponent` in `frontend/src/app/features/dashboard/dashboard.component.ts` — summary cards (active goals count, completed this week, current streak, total points), recent goals list (last 5), quick "New Goal" button, empty state for new users

**Checkpoint**: MVP functional — users create and manage goals with timelines. Dashboard shows goal summary. Overdue detection works.

---

## Phase 5: User Story 2 - Points Encouragement System (Priority: P1) ⭐

**Goal**: Completing goals awards points based on timeline type, with bonuses for early completion and streaks. Users view their points history and achievement level.

**Independent Test**: Complete a weekly goal → earn 10 base points → see points summary update → complete another before deadline → earn early bonus → complete 3 in a row → earn streak bonus → achievement level updates from Bronze to Silver at 500 points.

### Tests for User Story 2

- [x] T056 [P] [US2] Write unit tests for PointsService in `backend/GoalsTracker.Api.Tests/Services/PointsServiceTests.cs` — test base point calculation per timeline type (weekly=10, monthly=50, yearly=200), early completion bonus (1.5x when completed before 50% of timeline), streak tracking (increment on complete, reset on overdue, bonus thresholds: 3/7/14 for weekly), achievement level promotion (Bronze→Silver at 500), point history retrieval, summary calculation (thisWeek, thisMonth)
- [x] T057 [P] [US2] Write integration test for goal-complete-points workflow in `backend/GoalsTracker.Api.Tests/Integration/GoalWorkflowTests.cs` — create goal → complete it → verify PointTransaction created → verify User.TotalPoints updated → verify achievement level checked

### Implementation for User Story 2

- [x] T058 [P] [US2] Create Points DTOs in `backend/GoalsTracker.Api/Models/Dtos/Points/`: `PointHistoryDto.cs` (Id, GoalId, GoalTitle, Points, TransactionType, Description, CreatedAt), `PointsSummaryDto.cs` (TotalPoints, CurrentStreak, BestStreak, AchievementLevel with next level info, ThisWeek, ThisMonth), `GoalCompletionResultDto.cs` (Goal, PointsEarned breakdown, NewTotalPoints, NewStreak, AchievementLevel change)
- [x] T059 [US2] Create `IPointsService` and `PointsService` in `backend/GoalsTracker.Api/Services/` — implement CalculateAndAwardPoints (compute base + early bonus + streak bonus, create PointTransaction records, update User.TotalPoints and streak counters, check/update achievement level), GetPointsHistory (paginated query with goal title join), GetPointsSummary (aggregate current stats)
- [x] T060 [US2] Update `GoalService.CompleteGoal` in `backend/GoalsTracker.Api/Services/GoalService.cs` — after setting goal status to Completed, call PointsService.CalculateAndAwardPoints within the same database transaction, return GoalCompletionResultDto
- [x] T061 [US2] Create `PointsController` in `backend/GoalsTracker.Api/Controllers/PointsController.cs` — GET /api/points/history (paginated), GET /api/points/summary per api-contracts.md
- [x] T062 [US2] Create `PointsSummaryComponent` in `frontend/src/app/features/points/points-summary/points-summary.component.ts` — DaisyUI stats cards showing total points, current streak (fire icon), best streak, current achievement level with AchievementBadge, progress bar to next level, this week/month points
- [x] T063 [US2] Create `PointsHistoryComponent` in `frontend/src/app/features/points/points-history/points-history.component.ts` — DaisyUI table of point transactions sorted newest first, with goal title link, points badge (+10, +5 bonus), transaction type label, relative date, pagination
- [x] T064 [US2] Update `DashboardComponent` in `frontend/src/app/features/dashboard/dashboard.component.ts` — add points summary card (total points, current level badge, streak counter), show point award animation/toast when goal completed from dashboard

**Checkpoint**: Full points system functional — completing goals awards calculated points, streaks and bonuses work, achievement levels promote, points history viewable.

---

## Phase 6: User Story 4 - Competitive Dashboard (Priority: P2) 🏆

**Goal**: Public leaderboard ranks all users by total points with achievement levels, filterable by time period.

**Independent Test**: Navigate to leaderboard → see ranked list of users → own row is highlighted → filter by "This Week" → rankings change → paginate through results.

### Tests for User Story 4

- [x] T065 [P] [US4] Write unit tests for LeaderboardService in `backend/GoalsTracker.Api.Tests/Services/LeaderboardServiceTests.cs` — test ranking with DENSE_RANK (tied users share rank), period filtering (weekly/monthly/alltime), pagination, current user rank injection, excluding users with IsPublicOnLeaderboard=false

### Implementation for User Story 4

- [x] T066 [P] [US4] Create Leaderboard DTOs in `backend/GoalsTracker.Api/Models/Dtos/Leaderboard/`: `LeaderboardEntryDto.cs` (Rank, UserName, TotalPoints, GoalsCompleted, CurrentStreak, AchievementLevel, BadgeIcon, AchievementColor, IsCurrentUser), `LeaderboardResponseDto.cs` (extends PagedResponse with CurrentUserRank)
- [x] T067 [US4] Create `ILeaderboardService` and `LeaderboardService` in `backend/GoalsTracker.Api/Services/` — implement GetLeaderboard (query vw_Leaderboard or equivalent LINQ, apply period filter, paginate, inject IsCurrentUser flag and CurrentUserRank for authenticated caller)
- [x] T068 [US4] Create SQL migration for `vw_Leaderboard` view in `backend/GoalsTracker.Api/Data/Migrations/` — add migration with raw SQL from data-model.md using DENSE_RANK window function
- [x] T069 [US4] Create `LeaderboardController` in `backend/GoalsTracker.Api/Controllers/LeaderboardController.cs` — GET /api/leaderboard (AllowAnonymous but enriched for authenticated users) with period, page, pageSize query params
- [x] T070 [US4] Create `LeaderboardComponent` in `frontend/src/app/features/leaderboard/leaderboard.component.ts` — DaisyUI table with rank column, user avatar placeholder, username, AchievementBadge, total points, goals completed, streak; highlight current user row with accent color; period filter tabs (All Time/This Month/This Week); pagination; responsive card layout on mobile

**Checkpoint**: Leaderboard fully functional — ranks visible, own position highlighted, period filtering works, respects privacy opt-out.

---

## Phase 7: User Story 5 - Strength Analysis (Priority: P2) 📊

**Goal**: Users see category-based completion analysis, top strengths, improvement areas, and performance trends.

**Independent Test**: User with 5+ completed goals across categories → navigate to analytics → see category breakdown bars → see top 3 strengths → see improvement areas → see weekly trend line. New user with <5 goals sees "not enough data" message.

### Tests for User Story 5

- [x] T071 [P] [US5] Write unit tests for AnalyticsService in `backend/GoalsTracker.Api.Tests/Services/AnalyticsServiceTests.cs` — test category breakdown calculation, strength identification (top 3 by completion rate), improvement area detection (lowest completion rates), trend calculation (weekly buckets), minimum data guard (fewer than 5 goals → hasEnoughData=false), empty category handling

### Implementation for User Story 5

- [x] T072 [P] [US5] Create Analytics DTOs in `backend/GoalsTracker.Api/Models/Dtos/Analytics/`: `CategoryBreakdownDto.cs` (CategoryId, CategoryName, TotalGoals, CompletedGoals, OverdueGoals, CompletionRate, IsStrength), `TrendDto.cs` (Direction, WeeklyCompletionRates), `StrengthAnalysisDto.cs` (HasEnoughData, CategoryBreakdown, TopStrengths, ImprovementAreas, Trend, Message, GoalsCompleted, GoalsNeeded)
- [x] T073 [US5] Create SQL migration for `vw_UserStrengthAnalysis` view in `backend/GoalsTracker.Api/Data/Migrations/` — add migration with raw SQL from data-model.md computing per-user per-category stats
- [x] T074 [US5] Create `IAnalyticsService` and `AnalyticsService` in `backend/GoalsTracker.Api/Services/` — implement GetStrengthAnalysis (check minimum 5 completed goals, query vw_UserStrengthAnalysis or equivalent LINQ, identify top 3 strengths by completion rate, identify improvement areas below 50% completion, calculate weekly trend using windowed date buckets, determine trend direction)
- [x] T075 [US5] Create `AnalyticsController` in `backend/GoalsTracker.Api/Controllers/AnalyticsController.cs` — GET /api/analytics/strengths [Authorize] per api-contracts.md
- [x] T076 [US5] Create `StrengthAnalysisComponent` in `frontend/src/app/features/analytics/strength-analysis.component.ts` — DaisyUI progress bars for each category (colored by category color), "Top Strengths" section with badges, "Areas to Improve" section with suggestions, weekly trend display using CSS step visualization or radial progress, "not enough data" empty state with goal count progress

**Checkpoint**: Analytics fully functional — category breakdown, strengths, improvements, and trends display correctly. Minimum data guard works.

---

## Phase 8: User Story 6 - Goal Categories & Tags (Priority: P3) 🏷️

**Goal**: Users assign predefined categories and custom tags to goals, then filter by them.

**Independent Test**: Create a goal → select "Health" category → add tag "fitness" → view goal list → filter by "Health" → only Health goals shown → filter by tag "fitness" → only tagged goals shown.

### Tests for User Story 6

- [x] T077 [P] [US6] Write unit tests for category and tag functionality in `backend/GoalsTracker.Api.Tests/Services/GoalServiceTests.cs` — add tests for create goal with categoryId, create goal with tagNames (new tags created, existing tags reused), filter by categoryId, filter by tag name, unique tag constraint per user

### Implementation for User Story 6

- [x] T078 [US6] Create `CategoriesController` in `backend/GoalsTracker.Api/Controllers/CategoriesController.cs` — GET /api/categories [AllowAnonymous] returning seeded categories sorted by SortOrder
- [x] T079 [US6] Update `GoalService.CreateGoal` and `GoalService.UpdateGoal` in `backend/GoalsTracker.Api/Services/GoalService.cs` — handle CategoryId assignment (validate exists), handle TagNames (find-or-create Tag per user, create GoalTag join records, remove stale GoalTags on update)
- [x] T080 [US6] Update `GoalService.GetGoals` in `backend/GoalsTracker.Api/Services/GoalService.cs` — add categoryId and tag query parameter filtering to the IQueryable pipeline
- [x] T081 [US6] Update `GoalFormComponent` in `frontend/src/app/features/goals/goal-form/goal-form.component.ts` — add category dropdown populated from /api/categories (with colored dots), add tag input field with autocomplete from user's existing tags, display selected tags as removable DaisyUI badges
- [x] T082 [US6] Update `GoalListComponent` in `frontend/src/app/features/goals/goal-list/goal-list.component.ts` — add category filter dropdown alongside timeline tabs, show category chip and tags on each goal card/row
- [x] T083 [US6] Create `ProfileComponent` in `frontend/src/app/features/profile/profile.component.ts` — display/edit username, timezone selector, leaderboard visibility toggle, member since date; calls GET/PUT /api/user/profile
- [x] T084 [US6] Create `UserController` in `backend/GoalsTracker.Api/Controllers/UserController.cs` — GET /api/user/profile, PUT /api/user/profile (username, timezone, isPublicOnLeaderboard) per api-contracts.md

**Checkpoint**: All user stories independently functional — categories and tags enrich goals, filtering works, profile management complete.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Hosting readiness, security hardening, and final quality improvements

- [x] T085 [P] Create `backend/Dockerfile` — multi-stage build (restore → build → publish → runtime on mcr.microsoft.com/dotnet/aspnet:8.0), run as non-root user, expose port 5001
- [x] T086 [P] Create `frontend/Dockerfile` — multi-stage build (node:20 build stage with `ng build --configuration production` → nginx:alpine serve stage), copy `frontend/nginx.conf`
- [x] T087 [P] Create `frontend/nginx.conf` — SPA fallback (try_files $uri $uri/ /index.html), gzip compression, cache-control headers for static assets
- [x] T088 Create `docker-compose.yml` at project root — services: backend (build context, env vars, depends_on db), frontend (build context, port 80, depends_on backend), db (mcr.microsoft.com/mssql/server with SA_PASSWORD env); health checks for all services
- [x] T089 [P] Create `docker-compose.prod.yml` at project root — production overrides: no db service (external SQL Server), production env vars, restart policies
- [x] T090 [P] Add health check endpoint in `backend/GoalsTracker.Api/Program.cs` — map GET /api/health returning 200 with database connectivity check
- [x] T091 [P] Review and harden CORS configuration in `backend/GoalsTracker.Api/Program.cs` — development allows localhost:4200, production locks to specific domain from env var
- [x] T092 [P] Add rate limiting to auth endpoints in `backend/GoalsTracker.Api/Program.cs` — use built-in .NET 8 rate limiter: 5 requests/minute for login, 3/hour for forgot-password
- [x] T093 [P] Verify all controller endpoints have proper [Authorize] or [AllowAnonymous] attributes — audit `backend/GoalsTracker.Api/Controllers/` for missing auth decorators
- [x] T094 [P] Add Swagger/OpenAPI XML documentation generation — enable XML comment output in .csproj, configure SwaggerGen to include XML comments in `Program.cs`
- [x] T095 Run full backend test suite with `dotnet test` in `backend/` — verify all tests pass, fix any failures
- [x] T096 Run Angular build with `ng build --configuration production` in `frontend/` — verify build succeeds within budget limits, fix any warnings
- [x] T097 [P] Run quickstart.md validation — follow setup instructions end-to-end on a clean environment (or via docker-compose up), verify register → create goal → complete → points → leaderboard flow works
- [x] T098 [P] Final code comment review — verify all source files have file-level purpose comment, all public methods have XML/JSDoc comments, complex logic blocks have inline "why" comments

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US3 Auth (Phase 3)**: Depends on Phase 2 — BLOCKS US1, US2, US4, US5, US6 (all require authenticated user)
- **US1 Goals (Phase 4)**: Depends on Phase 3 (auth required to own goals)
- **US2 Points (Phase 5)**: Depends on Phase 4 (points triggered by goal completion)
- **US4 Leaderboard (Phase 6)**: Depends on Phase 5 (leaderboard shows points/achievements)
- **US5 Analytics (Phase 7)**: Depends on Phase 4 (needs completed goals with categories)
- **US6 Categories/Tags (Phase 8)**: Depends on Phase 4 (extends goal model). Can run in parallel with Phase 6 and Phase 7
- **Polish (Phase 9)**: Depends on all user story phases

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US3: Auth)
                                              │
                                              ▼
                                        Phase 4 (US1: Goals)
                                              │
                                    ┌─────────┼─────────┐
                                    ▼         ▼         ▼
                              Phase 5    Phase 7    Phase 8
                             (US2:Pts)  (US5:Ana)  (US6:Tags)
                                    │
                                    ▼
                              Phase 6
                            (US4:Board)
                                    │
                                    ▼
                              Phase 9 (Polish)
```

### Within Each User Story

1. Tests written and verified to FAIL before implementation
2. DTOs before services
3. Services before controllers
4. Backend before frontend components
5. Core component before integration/updates

### Parallel Opportunities

- Phase 1: T004-T010 all parallelizable (different files)
- Phase 2: T012/T013 parallel, T016/T17 parallel, T022-T025 parallel, T027-T032 parallel
- Phase 3: T036/T037 parallel tests, T044/T045/T046 parallel frontend
- Phase 4: T047/T048 parallel tests, T052/T053/T054 parallel frontend
- Phase 5: T056/T057 parallel tests, T062/T063 parallel frontend
- Phase 7 and Phase 8 can run concurrently (independent stories)
- Phase 9: T085-T094 mostly parallelizable

---

## Parallel Example: User Story 1 (Phase 4)

```bash
# Step 1 — Launch tests in parallel (write first, verify they fail):
Task: T047 "Unit tests for GoalService" in backend/.../GoalServiceTests.cs
Task: T048 "Unit tests for GoalsController" in backend/.../GoalsControllerTests.cs

# Step 2 — Launch DTOs (parallel, different files):
Task: T049 "Goal DTOs" in backend/.../Models/Dtos/Goals/

# Step 3 — Service (depends on DTOs):
Task: T050 "GoalService" in backend/.../Services/GoalService.cs

# Step 4 — Controller (depends on service):
Task: T051 "GoalsController" in backend/.../Controllers/GoalsController.cs

# Step 5 — Launch frontend components in parallel:
Task: T052 "GoalListComponent" in frontend/.../goals/goal-list/
Task: T053 "GoalFormComponent" in frontend/.../goals/goal-form/
Task: T054 "GoalDetailComponent" in frontend/.../goals/goal-detail/
Task: T055 "DashboardComponent" in frontend/.../dashboard/
```

---

## Implementation Strategy

### MVP First (User Stories 3 + 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: Authentication (US3)
4. Complete Phase 4: Goals (US1)
5. **STOP and VALIDATE**: Users can register, log in, create/manage goals
6. Deploy/demo if ready — this is a functional personal goal tracker

### Incremental Delivery

1. Setup + Foundational + US3 (Auth) → Users can register and log in
2. Add US1 (Goals) → MVP: Personal goal tracker with timelines
3. Add US2 (Points) → Gamified: Goals earn points, streaks, achievements
4. Add US4 (Leaderboard) → Social: Competitive rankings visible
5. Add US5 (Analytics) → Insightful: Strength analysis and trends
6. Add US6 (Categories/Tags) → Organized: Goals filterable by category
7. Polish → Production-ready: Dockerized, hardened, documented

### Parallel Team Strategy

With 2 developers after Phase 3 (Auth):
- **Dev A**: Phase 4 (Goals) → Phase 5 (Points) → Phase 6 (Leaderboard)
- **Dev B**: Phase 8 (Categories/Tags) → Phase 7 (Analytics) → Phase 9 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests written FIRST and verified to FAIL before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All code must include comments per constitution and user request
