# Research: Admin Role & Goal Management

**Date**: 2026-04-21
**Spec**: [spec.md](./spec.md)

## Approach Decision

### Role System: ASP.NET Identity Roles

**Decision**: Use built-in ASP.NET Identity Roles — already
available in the project's Identity setup.

**Rationale**: Zero new packages. Identity Roles provide:
- `UserManager.AddToRoleAsync(user, "Admin")` for promotion
- `[Authorize(Roles = "Admin")]` attribute on controllers
- Role claims automatically included in JWT via Identity
- `User.IsInRole("Admin")` for server-side checks

**Alternatives rejected**:
- Policy-based auth: Overkill for 2 roles
- Custom role table: Reinvents Identity Roles

### Batch Goal Assignment

**Decision**: Single API endpoint accepts goal details +
`List<Guid> userIds`. Server creates N independent Goal entities
in one database transaction.

**Rationale**: Simplest approach. The admin form collects goal
data + multi-select users, sends one POST. Server iterates
userIds and creates a Goal per user with `AssignedByAdminId`
set. All in one `SaveChangesAsync` call.

**Alternatives rejected**:
- Queue-based async: Overengineering for <50 users
- Shared goal template entity: Adds complexity; each user's
  goal must be independent per spec

### Admin Deletion Restriction

**Decision**: Admin controllers simply have NO delete endpoint
for goals. The restriction is architectural — there is no code
path for an admin to delete a user's goal.

**Rationale**: More secure than a permission check. If the
endpoint doesn't exist, it can't be exploited.

### Category CRUD for Admins

**Decision**: New `AdminCategoriesController` with full CRUD.
Existing `CategoriesController` (GET-only, public) remains
unchanged for regular users.

**Rationale**: Clean separation. Users still read categories
from the existing endpoint. Admins manage via admin-only endpoint.

### Admin Seeding

**Decision**: `SeedData.cs` extended to:
1. Create "Admin" and "User" roles
2. Optionally promote a user by email (from `appsettings.json`
   `Admin:SeedEmail` key) to Admin role

**Rationale**: No self-service admin signup per assumptions.
Configurable via environment variable for production.
