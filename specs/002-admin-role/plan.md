# Implementation Plan: Admin Role & Goal Management

**Branch**: `002-admin-role` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-admin-role/spec.md`

## Summary

Add role-based access control (User/Admin) to the existing GoalsTracker
application. Admins can assign goals to one or more users in a single
action (batch), manage categories (CRUD), and view all users with
statistics. Admins CANNOT delete any goal visible to a user. This
builds on the existing ASP.NET Core 10 + Angular 19 codebase.

## Technical Context

**Language/Version**: C# / .NET 10 (backend), TypeScript / Angular 19 (frontend)
**Primary Dependencies**: ASP.NET Identity Roles (built-in), existing EF Core + JWT setup
**Storage**: SQL Server (EF Core migrations — add columns/roles)
**Testing**: xUnit (backend), Karma + Jasmine (frontend)
**Target Platform**: Same as 001 — Docker/server + modern browsers
**Project Type**: Feature addition to existing web application
**Performance Goals**: Batch goal assignment for up to 50 users in <2s
**Constraints**: Minimal new libraries, reuse existing auth infrastructure
**Scale/Scope**: 2 roles, 4 user stories, ~8 new screens/views, 1 entity extension

## Constitution Check

| Principle | Pre-Design | Post-Design | How Addressed |
|-----------|-----------|-------------|---------------|
| I. Quality-First | PASS | PASS | Extends existing SOLID service layer; new AdminGoalService, AdminCategoryService with interfaces |
| II. Security by Design | PASS | PASS | [Authorize(Roles="Admin")] on all admin endpoints; no delete endpoint for goals in admin controllers (architectural enforcement); server-side role checks |
| III. Comprehensive Testing | PASS | PASS | Unit tests for all permission boundaries: admin can't delete goals, user can't access admin endpoints, batch assignment creates N independent goals |
| IV. User Experience | PASS | PASS | Admin panel as dedicated nav section; "Assigned by Admin" badges on goals; multi-user select for batch assignment |
| V. Performance | PASS | PASS | Batch creation in single DB transaction; no N+1 queries on user list |

**Gate result**: ALL PASS.

## Project Structure

### Documentation

```text
specs/002-admin-role/
├── plan.md              # This file
├── research.md          # Approach decisions
├── data-model.md        # Schema changes
├── contracts/
│   └── api-contracts.md # Admin API endpoints
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code Changes

```text
backend/GoalsTracker.Api/
├── Controllers/
│   ├── AdminGoalsController.cs       # NEW — batch assign, view user goals
│   ├── AdminCategoriesController.cs  # NEW — CRUD categories (admin only)
│   ├── AdminUsersController.cs       # NEW — list users with stats
│   └── GoalsController.cs            # MODIFIED — include AssignedByAdminId in responses
├── Models/
│   ├── Entities/
│   │   └── Goal.cs                   # MODIFIED — add AssignedByAdminId, AssignedByAdmin nav
│   └── Dtos/
│       └── Admin/
│           ├── AdminAssignGoalDto.cs  # NEW — goal details + List<Guid> UserIds
│           ├── AdminUserListDto.cs    # NEW — user with goal stats
│           ├── AdminCategoryDto.cs    # NEW — create/edit category payload
│           └── AdminBatchResultDto.cs # NEW — batch assignment result
├── Services/
│   ├── IAdminGoalService.cs + AdminGoalService.cs   # NEW — batch assign, user goal queries
│   ├── IAdminCategoryService.cs + AdminCategoryService.cs  # NEW — category CRUD
│   └── AuthService.cs               # MODIFIED — add role claim to JWT
├── Data/
│   ├── AppDbContext.cs               # MODIFIED — Goal.AssignedByAdminId FK config
│   ├── Seed/SeedData.cs             # MODIFIED — seed Admin/User roles + default admin
│   └── Migrations/AddAdminRole.cs   # NEW — migration
└── Program.cs                        # MODIFIED — register admin services

backend/GoalsTracker.Api.Tests/
├── Services/
│   ├── AdminGoalServiceTests.cs      # NEW
│   └── AdminCategoryServiceTests.cs  # NEW

frontend/src/app/
├── core/
│   ├── guards/admin.guard.ts         # NEW — restrict /admin/* routes
│   └── models/admin.model.ts         # NEW — interfaces
├── features/admin/
│   ├── admin-layout.component.ts     # NEW — sidebar + content
│   ├── admin-users.component.ts      # NEW — user list
│   ├── admin-user-goals.component.ts # NEW — user's goals (read-only)
│   ├── admin-assign-goal.component.ts # NEW — form with multi-user select
│   └── admin-categories.component.ts # NEW — category CRUD table
├── shared/components/navbar/         # MODIFIED — "Admin" nav link
└── app.routes.ts                     # MODIFIED — /admin/* routes
```

## Key Design Decisions

| Decision | Approach | Rationale |
|----------|----------|-----------|
| Role system | ASP.NET Identity Roles | Zero new packages; [Authorize(Roles)] built-in |
| Batch assign | Single POST with `userIds[]` | One transaction, one request, N goals |
| Ownership tracking | `AssignedByAdminId` nullable FK | Null = user-created, non-null = admin-assigned |
| No admin delete | No delete endpoint in admin controllers | Architectural enforcement > permission check |
| Category CRUD | Separate AdminCategoriesController | Clean separation; existing public GET unchanged |
| Admin seeding | Config-based email promotion | No self-service signup |
| JWT role claim | Add `role` claim in AuthService | Frontend AdminGuard reads from token |

## Complexity Tracking

> No constitution violations.
