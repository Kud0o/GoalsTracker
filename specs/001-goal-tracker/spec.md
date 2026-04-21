# Feature Specification: Goal Tracker with Points & Competitive Dashboard

**Feature Branch**: `001-goal-tracker`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "build a Goal Tracker program to keep tracking the goals with the timeline, weekly, monthly, yearly, with points encouragement system, build it with Angular (Tailwind and DaisyUI preferred), SQL Server for database, multiuser application with competitive dashboard for all users showing achievement level and analyzed strength points based on previous achievement and goals"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Goals (Priority: P1)

As a registered user, I want to create goals with specific timelines
(weekly, monthly, yearly) so that I can organize my personal and
professional objectives with clear deadlines.

**Why this priority**: Goal creation is the foundational action of the
entire application. Without it, no other feature has meaning.

**Independent Test**: A user can sign up, create a goal with a
deadline category (weekly/monthly/yearly), view it on their dashboard,
edit it, and mark it as complete. This delivers standalone value as a
personal goal tracker.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the goals page, **When** they click
   "New Goal" and fill in a title, description, deadline category
   (weekly/monthly/yearly), and target date, **Then** the goal appears
   in their goal list under the correct timeline category.
2. **Given** a user with an existing goal, **When** they edit the
   goal's title or deadline, **Then** the changes are saved and
   reflected immediately.
3. **Given** a user with an existing goal, **When** they mark the
   goal as complete before the deadline, **Then** the goal status
   changes to "Completed" with a completion timestamp.
4. **Given** a user viewing their goals, **When** they filter by
   timeline category (weekly/monthly/yearly), **Then** only goals
   matching the selected category are displayed.
5. **Given** a goal whose deadline has passed without completion,
   **When** the system evaluates it, **Then** the goal is marked as
   "Overdue" and the user is notified.

---

### User Story 2 - Points Encouragement System (Priority: P1)

As a user, I want to earn points when I complete goals so that I feel
motivated and can track my progress through a gamified reward system.

**Why this priority**: The points system is the core engagement
mechanic. It transforms a simple checklist into a motivating
experience and feeds the competitive dashboard.

**Independent Test**: A user completes a goal and sees their points
balance increase. They can view their points history and understand
how points were earned. This works even without the competitive
dashboard.

**Acceptance Scenarios**:

1. **Given** a user who completes a weekly goal on time, **When** the
   goal is marked complete, **Then** they earn the base points for a
   weekly goal (e.g., 10 points).
2. **Given** a user who completes a monthly goal on time, **When** the
   goal is marked complete, **Then** they earn the base points for a
   monthly goal (e.g., 50 points).
3. **Given** a user who completes a yearly goal on time, **When** the
   goal is marked complete, **Then** they earn the base points for a
   yearly goal (e.g., 200 points).
4. **Given** a user who completes a goal before the halfway mark of
   its timeline, **When** points are calculated, **Then** a bonus
   multiplier is applied for early completion.
5. **Given** a user who completes goals consecutively without missing
   any deadlines, **When** their streak reaches defined thresholds,
   **Then** they earn streak bonus points.
6. **Given** a user whose goal deadline has passed without completion,
   **When** the system evaluates it, **Then** no points are awarded
   and the streak is reset.

---

### User Story 3 - User Registration and Authentication (Priority: P1)

As a visitor, I want to create an account and securely log in so that
my goals and progress are private and persistent across sessions.

**Why this priority**: Multi-user functionality requires
authentication. All personalized features depend on knowing who the
user is.

**Independent Test**: A visitor can register with email and password,
log in, see their own dashboard, and log out. Another user cannot see
their data.

**Acceptance Scenarios**:

1. **Given** a visitor on the registration page, **When** they provide
   a valid email, username, and password, **Then** an account is
   created and they are logged in.
2. **Given** a registered user on the login page, **When** they enter
   valid credentials, **Then** they are authenticated and redirected
   to their dashboard.
3. **Given** a logged-in user, **When** they click "Log Out", **Then**
   their session ends and they are redirected to the login page.
4. **Given** a user attempting to access another user's goals via URL
   manipulation, **When** the request is processed, **Then** access
   is denied with an appropriate error message.
5. **Given** a user who has forgotten their password, **When** they
   request a password reset, **Then** they receive a reset link via
   email and can set a new password.

---

### User Story 4 - Competitive Dashboard (Priority: P2)

As a user, I want to see a leaderboard showing all users' achievement
levels so that I can compare my progress and feel motivated by
friendly competition.

**Why this priority**: The competitive dashboard differentiates this
from a simple personal tracker. It depends on the points system (P1)
being in place first.

**Independent Test**: A user navigates to the competitive dashboard
and sees a ranked list of users with their achievement levels and
total points. Their own position is highlighted.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they navigate to the
   competitive dashboard, **Then** they see a ranked leaderboard of
   all users sorted by total points.
2. **Given** a user viewing the leaderboard, **When** they look at
   any user entry, **Then** they can see the user's display name,
   achievement level (e.g., Bronze, Silver, Gold, Platinum), total
   points, and goals completed count.
3. **Given** a user on the leaderboard, **When** they look for their
   own entry, **Then** their row is visually highlighted and their
   rank is prominently displayed.
4. **Given** the leaderboard with many users, **When** a user views
   it, **Then** results are paginated and the user can search or
   filter by time period (weekly, monthly, all-time).
5. **Given** a user who just completed a goal, **When** the
   leaderboard refreshes, **Then** the updated points and rank are
   reflected.

---

### User Story 5 - Strength Analysis (Priority: P2)

As a user, I want to see an analysis of my strengths based on my
goal completion history so that I understand which areas I excel in
and where I can improve.

**Why this priority**: This is a value-add analytics feature that
leverages accumulated completion data. It requires a meaningful
history of completed goals to produce useful insights.

**Independent Test**: A user with at least 5 completed goals views
their strength analysis page and sees categorized insights about
their goal completion patterns, top-performing categories, and
suggested areas for improvement.

**Acceptance Scenarios**:

1. **Given** a user with completed goals across multiple categories,
   **When** they view the strength analysis page, **Then** they see
   a breakdown of their completion rate by goal category.
2. **Given** a user's completion history, **When** the analysis runs,
   **Then** it identifies the user's top 3 strength areas (categories
   where they consistently complete goals on time).
3. **Given** a user's completion history, **When** the analysis runs,
   **Then** it identifies improvement areas (categories with low
   completion rates or frequent overdue goals).
4. **Given** a user with at least 4 weeks of history, **When** they
   view the analysis, **Then** they see trend data showing whether
   their performance is improving, stable, or declining.
5. **Given** a new user with fewer than 5 completed goals, **When**
   they visit the strength analysis page, **Then** they see a
   friendly message explaining that more data is needed and suggesting
   they complete more goals.

---

### User Story 6 - Goal Categories and Tags (Priority: P3)

As a user, I want to assign categories and tags to my goals so that
I can organize them by life area (career, health, finance, personal)
and filter or analyze them later.

**Why this priority**: Categories enrich the data model and improve
the strength analysis, but the system works without them using simple
uncategorized goals.

**Independent Test**: A user creates a goal with a category and tags,
then filters their goal list by category. The categorized data feeds
into the strength analysis.

**Acceptance Scenarios**:

1. **Given** a user creating a new goal, **When** they select a
   category from the predefined list (Career, Health, Finance,
   Education, Personal, Social), **Then** the goal is tagged with
   that category.
2. **Given** a user creating a new goal, **When** they add custom
   tags, **Then** the tags are saved and the goal is searchable by
   those tags.
3. **Given** a user viewing their goals list, **When** they filter by
   category, **Then** only goals in the selected category are shown.

---

### Edge Cases

- What happens when a user deletes a completed goal? Points earned
  from that goal are retained (points represent historical
  achievement).
- What happens when two users have the exact same point total on the
  leaderboard? They share the same rank, and the next rank is skipped
  (standard competition ranking).
- What happens when a user changes a goal's timeline category after
  creation? The point value adjusts to the new category; if already
  completed, points are recalculated.
- How does the system handle timezone differences for deadline
  evaluation? Deadlines are evaluated in the user's configured
  timezone.
- What happens if a user has no goals? They see an empty state with
  a friendly prompt to create their first goal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email, username,
  and password.
- **FR-002**: System MUST authenticate users via email/password with
  secure session management.
- **FR-003**: System MUST allow authenticated users to create goals
  with title, description, category, timeline type (weekly, monthly,
  yearly), and target date.
- **FR-004**: System MUST allow users to edit, delete, and mark goals
  as complete.
- **FR-005**: System MUST automatically detect and flag overdue goals
  when their deadline passes without completion.
- **FR-006**: System MUST calculate and award points upon goal
  completion based on timeline type and timeliness.
- **FR-007**: System MUST apply bonus multipliers for early completion
  and consecutive goal streaks.
- **FR-008**: System MUST maintain a real-time leaderboard ranking all
  users by total points.
- **FR-009**: System MUST assign achievement levels (Bronze, Silver,
  Gold, Platinum, Diamond) based on cumulative point thresholds.
- **FR-010**: System MUST provide a strength analysis showing
  completion rates by category, top strengths, and improvement areas.
- **FR-011**: System MUST display trend data for users with sufficient
  history (4+ weeks of activity).
- **FR-012**: System MUST support goal categorization with predefined
  categories and custom tags.
- **FR-013**: System MUST allow filtering goals by timeline type,
  category, status (active, completed, overdue), and tags.
- **FR-014**: System MUST support password reset via email.
- **FR-015**: System MUST ensure users can only access their own goal
  data (except public leaderboard data).
- **FR-016**: System MUST paginate the leaderboard and support
  filtering by time period (weekly, monthly, all-time).

### Key Entities

- **User**: Represents a registered person. Key attributes: display
  name, email, total points, achievement level, timezone, streak
  count.
- **Goal**: A trackable objective belonging to a user. Key attributes:
  title, description, timeline type, target date, status, category,
  completion date, points awarded.
- **Category**: A predefined classification for goals. Key attributes:
  name, icon/color. Predefined set: Career, Health, Finance,
  Education, Personal, Social.
- **Tag**: A user-defined label for flexible goal organization. Key
  attributes: name, associated user.
- **PointTransaction**: A record of points earned or adjusted. Key
  attributes: user, goal reference, points amount, transaction type
  (completion, bonus, streak), timestamp.
- **AchievementLevel**: A tier based on cumulative points. Key
  attributes: name, minimum points threshold, badge/icon.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a goal and see it on their dashboard
  within 3 seconds of submission.
- **SC-002**: 90% of new users successfully create their first goal
  within 5 minutes of registration.
- **SC-003**: Points are awarded and reflected on the user's profile
  within 2 seconds of marking a goal complete.
- **SC-004**: The leaderboard displays accurate rankings updated
  within 5 seconds of any user's point change.
- **SC-005**: The strength analysis page loads and displays insights
  within 3 seconds for users with up to 500 completed goals.
- **SC-006**: System supports at least 1,000 concurrent active users
  without degradation of core features.
- **SC-007**: All user data is isolated; no user can view, modify, or
  infer another user's private goal data.
- **SC-008**: Users who engage with the points system (check
  leaderboard at least weekly) show 30% higher goal completion rates
  than those who do not.
- **SC-009**: 80% of users with 10+ completed goals find the strength
  analysis "useful" or "very useful" in satisfaction surveys.

## Assumptions

- Users have stable internet connectivity (this is a web application,
  no offline mode in v1).
- Email delivery for registration confirmation and password reset is
  handled by a third-party email service.
- The predefined category list (Career, Health, Finance, Education,
  Personal, Social) covers the majority of use cases; custom
  categories are deferred to a future version.
- Achievement level thresholds are configurable by an administrator
  but ship with sensible defaults (e.g., Bronze: 0, Silver: 500,
  Gold: 2000, Platinum: 5000, Diamond: 10000).
- Point values per timeline type are configurable but ship with
  defaults (Weekly: 10, Monthly: 50, Yearly: 200).
- The strength analysis uses straightforward statistical methods
  (completion rates, averages, trends) rather than machine learning.
- User display names on the leaderboard are opt-in; users can choose
  to appear anonymously.
- The application targets modern evergreen browsers (Chrome, Firefox,
  Safari, Edge — last 2 versions).
- Mobile responsiveness is expected but a native mobile app is out of
  scope for v1.
