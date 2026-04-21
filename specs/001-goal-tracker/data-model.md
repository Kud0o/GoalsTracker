# Data Model: Goal Tracker

**Date**: 2026-04-21
**Database**: SQL Server
**ORM**: Entity Framework Core 8

## Entity Relationship Overview

```
User 1──* Goal
User 1──* PointTransaction
User 1──* Tag
User *──1 AchievementLevel
Goal *──1 Category
Goal *──* Tag (via GoalTag join table)
Goal 1──* PointTransaction
```

## Tables

### Users (extends ASP.NET Identity)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| Id | UNIQUEIDENTIFIER | PK, DEFAULT NEWSEQUENTIALID() | ASP.NET Identity default |
| UserName | NVARCHAR(50) | NOT NULL, UNIQUE | Display name |
| Email | NVARCHAR(256) | NOT NULL, UNIQUE | Login credential |
| PasswordHash | NVARCHAR(MAX) | NOT NULL | Managed by Identity |
| Timezone | NVARCHAR(50) | NOT NULL, DEFAULT 'UTC' | IANA timezone ID |
| TotalPoints | INT | NOT NULL, DEFAULT 0 | Denormalized for leaderboard |
| CurrentStreak | INT | NOT NULL, DEFAULT 0 | Consecutive completions |
| BestStreak | INT | NOT NULL, DEFAULT 0 | Historical best |
| AchievementLevelId | INT | FK → AchievementLevels | Current tier |
| IsPublicOnLeaderboard | BIT | NOT NULL, DEFAULT 1 | Opt-in visibility |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | |
| UpdatedAt | DATETIME2 | NOT NULL | |

**Indexes**:
- IX_Users_TotalPoints (DESC) — leaderboard sorting
- IX_Users_AchievementLevelId — tier filtering

### Goals

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| Id | INT | PK, IDENTITY | |
| UserId | UNIQUEIDENTIFIER | FK → Users, NOT NULL | Owner |
| Title | NVARCHAR(200) | NOT NULL | |
| Description | NVARCHAR(2000) | NULL | Optional detail |
| TimelineType | TINYINT | NOT NULL | 1=Weekly, 2=Monthly, 3=Yearly |
| CategoryId | INT | FK → Categories, NULL | Optional category |
| TargetDate | DATE | NOT NULL | Deadline |
| Status | TINYINT | NOT NULL, DEFAULT 1 | 1=Active, 2=Completed, 3=Overdue |
| CompletedAt | DATETIME2 | NULL | When marked complete |
| PointsAwarded | INT | NOT NULL, DEFAULT 0 | Points earned for this goal |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | |
| UpdatedAt | DATETIME2 | NOT NULL | |

**Indexes**:
- IX_Goals_UserId_Status — user's goal list filtered by status
- IX_Goals_UserId_TimelineType — filter by timeline
- IX_Goals_TargetDate_Status — overdue detection job

### Categories

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| Id | INT | PK, IDENTITY | |
| Name | NVARCHAR(50) | NOT NULL, UNIQUE | Career, Health, etc. |
| ColorHex | CHAR(7) | NOT NULL | e.g., #3B82F6 |
| Icon | NVARCHAR(50) | NOT NULL | DaisyUI/Heroicons name |
| SortOrder | INT | NOT NULL, DEFAULT 0 | Display ordering |

**Seed data**: Career, Health, Finance, Education, Personal, Social

### Tags

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| Id | INT | PK, IDENTITY | |
| UserId | UNIQUEIDENTIFIER | FK → Users, NOT NULL | Tag owner |
| Name | NVARCHAR(50) | NOT NULL | |

**Indexes**:
- UX_Tags_UserId_Name (UNIQUE) — no duplicate tag names per user

### GoalTags (join table)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| GoalId | INT | FK → Goals, NOT NULL | |
| TagId | INT | FK → Tags, NOT NULL | |

**PK**: (GoalId, TagId)

### PointTransactions

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| Id | INT | PK, IDENTITY | |
| UserId | UNIQUEIDENTIFIER | FK → Users, NOT NULL | |
| GoalId | INT | FK → Goals, NULL | NULL for streak bonuses |
| Points | INT | NOT NULL | Can be negative for adjustments |
| TransactionType | TINYINT | NOT NULL | 1=Completion, 2=EarlyBonus, 3=Streak |
| Description | NVARCHAR(200) | NOT NULL | Human-readable reason |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Immutable |

**Indexes**:
- IX_PointTransactions_UserId_CreatedAt — user's point history
- IX_PointTransactions_UserId_TransactionType — analytics

### AchievementLevels

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| Id | INT | PK, IDENTITY | |
| Name | NVARCHAR(50) | NOT NULL, UNIQUE | Bronze, Silver, etc. |
| MinPoints | INT | NOT NULL, UNIQUE | Threshold |
| BadgeIcon | NVARCHAR(50) | NOT NULL | Icon identifier |
| ColorHex | CHAR(7) | NOT NULL | Tier color |

**Seed data**:

| Name | MinPoints | Color |
|------|-----------|-------|
| Bronze | 0 | #CD7F32 |
| Silver | 500 | #C0C0C0 |
| Gold | 2000 | #FFD700 |
| Platinum | 5000 | #E5E4E2 |
| Diamond | 10000 | #B9F2FF |

## Views

### vw_Leaderboard

```sql
-- Pre-computed leaderboard view for efficient ranking queries
SELECT
    u.Id AS UserId,
    u.UserName,
    u.TotalPoints,
    u.CurrentStreak,
    al.Name AS AchievementLevel,
    al.BadgeIcon,
    al.ColorHex AS AchievementColor,
    COUNT(g.Id) AS GoalsCompleted,
    DENSE_RANK() OVER (ORDER BY u.TotalPoints DESC) AS Rank
FROM Users u
INNER JOIN AchievementLevels al ON u.AchievementLevelId = al.Id
LEFT JOIN Goals g ON g.UserId = u.Id AND g.Status = 2
WHERE u.IsPublicOnLeaderboard = 1
GROUP BY u.Id, u.UserName, u.TotalPoints, u.CurrentStreak,
         al.Name, al.BadgeIcon, al.ColorHex
```

### vw_UserStrengthAnalysis

```sql
-- Per-user category completion stats for strength analysis
SELECT
    g.UserId,
    c.Id AS CategoryId,
    c.Name AS CategoryName,
    COUNT(*) AS TotalGoals,
    SUM(CASE WHEN g.Status = 2 THEN 1 ELSE 0 END) AS CompletedGoals,
    SUM(CASE WHEN g.Status = 3 THEN 1 ELSE 0 END) AS OverdueGoals,
    CAST(SUM(CASE WHEN g.Status = 2 THEN 1.0 ELSE 0 END)
         / NULLIF(COUNT(*), 0) * 100 AS DECIMAL(5,2)) AS CompletionRate
FROM Goals g
INNER JOIN Categories c ON g.CategoryId = c.Id
GROUP BY g.UserId, c.Id, c.Name
```

## Points Configuration (application-level constants)

| Timeline | Base Points | Early Bonus Multiplier | Streak Thresholds |
|----------|------------|----------------------|-------------------|
| Weekly | 10 | 1.5x (before 50% of timeline) | 3→+5, 7→+15, 14→+30 |
| Monthly | 50 | 1.5x (before 50% of timeline) | 3→+25, 6→+50, 12→+100 |
| Yearly | 200 | 1.5x (before 50% of timeline) | 2→+100, 3→+200 |
