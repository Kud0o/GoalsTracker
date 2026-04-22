# API Contracts: Admin Role & Goal Management

**Date**: 2026-04-21
**Base URL**: `/api/admin`
**Auth**: JWT Bearer + Role = "Admin" (all endpoints)

## Admin Goal Endpoints

### POST /api/admin/goals/assign

Batch-assign a goal to one or more users.

Request:
```json
{
  "title": "string (required, 1-200 chars)",
  "description": "string (optional, max 2000 chars)",
  "timelineType": 1,
  "categoryId": "int (optional)",
  "targetDate": "date (required, must be future)",
  "imageUrl": "string (optional, max 500 chars)",
  "userIds": ["guid", "guid"] 
}
```

Response 201:
```json
{
  "goalsCreated": 3,
  "goals": [
    {
      "goalId": 101,
      "userId": "guid",
      "userName": "JohnDoe",
      "title": "Complete Q2 review"
    }
  ]
}
```

Errors: 400 (validation, empty userIds), 403 (not admin), 404 (user not found)

### GET /api/admin/users/:userId/goals

View a specific user's goals (admin view).

Query params:
- `source` (string, optional): "admin" | "user" | "all" (default)
- `page` (int, default 1)
- `pageSize` (int, default 20)

Response 200:
```json
{
  "items": [
    {
      "id": 1,
      "title": "Run 5K",
      "timelineType": 1,
      "status": 1,
      "targetDate": "2026-05-01",
      "isAdminAssigned": true,
      "assignedByAdminName": "AdminUser",
      "category": { "id": 1, "name": "Health" },
      "pointsAwarded": 0,
      "createdAt": "datetime"
    }
  ],
  "totalCount": 15,
  "page": 1,
  "pageSize": 20
}
```

Note: NO delete or edit endpoints for goals in admin controllers.

---

## Admin User Endpoints

### GET /api/admin/users

List all users with goal statistics.

Query params:
- `search` (string, optional): search by username
- `page` (int, default 1)
- `pageSize` (int, default 20)

Response 200:
```json
{
  "items": [
    {
      "userId": "guid",
      "userName": "JohnDoe",
      "email": "john@example.com",
      "totalGoals": 15,
      "completedGoals": 10,
      "completionRate": 66.7,
      "totalPoints": 450,
      "achievementLevel": "Bronze",
      "adminAssignedGoals": 3,
      "isAdmin": false,
      "memberSince": "datetime"
    }
  ],
  "totalCount": 50,
  "page": 1,
  "pageSize": 20
}
```

---

## Admin Category Endpoints

### GET /api/admin/categories

List all categories (same data as public endpoint but within admin context).

Response 200: Same as existing `/api/categories`

### POST /api/admin/categories

Create a new category.

Request:
```json
{
  "name": "string (required, 1-50 chars)",
  "colorHex": "string (required, #XXXXXX format)",
  "icon": "string (required, 1-50 chars)",
  "sortOrder": "int (optional, default 0)"
}
```

Response 201: Category object
Errors: 400 (validation), 409 (name already exists)

### PUT /api/admin/categories/:id

Edit an existing category.

Request: Same as POST (all optional for partial update)
Response 200: Updated category
Errors: 400, 404, 409

### DELETE /api/admin/categories/:id

Delete a category.

Response 204
Response 409 (if goals use this category):
```json
{
  "error": "CATEGORY_IN_USE",
  "message": "Cannot delete category. 12 goals use this category.",
  "details": { "goalCount": 12 }
}
```

---

## Auth Changes

### JWT Claims

Add role claim to JWT token generation in `AuthService`:
```
claim: "role" = "Admin" or "User"
```

### Existing Endpoints — No Changes

- `GET /api/categories` — remains public, read-only
- `GET/POST/PUT/DELETE /api/goals/*` — unchanged for users
- All existing user endpoints — unchanged
