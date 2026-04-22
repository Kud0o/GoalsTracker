# Feature Specification: Admin Role & Goal Management

**Feature Branch**: `002-admin-role`
**Created**: 2026-04-21
**Status**: Draft
**Input**: User description: "add admin role that can add or remove goals to the normal users, admin can't remove goals that added by user, admin can edit categories"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Assigns Goals to Users (Priority: P1)

As an admin, I want to create a goal and assign it to one or more
users in a single action, so that I can efficiently set
organizational objectives or challenges without repeating the
form for each user. Each user receives their own independent copy
of the goal.

**Why this priority**: This is the core admin capability that
differentiates the admin role from a regular user.

**Independent Test**: An admin logs in, navigates to the admin
panel, selects 3 users from a multi-select list, fills in one
goal form, and submits. Each of the 3 users logs in and sees
their own copy of the goal in their goal list with a visual
indicator showing it was assigned by an admin. Each user's goal
is independent — completing or deleting it does not affect the
other users' copies.

**Acceptance Scenarios**:

1. **Given** a logged-in admin on the admin panel, **When** they
   select one or more users and fill in goal details (title,
   description, timeline, category, target date), **Then** an
   independent goal is created for each selected user and appears
   in each user's goal list separately.
2. **Given** a user with admin-assigned goals, **When** they view
   their goal list, **Then** admin-assigned goals display a
   distinct badge or label (e.g., "Assigned by Admin") to
   differentiate them from self-created goals.
3. **Given** an admin viewing the admin panel, **When** they look
   at a user's goals, **Then** they can see both self-created and
   admin-assigned goals with clear distinction.
4. **Given** an admin who selected 5 users and submitted a goal,
   **When** the operation completes, **Then** 5 independent goal
   records are created (one per user), each trackable and
   completable separately.
5. **Given** a user who received an admin-assigned goal, **When**
   they complete or delete it, **Then** the same goal assigned to
   other users is NOT affected.
6. **Given** a regular user, **When** they attempt to access admin
   endpoints or the admin panel, **Then** access is denied with an
   appropriate error message.

---

### User Story 2 - Admin Goal Deletion Restrictions (Priority: P1)

As an admin, I must NOT be able to delete any goal that a user
has received — whether the goal was user-created or
admin-assigned. Once a goal is assigned and visible to the user,
it becomes the user's property. Only the user can delete it.

**Why this priority**: This permission boundary is a core business
rule that protects user data and ensures trust. Users must feel
confident that goals they see in their list won't disappear
without their consent.

**Independent Test**: An admin views a user's goals. No delete
button is available for any goal — neither user-created nor
admin-assigned. The user logs in and can delete any of their own
goals (both self-created and admin-assigned) as they choose.

**Acceptance Scenarios**:

1. **Given** an admin viewing a user's goals, **When** a goal was
   assigned by an admin, **Then** the admin does NOT see a
   "Remove" or "Delete" action for that goal.
2. **Given** an admin viewing a user's goals, **When** a goal was
   created by the user themselves, **Then** the admin does NOT see
   a "Remove" or "Delete" action for that goal.
3. **Given** a regular user viewing their own goals, **When** they
   see an admin-assigned goal, **Then** they CAN delete it if they
   choose (it is now their goal).
4. **Given** a regular user, **When** they delete a completed goal
   (admin-assigned or self-created), **Then** points previously
   earned are retained.

---

### User Story 3 - Admin Manages Categories (Priority: P1)

As an admin, I want to create, edit, and delete goal categories
so that the category list can evolve as organizational needs
change.

**Why this priority**: Categories are shared across all users.
Only admins should be able to modify the global category list to
maintain consistency.

**Independent Test**: An admin navigates to category management,
edits an existing category's name and color, creates a new
category, and deletes an unused category. Regular users see the
updated categories when creating goals.

**Acceptance Scenarios**:

1. **Given** an admin on the category management page, **When**
   they edit a category's name, color, or icon, **Then** the
   changes are saved and reflected for all users immediately.
2. **Given** an admin on the category management page, **When**
   they create a new category with a name, color, and icon,
   **Then** the category appears in the global list available to
   all users.
3. **Given** an admin attempting to delete a category, **When**
   goals exist that use this category, **Then** the system warns
   the admin and either prevents deletion or reassigns goals to
   "Uncategorized".
4. **Given** a regular user, **When** they attempt to create,
   edit, or delete a category, **Then** they are denied access.

---

### User Story 4 - Admin User Management View (Priority: P2)

As an admin, I want to view a list of all registered users with
their goal statistics so that I can identify who needs support or
additional challenges.

**Why this priority**: This provides context for the admin to make
informed decisions about assigning goals. It depends on the admin
role (P1) being in place.

**Independent Test**: An admin navigates to the users list, sees
all registered users with their total goals, completion rate,
points, and achievement level. They can click a user to view their
goals and assign new ones.

**Acceptance Scenarios**:

1. **Given** an admin on the users management page, **When** the
   page loads, **Then** they see a paginated list of all users with
   display name, total goals, completion rate, total points, and
   achievement level.
2. **Given** an admin viewing the users list, **When** they click
   on a user, **Then** they see that user's full goal list with
   the ability to assign new goals.
3. **Given** an admin viewing a user's goals, **When** they filter
   by "Admin Assigned" or "User Created", **Then** only matching
   goals are shown.

---

### Edge Cases

- What if an admin assigns a goal to themselves? The goal is
  treated as admin-assigned (removable by any admin, tagged with
  "Assigned by Admin").
- What if the only admin account is deleted? The system MUST
  always have at least one admin account; the last admin cannot
  be demoted or deleted.
- Can an admin edit or delete any goal visible to a user? No.
  Once a goal is assigned and visible, the admin can only view it.
  Only the owning user can delete or manage it.
- Can a user complete an admin-assigned goal? Yes. Users complete
  admin-assigned goals the same way as their own, earning the same
  points.
- What happens to admin-assigned goals if the admin account is
  deleted? The goals remain with the user, tagged as "Admin
  Assigned" (the original admin reference becomes historical).
- What if an admin assigns a goal to 10 users and one user
  completes it? Only that user's copy is marked complete and
  earns points. The other 9 copies remain independent and
  unaffected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support two roles: "User" (default) and
  "Admin".
- **FR-002**: Admins MUST be able to create a goal and assign it
  to one or more users in a single action. Each selected user
  receives an independent copy of the goal.
- **FR-003**: Admin-assigned goals MUST be visually distinguishable
  from user-created goals (badge, label, or icon).
- **FR-004**: Admins MUST NOT be able to delete ANY goal once it
  has been assigned to and is visible to a user (neither
  admin-assigned nor user-created goals).
- **FR-005**: Users MUST be able to delete any goal in their own
  list, including admin-assigned goals, at their discretion.
- **FR-006**: When a user deletes a completed goal (regardless of
  origin), points previously earned MUST be retained.
- **FR-007**: Admins MUST be able to create, edit, and delete
  goal categories.
- **FR-008**: Deleting a category that is in use by existing goals
  MUST either be prevented or handled by reassigning those goals
  to no category.
- **FR-009**: Regular users MUST be denied access to all admin
  endpoints and admin UI sections.
- **FR-010**: Admins MUST be able to view a list of all users with
  goal statistics (total goals, completion rate, points, level).
- **FR-011**: Admins MUST be able to view any user's goals and
  filter by assignment source (admin-assigned vs user-created).
- **FR-012**: The system MUST prevent the last admin from being
  demoted or deleted.
- **FR-013**: Admin-assigned goals MUST track which admin created
  them (for audit purposes).

### Key Entities

- **Role**: A named permission level (User, Admin) assigned to
  user accounts. Determines access to admin features.
- **Goal (extended)**: Adds `AssignedByAdminId` (nullable) to
  track whether a goal was admin-assigned and by which admin.
  When null, the goal is user-created.
- **Category (extended)**: Now supports full CRUD by admins, not
  just read-only seeded data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can assign a goal to any user within 30
  seconds of navigating to the admin panel.
- **SC-002**: 100% of admin-assigned goals display a visible
  "Assigned" indicator in the user's goal list.
- **SC-003**: 0% of user-created goals can be deleted by an admin
  (enforced at both UI and server level).
- **SC-004**: Category changes made by an admin are reflected for
  all users within 2 seconds.
- **SC-005**: Regular users attempting to access admin features
  receive a clear denial message within 1 second, with no data
  leakage.

## Clarifications

### Session 2026-04-21

- Q: What defines "started" for blocking admin deletion of assigned goals? → A: Admin can NEVER delete an admin-assigned goal once the user has seen/received it. Once assigned, only the user can delete the goal.
- Q: Can admins assign a goal to multiple users at once? → A: Yes. Admins fill out one goal form, select one or more users, and submit once. Each user gets an independent copy of the goal. Copies are fully independent — completing or deleting one does not affect others.

## Assumptions

- The first admin account is created by promoting an existing user
  via a seed script or direct database operation; there is no
  self-service admin registration in v1.
- Admin users retain all regular user capabilities (creating their
  own goals, earning points, appearing on the leaderboard).
- Admin-assigned goals follow the same points and timeline rules
  as user-created goals.
- There is no approval workflow — admin-assigned goals appear
  immediately in the user's goal list.
- The admin panel is a separate section within the existing
  application, not a standalone admin portal.
