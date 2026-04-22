# Data Model Changes: Admin Role & Goal Management

**Date**: 2026-04-21
**Database**: SQL Server (EF Core migrations)

## Schema Changes

### Goal Table — Add Column

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| AssignedByAdminId | UNIQUEIDENTIFIER | NULL, FK → AspNetUsers(Id) | NULL = user-created, non-null = admin who assigned it |

**Index**: IX_Goals_AssignedByAdminId — filter admin-assigned goals

**FK behavior**: `OnDelete(NoAction)` — if admin account deleted,
assigned goals remain with their `AssignedByAdminId` value for
historical reference.

### AspNetRoles Table — Seed Data

| Name |
|------|
| User |
| Admin |

Seeded via `RoleManager.CreateAsync()` in `SeedData.cs`.

### AspNetUserRoles Table — Seed Data

Default admin user promoted via configurable email from
`appsettings.json` → `Admin:SeedEmail`.

## Entity Changes

### Goal.cs (modified)

```csharp
// Add to existing Goal entity
public Guid? AssignedByAdminId { get; set; }
public User? AssignedByAdmin { get; set; }
```

### AppDbContext.cs (modified)

```csharp
// Add to Goal configuration
e.HasIndex(g => g.AssignedByAdminId);
e.HasOne(g => g.AssignedByAdmin)
    .WithMany()
    .HasForeignKey(g => g.AssignedByAdminId)
    .OnDelete(DeleteBehavior.NoAction);
```

## No New Tables Required

The admin feature reuses existing tables (Goals, Categories,
AspNetUsers) with Identity Roles for authorization. No new
tables beyond the standard Identity roles tables (already
created by Identity migrations but not populated until now).
