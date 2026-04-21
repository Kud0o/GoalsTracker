# API Contracts: Goal Tracker

**Date**: 2026-04-21
**Base URL**: `/api`
**Auth**: JWT Bearer token (unless marked Public)

## Authentication Endpoints

### POST /api/auth/register

**Public**

Request:
```json
{
  "email": "string (required, valid email)",
  "userName": "string (required, 3-50 chars)",
  "password": "string (required, min 8 chars, 1 upper, 1 digit, 1 special)",
  "timezone": "string (optional, IANA timezone, default UTC)"
}
```

Response 201:
```json
{
  "userId": "guid",
  "userName": "string",
  "token": "string (JWT)",
  "refreshToken": "string",
  "expiresAt": "datetime"
}
```

Errors: 400 (validation), 409 (email/username taken)

### POST /api/auth/login

**Public**

Request:
```json
{
  "email": "string",
  "password": "string"
}
```

Response 200: Same as register response
Errors: 401 (invalid credentials)

### POST /api/auth/refresh

**Public**

Request:
```json
{
  "token": "string (expired JWT)",
  "refreshToken": "string"
}
```

Response 200: New token pair
Errors: 401 (invalid/expired refresh token)

### POST /api/auth/forgot-password

**Public**

Request: `{ "email": "string" }`
Response 200: `{ "message": "If the email exists, a reset link was sent." }`

### POST /api/auth/reset-password

**Public**

Request:
```json
{
  "email": "string",
  "token": "string (from email link)",
  "newPassword": "string"
}
```

Response 200: `{ "message": "Password reset successful." }`
Errors: 400 (invalid token, weak password)

---

## Goals Endpoints

### GET /api/goals

Query params:
- `timelineType` (int, optional): 1=Weekly, 2=Monthly, 3=Yearly
- `status` (int, optional): 1=Active, 2=Completed, 3=Overdue
- `categoryId` (int, optional)
- `tag` (string, optional): filter by tag name
- `page` (int, default 1)
- `pageSize` (int, default 20, max 50)

Response 200:
```json
{
  "items": [
    {
      "id": 1,
      "title": "string",
      "description": "string|null",
      "timelineType": 1,
      "category": { "id": 1, "name": "Health", "colorHex": "#10B981", "icon": "heart" },
      "tags": [{ "id": 1, "name": "fitness" }],
      "targetDate": "2026-05-01",
      "status": 1,
      "completedAt": "datetime|null",
      "pointsAwarded": 0,
      "createdAt": "datetime"
    }
  ],
  "totalCount": 42,
  "page": 1,
  "pageSize": 20
}
```

### POST /api/goals

Request:
```json
{
  "title": "string (required, 1-200 chars)",
  "description": "string (optional, max 2000 chars)",
  "timelineType": 1,
  "categoryId": "int (optional)",
  "targetDate": "date (required, must be in the future)",
  "tagNames": ["string"] 
}
```

Response 201: Goal object (same shape as GET list item)
Errors: 400 (validation)

### GET /api/goals/:id

Response 200: Goal object
Errors: 404

### PUT /api/goals/:id

Request: Same as POST (all fields optional for partial update)
Response 200: Updated goal object
Errors: 400, 403 (not owner), 404

### DELETE /api/goals/:id

Response 204
Errors: 403 (not owner), 404

### POST /api/goals/:id/complete

Request: (empty body)

Response 200:
```json
{
  "goal": { "...updated goal with status=2..." },
  "pointsEarned": {
    "base": 10,
    "earlyBonus": 5,
    "streakBonus": 0,
    "total": 15
  },
  "newTotalPoints": 215,
  "newStreak": 4,
  "achievementLevel": { "name": "Bronze", "changed": false }
}
```

Errors: 400 (already completed), 403, 404

---

## Points Endpoints

### GET /api/points/history

Query params:
- `page` (int, default 1)
- `pageSize` (int, default 20)

Response 200:
```json
{
  "items": [
    {
      "id": 1,
      "goalId": 5,
      "goalTitle": "Run 5K",
      "points": 15,
      "transactionType": 1,
      "description": "Completed weekly goal: Run 5K",
      "createdAt": "datetime"
    }
  ],
  "totalCount": 100,
  "totalPoints": 1250
}
```

### GET /api/points/summary

Response 200:
```json
{
  "totalPoints": 1250,
  "currentStreak": 4,
  "bestStreak": 7,
  "achievementLevel": {
    "name": "Silver",
    "minPoints": 500,
    "nextLevel": { "name": "Gold", "minPoints": 2000, "pointsNeeded": 750 }
  },
  "thisWeek": 45,
  "thisMonth": 180
}
```

---

## Leaderboard Endpoints

### GET /api/leaderboard

**Public** (but enhanced for authenticated users)

Query params:
- `period` (string, optional): "weekly", "monthly", "alltime" (default)
- `page` (int, default 1)
- `pageSize` (int, default 20)

Response 200:
```json
{
  "items": [
    {
      "rank": 1,
      "userName": "string",
      "totalPoints": 5000,
      "goalsCompleted": 120,
      "currentStreak": 14,
      "achievementLevel": "Platinum",
      "badgeIcon": "star",
      "achievementColor": "#E5E4E2",
      "isCurrentUser": false
    }
  ],
  "totalCount": 250,
  "currentUserRank": 12
}
```

---

## Analytics Endpoints

### GET /api/analytics/strengths

Response 200:
```json
{
  "hasEnoughData": true,
  "categoryBreakdown": [
    {
      "categoryId": 1,
      "categoryName": "Health",
      "totalGoals": 15,
      "completedGoals": 12,
      "overdueGoals": 2,
      "completionRate": 80.0,
      "isStrength": true
    }
  ],
  "topStrengths": ["Health", "Education", "Personal"],
  "improvementAreas": ["Finance"],
  "trend": {
    "direction": "improving",
    "weeklyCompletionRates": [
      { "weekStart": "2026-04-07", "rate": 75.0 },
      { "weekStart": "2026-04-14", "rate": 82.0 }
    ]
  }
}
```

If fewer than 5 completed goals:
```json
{
  "hasEnoughData": false,
  "message": "Complete at least 5 goals to see your strength analysis.",
  "goalsCompleted": 3,
  "goalsNeeded": 2
}
```

---

## Shared Endpoints

### GET /api/categories

**Public**

Response 200:
```json
[
  { "id": 1, "name": "Career", "colorHex": "#3B82F6", "icon": "briefcase", "sortOrder": 1 },
  { "id": 2, "name": "Health", "colorHex": "#10B981", "icon": "heart", "sortOrder": 2 }
]
```

### GET /api/user/profile

Response 200:
```json
{
  "userId": "guid",
  "userName": "string",
  "email": "string",
  "timezone": "string",
  "isPublicOnLeaderboard": true,
  "totalPoints": 1250,
  "achievementLevel": "Silver",
  "memberSince": "datetime"
}
```

### PUT /api/user/profile

Request:
```json
{
  "userName": "string (optional)",
  "timezone": "string (optional)",
  "isPublicOnLeaderboard": "bool (optional)"
}
```

Response 200: Updated profile
Errors: 400, 409 (username taken)

---

## Common Response Patterns

**Pagination wrapper**:
```json
{
  "items": [],
  "totalCount": 0,
  "page": 1,
  "pageSize": 20
}
```

**Error response**:
```json
{
  "error": "string (machine-readable code)",
  "message": "string (user-friendly message)",
  "details": {} 
}
```

**HTTP Status Codes Used**:
- 200: Success
- 201: Created
- 204: No Content (delete)
- 400: Validation error
- 401: Not authenticated
- 403: Not authorized (wrong user)
- 404: Not found
- 409: Conflict (duplicate)
- 500: Server error
