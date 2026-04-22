# Tasks: Goal Tracker with Points & Competitive Dashboard

**Input**: Design documents from `/specs/001-goal-tracker/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Tests**: Included — the constitution mandates comprehensive testing (Principle III).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/GoalsTracker.Api/` for source, `backend/GoalsTracker.Api.Tests/` for tests
- **Frontend**: `frontend/src/app/` for source
- Web application structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, scaffolding, and configuration

- [x] T001 Create .NET solution and API project in `backend/GoalsTracker.slnx` and `backend/GoalsTracker.Api/`
- [x] T002 Create xUnit test project in `backend/GoalsTracker.Api.Tests/` with reference to API project
- [x] T003 Create Angular 19 project in `frontend/` with standalone components
- [x] T004 [P] Install and configure Tailwind CSS v4 + DaisyUI v5 with Tailwind CLI prebuild pipeline in `frontend/src/styles.css` and `frontend/postcss.config.js`
- [x] T005 [P] Install backend NuGet packages (EF Core SqlServer, JWT Bearer, Identity.EF, EF Tools, EF Design, HealthChecks.EF) in `backend/GoalsTracker.Api/GoalsTracker.Api.csproj`
- [x] T006 [P] Create `.editorconfig` at project root with C# and TypeScript formatting rules
- [x] T007 [P] Create `.gitignore` at project root covering .NET, Angular, IDE, and secrets files
- [x] T008 [P] Create `backend/GoalsTracker.Api/appsettings.json` with base config and `appsettings.Development.example.json` with connection string template
- [x] T009 [P] Create environment files `frontend/src/environments/environment.ts` (apiUrl: localhost:5099) and `environment.prod.ts`
- [x] T010 [P] Configure Angular build budgets in `frontend/angular.json` (500kB warning, 1MB error)

**Checkpoint**: Both projects build and run.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

- [x] T011 Create enum types: `TimelineType.cs`, `GoalStatus.cs`, `TransactionType.cs` in `backend/GoalsTracker.Api/Models/Enums/`
- [x] T012 [P] Create `AchievementLevel` entity in `backend/GoalsTracker.Api/Models/Entities/AchievementLevel.cs`
- [x] T013 [P] Create `Category` entity in `backend/GoalsTracker.Api/Models/Entities/Category.cs`
- [x] T014 Create `User` entity extending `IdentityUser<Guid>` in `backend/GoalsTracker.Api/Models/Entities/User.cs`
- [x] T015 Create `Goal` entity in `backend/GoalsTracker.Api/Models/Entities/Goal.cs`
- [x] T016 [P] Create `Tag` and `GoalTag` entities in `backend/GoalsTracker.Api/Models/Entities/Tag.cs` and `GoalTag.cs`
- [x] T017 [P] Create `PointTransaction` entity in `backend/GoalsTracker.Api/Models/Entities/PointTransaction.cs`
- [x] T018 Create `AppDbContext` in `backend/GoalsTracker.Api/Data/AppDbContext.cs` with Fluent API config, indexes, and cascade rules
- [x] T019 Create `SeedData.cs` in `backend/GoalsTracker.Api/Data/Seed/SeedData.cs` (6 categories + 5 achievement levels)
- [x] T020 Configure `Program.cs` in `backend/GoalsTracker.Api/Program.cs` — DbContext, Identity, JWT, CORS, Swagger, health checks, seed
- [x] T021 Generate EF Core migration: `InitialCreate` in `backend/GoalsTracker.Api/Data/Migrations/`
- [x] T022 [P] Create `ExceptionMiddleware` in `backend/GoalsTracker.Api/Middleware/ExceptionMiddleware.cs`
- [x] T023 [P] Create `PaginationHelper` in `backend/GoalsTracker.Api/Helpers/PaginationHelper.cs`
- [x] T024 [P] Create `DateTimeHelper` in `backend/GoalsTracker.Api/Helpers/DateTimeHelper.cs`
- [x] T025 [P] Create shared DTOs: `PagedResponseDto.cs` and `ErrorResponseDto.cs` in `backend/GoalsTracker.Api/Models/Dtos/`
- [x] T026 Create Angular core models in `frontend/src/app/core/models/` (user, goal, points, api-response)
- [x] T027 [P] Create `ApiService` in `frontend/src/app/core/services/api.service.ts`
- [x] T028 [P] Create `NotificationService` in `frontend/src/app/core/services/notification.service.ts`
- [x] T029 [P] Create shared UI components: loading-spinner, empty-state, pagination in `frontend/src/app/shared/components/`
- [x] T030 [P] Create `NavbarComponent` in `frontend/src/app/shared/components/navbar/` with gradient design, icons, mobile drawer
- [x] T031 [P] Create `AchievementBadgeComponent` in `frontend/src/app/shared/components/achievement-badge/` with tier-aware gradients and glow
- [x] T032 [P] Create `RelativeDatePipe` in `frontend/src/app/shared/pipes/relative-date.pipe.ts`
- [x] T033 Configure `app.config.ts` in `frontend/src/app/app.config.ts` with HttpClient + interceptors
- [x] T034 Configure `app.routes.ts` in `frontend/src/app/app.routes.ts` with lazy-loaded routes and auth guard
- [x] T035 Set up `AppComponent` in `frontend/src/app/app.component.ts` with navbar + router-outlet + toasts

**Checkpoint**: Foundation ready — database seeded, backend serves health check, frontend renders navbar with routing.

---

## Phase 3: User Story 3 - User Registration & Authentication (Priority: P1)

**Goal**: Visitors register, log in, log out, reset passwords. JWT with refresh tokens.

**Independent Test**: Register → login → dashboard → logout → cannot access protected pages.

- [x] T036 [P] [US3] Write unit tests for AuthService in `backend/GoalsTracker.Api.Tests/Services/AuthServiceTests.cs`
- [x] T037 [P] [US3] Create Auth DTOs in `backend/GoalsTracker.Api/Models/Dtos/Auth/` (Register, Login, Token, ForgotPassword, ResetPassword, RefreshToken)
- [x] T038 [US3] Create `IAuthService` and `AuthService` in `backend/GoalsTracker.Api/Services/` (JWT generation, refresh tokens, password reset)
- [x] T039 [US3] Create `AuthController` in `backend/GoalsTracker.Api/Controllers/AuthController.cs` (register, login, refresh, forgot/reset password)
- [x] T040 [US3] Create `AuthService` in `frontend/src/app/core/services/auth.service.ts` (signals, token storage, refresh)
- [x] T041 [US3] Create `AuthInterceptor` in `frontend/src/app/core/interceptors/auth.interceptor.ts` (JWT header, 401 refresh)
- [x] T042 [US3] Create `AuthGuard` in `frontend/src/app/core/guards/auth.guard.ts`
- [x] T043 [P] [US3] Create `LoginComponent` in `frontend/src/app/features/auth/login/login.component.ts` with split layout, input icons, autocomplete attributes
- [x] T044 [P] [US3] Create `RegisterComponent` in `frontend/src/app/features/auth/register/register.component.ts` with password strength indicator
- [x] T045 [P] [US3] Create `ForgotPasswordComponent` in `frontend/src/app/features/auth/forgot-password/forgot-password.component.ts` with animated success state

**Checkpoint**: Users register, log in, access protected routes. JWT refresh transparent.

---

## Phase 4: User Story 1 - Create and Manage Goals (Priority: P1)

**Goal**: CRUD goals with weekly/monthly/yearly timelines. Overdue detection.

**Independent Test**: Create goal → see in list → edit → mark complete → filter by timeline.

- [x] T046 [P] [US1] Write unit tests for GoalService in `backend/GoalsTracker.Api.Tests/Services/GoalServiceTests.cs` (12 tests)
- [x] T047 [P] [US1] Create Goal DTOs in `backend/GoalsTracker.Api/Models/Dtos/Goals/` (Create, Update, Response, CompletionResult)
- [x] T048 [US1] Create `IGoalService` and `GoalService` in `backend/GoalsTracker.Api/Services/` (CRUD, overdue detection, filtering)
- [x] T049 [US1] Create `GoalsController` in `backend/GoalsTracker.Api/Controllers/GoalsController.cs` (6 endpoints with ownership checks)
- [x] T050 [US1] Create `GoalListComponent` in `frontend/src/app/features/goals/goal-list/goal-list.component.ts` with pill tabs, status toggles, hover cards
- [x] T051 [US1] Create `GoalFormComponent` in `frontend/src/app/features/goals/goal-form/goal-form.component.ts` with two-column layout, live preview, timeline cards
- [x] T052 [US1] Create `GoalDetailComponent` in `frontend/src/app/features/goals/goal-detail/goal-detail.component.ts` with gradient header, celebration section
- [x] T053 [US1] Create `DashboardComponent` in `frontend/src/app/features/dashboard/dashboard.component.ts` with hero banner, stat cards, quick actions, timeline goals

**Checkpoint**: MVP — users create and manage goals. Dashboard shows summary.

---

## Phase 5: User Story 2 - Points Encouragement System (Priority: P1)

**Goal**: Completing goals awards points with bonuses for early completion and streaks.

**Independent Test**: Complete weekly goal → earn 10 pts → early bonus → streak bonus → level up.

- [x] T054 [P] [US2] Write unit tests for PointsService in `backend/GoalsTracker.Api.Tests/Services/PointsServiceTests.cs` (10 tests)
- [x] T055 [P] [US2] Create Points DTOs in `backend/GoalsTracker.Api/Models/Dtos/Points/` (PointHistory, PointsSummary)
- [x] T056 [US2] Create `IPointsService` and `PointsService` in `backend/GoalsTracker.Api/Services/` (calculation, streaks, bonuses, level-up)
- [x] T057 [US2] Create `PointsController` in `backend/GoalsTracker.Api/Controllers/PointsController.cs` (history, summary)
- [x] T058 [US2] Create `PointsSummaryComponent` in `frontend/src/app/features/points/points-summary/points-summary.component.ts` with gradient hero, progress bar
- [x] T059 [US2] Create `PointsHistoryComponent` in `frontend/src/app/features/points/points-history/points-history.component.ts` with timeline layout

**Checkpoint**: Full points system — completing goals awards points, streaks work, levels promote.

---

## Phase 6: User Story 4 - Competitive Dashboard (Priority: P2)

**Goal**: Public leaderboard with achievement levels, period filtering, podium for top 3.

**Independent Test**: Navigate to leaderboard → see ranked users → own row highlighted → filter by period.

- [x] T060 [P] [US4] Write unit tests for LeaderboardService in `backend/GoalsTracker.Api.Tests/Services/LeaderboardServiceTests.cs` (5 tests)
- [x] T061 [P] [US4] Create Leaderboard DTOs in `backend/GoalsTracker.Api/Models/Dtos/Leaderboard/` (LeaderboardEntry, LeaderboardResponse)
- [x] T062 [US4] Create `ILeaderboardService` and `LeaderboardService` in `backend/GoalsTracker.Api/Services/` (ranking, period filter, current user)
- [x] T063 [US4] Create `LeaderboardController` in `backend/GoalsTracker.Api/Controllers/LeaderboardController.cs` (AllowAnonymous, enriched for auth)
- [x] T064 [US4] Create `LeaderboardComponent` in `frontend/src/app/features/leaderboard/leaderboard.component.ts` with podium section, search, highlighted row

**Checkpoint**: Leaderboard functional — ranks visible, podium for top 3, period filtering.

---

## Phase 7: User Story 5 - Strength Analysis (Priority: P2)

**Goal**: Category-based completion analysis, strengths, improvement areas, trends.

**Independent Test**: 5+ goals → category bars → strengths → trends. <5 goals → "not enough data".

- [x] T065 [P] [US5] Write unit tests for AnalyticsService in `backend/GoalsTracker.Api.Tests/Services/AnalyticsServiceTests.cs` (4 tests)
- [x] T066 [P] [US5] Create Analytics DTOs in `backend/GoalsTracker.Api/Models/Dtos/Analytics/` (CategoryBreakdown, StrengthAnalysis, Trend)
- [x] T067 [US5] Create `IAnalyticsService` and `AnalyticsService` in `backend/GoalsTracker.Api/Services/` (category stats, trends, strength identification)
- [x] T068 [US5] Create `AnalyticsController` in `backend/GoalsTracker.Api/Controllers/AnalyticsController.cs` (GET strengths)
- [x] T069 [US5] Create `StrengthAnalysisComponent` in `frontend/src/app/features/analytics/strength-analysis.component.ts` with animated bars, heatmap, trend badges

**Checkpoint**: Analytics functional — category breakdown, strengths, improvements, trends.

---

## Phase 8: User Story 6 - Goal Categories & Tags (Priority: P3)

**Goal**: Predefined categories and custom tags for goals, filtering by both.

**Independent Test**: Create goal with "Health" category + "fitness" tag → filter by category → filter by tag.

- [x] T070 [US6] Create `CategoriesController` in `backend/GoalsTracker.Api/Controllers/CategoriesController.cs` (GET categories, AllowAnonymous)
- [x] T071 [US6] Implement category and tag handling in `GoalService.CreateGoal` and `GoalService.UpdateGoal` in `backend/GoalsTracker.Api/Services/GoalService.cs`
- [x] T072 [US6] Implement category/tag filtering in `GoalService.GetGoals` in `backend/GoalsTracker.Api/Services/GoalService.cs`
- [x] T073 [US6] Add category dropdown and tag chip input to `GoalFormComponent` in `frontend/src/app/features/goals/goal-form/goal-form.component.ts`
- [x] T074 [US6] Add category filter to `GoalListComponent` in `frontend/src/app/features/goals/goal-list/goal-list.component.ts`
- [x] T075 [US6] Create `ProfileComponent` in `frontend/src/app/features/profile/profile.component.ts` with gradient header, stats, editable form
- [x] T076 [US6] Create `UserController` in `backend/GoalsTracker.Api/Controllers/UserController.cs` (GET/PUT profile)

**Checkpoint**: All user stories functional — categories, tags, filtering, profile management.

---

## Phase 9: Hosting & Docker

**Purpose**: Production-ready deployment configuration

- [x] T077 [P] Create `backend/Dockerfile` (multi-stage .NET build, non-root user, port 5000)
- [x] T078 [P] Create `frontend/Dockerfile` (multi-stage Angular build + Nginx serve)
- [x] T079 [P] Create `frontend/nginx.conf` (SPA fallback, gzip, cache headers, API proxy)
- [x] T080 Create `docker-compose.yml` (backend + frontend + SQL Server with health checks)
- [x] T081 [P] Create `docker-compose.prod.yml` (production overrides, no local SQL Server)
- [x] T082 [P] Create `.dockerignore` at project root

**Checkpoint**: Application deployable via `docker-compose up --build`.

---

## Phase 10: Testing & Quality

**Purpose**: Unit tests, integration tests, and build verification

- [x] T083 [P] Write GoalService unit tests (12 tests) in `backend/GoalsTracker.Api.Tests/Services/GoalServiceTests.cs`
- [x] T084 [P] Write PointsService unit tests (10 tests) in `backend/GoalsTracker.Api.Tests/Services/PointsServiceTests.cs`
- [x] T085 [P] Write LeaderboardService unit tests (5 tests) in `backend/GoalsTracker.Api.Tests/Services/LeaderboardServiceTests.cs`
- [x] T086 [P] Write AnalyticsService unit tests (4 tests) in `backend/GoalsTracker.Api.Tests/Services/AnalyticsServiceTests.cs`
- [x] T087 Verify all 32 backend tests pass with `dotnet test` in `backend/`
- [x] T088 Verify Angular build succeeds with `ng build --configuration development` in `frontend/`
- [x] T089 Verify Tailwind CSS + DaisyUI build via `npx tailwindcss -i src/styles.css -o src/styles.built.css` in `frontend/`

**Checkpoint**: All tests pass, both projects build clean.

---

## Phase 11: Polish & UX Fixes

**Purpose**: Design enrichment and bug fixes from UI testing

- [x] T090 [P] Enrich navbar with gradient background, trophy icon, nav icons, responsive drawer in `frontend/src/app/shared/components/navbar/`
- [x] T091 [P] Enrich login page with split layout, input icons, autocomplete attributes in `frontend/src/app/features/auth/login/login.component.ts`
- [x] T092 [P] Enrich register page with split layout, password strength bars in `frontend/src/app/features/auth/register/register.component.ts`
- [x] T093 [P] Enrich dashboard with hero banner, stat card icons, quick actions, timeline goals in `frontend/src/app/features/dashboard/dashboard.component.ts`
- [x] T094 [P] Enrich goal list with pill tabs, hover lift cards, progress bars in `frontend/src/app/features/goals/goal-list/goal-list.component.ts`
- [x] T095 [P] Enrich goal form with two-column layout, visual timeline cards, live preview in `frontend/src/app/features/goals/goal-form/goal-form.component.ts`
- [x] T096 [P] Enrich goal detail with gradient header, celebration section, overdue banner in `frontend/src/app/features/goals/goal-detail/goal-detail.component.ts`
- [x] T097 [P] Enrich points summary with gradient hero, animated fire icon in `frontend/src/app/features/points/points-summary/points-summary.component.ts`
- [x] T098 [P] Enrich leaderboard with podium section, search filter, medal styling in `frontend/src/app/features/leaderboard/leaderboard.component.ts`
- [x] T099 [P] Enrich analytics with animated bars, heatmap circles, trend badges in `frontend/src/app/features/analytics/strength-analysis.component.ts`
- [x] T100 [P] Enrich profile with gradient header, centered avatar, save animation in `frontend/src/app/features/profile/profile.component.ts`
- [x] T101 Fix Tailwind CSS pipeline — switch to Tailwind CLI prebuild for utility generation in `frontend/package.json` and `frontend/angular.json`
- [x] T102 Fix navbar dropdown z-index (z-[1] → z-50) and nav-avatar spacing (gap-4) in `frontend/src/app/shared/components/navbar/navbar.component.html`
- [x] T103 Fix profile [object Object] — handle achievementLevel as string or object in `frontend/src/app/features/profile/profile.component.ts`
- [x] T104 Fix goal form timeline card spacing (add block display) and cancel button icon in `frontend/src/app/features/goals/goal-form/goal-form.component.ts`
- [x] T105 Fix login autocomplete attributes (name, autocomplete) in `frontend/src/app/features/auth/login/login.component.ts`
- [x] T106 Fix leaderboard podium visibility (hide when <3 users or all 0 points) and username tooltips in `frontend/src/app/features/leaderboard/leaderboard.component.ts`
- [x] T107 Fix validation error semantics (<label> → <p role="alert">) in login and register components
- [x] T108 Fix leaderboard table semantics (add scope="col" to th elements) in `frontend/src/app/features/leaderboard/leaderboard.component.ts`
- [x] T109 Fix avatar centering — flex items-center justify-center leading-none on navbar and profile avatars
- [x] T110 Fix EF Core GoalStatus sentinel value warning in `backend/GoalsTracker.Api/Data/AppDbContext.cs`
- [x] T111 Fix PointTransaction FK cascade path (SetNull → NoAction) in `backend/GoalsTracker.Api/Data/AppDbContext.cs`

---

## Dependencies & Execution Order

### Phase Dependencies

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
                              ┌─────┼─────┐
                              ▼     ▼     ▼
                          Phase 9  10    11
                          (Docker)(Test)(Polish)
```

### Build & Run Commands

```bash
# Backend
cd backend/GoalsTracker.Api && dotnet run

# Frontend (must rebuild CSS first)
cd frontend && npm run css:build && ng serve --port 4250

# Tests
cd backend && dotnet test

# Docker
docker-compose up --build
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- All 111 tasks are COMPLETE
- 32 backend unit tests pass
- Both projects build with 0 errors
- Tailwind CSS uses CLI prebuild pipeline (not Angular's internal PostCSS)
- DaisyUI loaded via `@plugin "daisyui"` processed by Tailwind CLI
