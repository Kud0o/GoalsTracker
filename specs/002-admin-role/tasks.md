# Tasks: Admin Role & Goal Management

**Input**: Design documents from `/specs/002-admin-role/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md

**Tests**: Included per constitution (Principle III).

**Organization**: Tasks grouped by user story + additional UX fixes applied during implementation.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

- **Backend**: `backend/GoalsTracker.Api/`
- **Tests**: `backend/GoalsTracker.Api.Tests/`
- **Frontend**: `frontend/src/app/`

---

## Phase 1: Setup (Role Infrastructure)

- [x] T001 Add `AssignedByAdminId` and `AssignedByAdmin` to `backend/GoalsTracker.Api/Models/Entities/Goal.cs`
- [x] T002 Update `AppDbContext` in `backend/GoalsTracker.Api/Data/AppDbContext.cs` — FK config, index, NoAction delete
- [x] T003 Generate EF Core migration `AddAdminRole` in `backend/GoalsTracker.Api/Data/Migrations/`
- [x] T004 Update `SeedData.cs` in `backend/GoalsTracker.Api/Data/Seed/SeedData.cs` — seed Admin/User roles + default admin
- [x] T005 Update `Program.cs` in `backend/GoalsTracker.Api/Program.cs` — register admin services, pass role/user managers to seed
- [x] T006 Update `AuthService.cs` in `backend/GoalsTracker.Api/Services/AuthService.cs` — add role claims to JWT
- [x] T007 [P] Add `Admin:SeedEmail` config in `backend/GoalsTracker.Api/appsettings.json`
- [x] T008 [P] Create admin DTOs in `backend/GoalsTracker.Api/Models/Dtos/Admin/` (AdminAssignGoalDto, AdminBatchResultDto, AdminUserListDto, AdminCategoryDto)
- [x] T009 [P] Create frontend admin models in `frontend/src/app/core/models/admin.model.ts`
- [x] T010 [P] Create `AdminGuard` in `frontend/src/app/core/guards/admin.guard.ts`
- [x] T011 Update `GoalResponseDto` in `backend/GoalsTracker.Api/Models/Dtos/Goals/GoalResponseDto.cs` — add IsAdminAssigned, AssignedByAdminName
- [x] T012 Update `MapGoalToDto` in `backend/GoalsTracker.Api/Services/GoalService.cs` — populate admin fields
- [x] T013 Update `GoalService` query includes in `backend/GoalsTracker.Api/Services/GoalService.cs` — `.Include(g => g.AssignedByAdmin)`

---

## Phase 2: User Story 1 - Admin Assigns Goals (P1)

- [x] T014 [P] [US1] Write unit tests for AdminGoalService in `backend/GoalsTracker.Api.Tests/Services/AdminGoalServiceTests.cs`
- [x] T015 [US1] Create `IAdminGoalService` + `AdminGoalService` in `backend/GoalsTracker.Api/Services/`
- [x] T016 [US1] Create `AdminGoalsController` in `backend/GoalsTracker.Api/Controllers/AdminGoalsController.cs`
- [x] T017 [US1] Create `AdminAssignGoalComponent` in `frontend/src/app/features/admin/admin-assign-goal/admin-assign-goal.component.ts`
- [x] T018 [US1] Create `AdminUserGoalsComponent` in `frontend/src/app/features/admin/admin-user-goals/admin-user-goals.component.ts`
- [x] T019 [US1] Update Goal interface in `frontend/src/app/core/models/goal.model.ts` — add isAdminAssigned, assignedByAdminName
- [x] T020 [US1] Update `GoalListComponent` in `frontend/src/app/features/goals/goal-list/goal-list.component.ts` — admin badge
- [x] T021 [US1] Update `GoalDetailComponent` in `frontend/src/app/features/goals/goal-detail/goal-detail.component.ts` — "Assigned By" row

---

## Phase 3: User Story 2 - Deletion Restrictions (P1)

- [x] T022 [P] [US2] Write deletion restriction tests in `backend/GoalsTracker.Api.Tests/Services/AdminGoalServiceTests.cs`
- [x] T023 [US2] Verify AdminGoalsController has NO delete endpoint in `backend/GoalsTracker.Api/Controllers/AdminGoalsController.cs`
- [x] T024 [US2] Verify GoalService.DeleteGoalAsync allows users to delete admin-assigned goals in `backend/GoalsTracker.Api/Services/GoalService.cs`
- [x] T025 [US2] Verify AdminUserGoalsComponent has NO delete buttons in `frontend/src/app/features/admin/admin-user-goals/admin-user-goals.component.ts`

---

## Phase 4: User Story 3 - Category CRUD (P1)

- [x] T026 [P] [US3] Write unit tests for AdminCategoryService in `backend/GoalsTracker.Api.Tests/Services/AdminCategoryServiceTests.cs`
- [x] T027 [US3] Create `IAdminCategoryService` + `AdminCategoryService` in `backend/GoalsTracker.Api/Services/`
- [x] T028 [US3] Create `AdminCategoriesController` in `backend/GoalsTracker.Api/Controllers/AdminCategoriesController.cs`
- [x] T029 [US3] Create `AdminCategoriesComponent` in `frontend/src/app/features/admin/admin-categories/admin-categories.component.ts`

---

## Phase 5: User Story 4 - User Management (P2)

- [x] T030 [P] [US4] Write user listing tests in `backend/GoalsTracker.Api.Tests/Services/AdminGoalServiceTests.cs`
- [x] T031 [US4] Add `GetAllUsersAsync` to `AdminGoalService` in `backend/GoalsTracker.Api/Services/AdminGoalService.cs`
- [x] T032 [US4] Create `AdminUsersController` in `backend/GoalsTracker.Api/Controllers/AdminUsersController.cs`
- [x] T033 [US4] Create `AdminUsersComponent` in `frontend/src/app/features/admin/admin-users/admin-users.component.ts`
- [x] T034 [US4] Create `AdminLayoutComponent` in `frontend/src/app/features/admin/admin-layout/admin-layout.component.ts`
- [x] T035 [US4] Update `app.routes.ts` in `frontend/src/app/app.routes.ts` — add /admin/* routes with adminGuard
- [x] T036 [US4] Update navbar in `frontend/src/app/shared/components/navbar/navbar.component.html` — Admin link for admins

---

## Phase 6: UX Fixes & Enhancements

- [x] T037 Hide navbar when logged out in `frontend/src/app/app.component.html` — wrap in `@if (auth.isAuthenticated())`
- [x] T038 Fix API error handling in `frontend/src/app/core/services/api.service.ts` — network errors, server errors, 401, 403
- [x] T039 Fix admin users PagedResponse mismatch in `frontend/src/app/features/admin/admin-users/admin-users.component.ts`
- [x] T040 Fix admin assign goal PagedResponse mismatch in `frontend/src/app/features/admin/admin-assign-goal/admin-assign-goal.component.ts`
- [x] T041 Add FirstName/LastName to User entity in `backend/GoalsTracker.Api/Models/Entities/User.cs`
- [x] T042 Add FirstName/LastName to RegisterDto in `backend/GoalsTracker.Api/Models/Dtos/Auth/RegisterDto.cs`
- [x] T043 Add FirstName to TokenDto and JWT generation in `backend/GoalsTracker.Api/Services/AuthService.cs`
- [x] T044 Add FirstName/LastName to profile GET/PUT in `backend/GoalsTracker.Api/Controllers/UserController.cs`
- [x] T045 Update AppDbContext for FirstName/LastName in `backend/GoalsTracker.Api/Data/AppDbContext.cs`
- [x] T046 Generate EF migration `AddUserNames` in `backend/GoalsTracker.Api/Data/Migrations/`
- [x] T047 Add firstName to frontend TokenResponse in `frontend/src/app/core/models/user.model.ts`
- [x] T048 Update register form with FirstName/LastName fields in `frontend/src/app/features/auth/register/register.component.ts`
- [x] T049 Update dashboard greeting to use firstName in `frontend/src/app/features/dashboard/dashboard.component.ts`
- [x] T050 Update profile form with FirstName/LastName in `frontend/src/app/features/profile/profile.component.ts`
- [x] T051 Create icon-map utility in `frontend/src/app/shared/utils/icon-map.ts`
- [x] T052 Update goal-form category dropdown to use emoji icons in `frontend/src/app/features/goals/goal-form/goal-form.component.ts`
- [x] T053 Update admin-categories to use emoji icon picker in `frontend/src/app/features/admin/admin-categories/admin-categories.component.ts`
- [x] T054 Update admin-assign-goal category dropdown to use emoji in `frontend/src/app/features/admin/admin-assign-goal/admin-assign-goal.component.ts`
- [x] T055 Fix analytics data interface mismatch in `frontend/src/app/features/analytics/strength-analysis.component.ts`
- [x] T056 Add admin panel greeting with firstName in `frontend/src/app/features/admin/admin-layout/admin-layout.component.ts`
- [x] T057 Add FirstName/LastName to leaderboard DTO in `backend/GoalsTracker.Api/Models/Dtos/Leaderboard/LeaderboardEntryDto.cs`
- [x] T058 Update LeaderboardService to populate names in `backend/GoalsTracker.Api/Services/LeaderboardService.cs`
- [x] T059 Update leaderboard table to show full name in `frontend/src/app/features/leaderboard/leaderboard.component.ts`
- [x] T060 Add FirstName/LastName to AdminUserListDto in `backend/GoalsTracker.Api/Models/Dtos/Admin/AdminUserListDto.cs`
- [x] T061 Update AdminGoalService to populate names in `backend/GoalsTracker.Api/Services/AdminGoalService.cs`
- [x] T062 Add firstName/lastName to AdminUser model in `frontend/src/app/core/models/admin.model.ts`
- [x] T063 Update admin users table to show full name in `frontend/src/app/features/admin/admin-users/admin-users.component.ts`
- [x] T064 Update admin assign goal user list to show full name in `frontend/src/app/features/admin/admin-assign-goal/admin-assign-goal.component.ts`

---

## Phase 7: Build & Test Verification

- [x] T065 Rebuild Tailwind CSS in `frontend/`
- [x] T066 Verify backend builds with 0 errors
- [x] T067 Run all backend tests — 47 pass (32 original + 15 admin)
- [x] T068 Verify frontend builds with 0 errors

---

## Notes

- All 68 tasks complete
- 47 backend tests pass
- Both builds clean (0 errors)
- Admin features: batch assign, no-delete restriction, category CRUD, user management
- UX: navbar hidden when logged out, proper error handling, firstName/lastName everywhere, emoji icon picker, fixed analytics
