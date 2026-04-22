/**
 * Admin domain models for user management and goal assignment.
 * Defines the shape of admin-specific API responses and request payloads.
 */

/** Represents a user as viewed from the admin panel with aggregated statistics. */
export interface AdminUser {
  /** Unique identifier for the user. */
  userId: string;
  /** Display name of the user. */
  userName: string;
  /** User's first name. */
  firstName: string;
  /** User's last name. */
  lastName: string;
  /** Email address of the user. */
  email: string;
  /** Total number of goals the user has. */
  totalGoals: number;
  /** Number of completed goals. */
  completedGoals: number;
  /** Percentage of goals completed (0-100). */
  completionRate: number;
  /** Total points earned by the user. */
  totalPoints: number;
  /** Current achievement level name. */
  achievementLevel: string;
  /** Number of goals assigned to this user by an admin. */
  adminAssignedGoals: number;
  /** Whether the user has admin privileges. */
  isAdmin: boolean;
  /** ISO 8601 date string of when the user registered. */
  memberSince: string;
}

/** Request payload for assigning a goal to one or more users. */
export interface AdminAssignGoal {
  /** Title of the goal to assign. */
  title: string;
  /** Optional description of the goal. */
  description?: string;
  /** Timeline type value (Weekly=1, Monthly=2, Yearly=3). */
  timelineType: number;
  /** Optional category identifier. */
  categoryId?: number;
  /** ISO 8601 target completion date. */
  targetDate: string;
  /** Optional image URL for the goal. */
  imageUrl?: string;
  /** List of user IDs to assign the goal to. */
  userIds: string[];
}

/** Result returned after batch-assigning goals to users. */
export interface AdminBatchResult {
  /** Number of goals successfully created. */
  goalsCreated: number;
  /** Details of each created goal. */
  goals: { goalId: number; userId: string; userName: string; title: string }[];
}

/** Admin category model for full CRUD operations. */
export interface AdminCategory {
  /** Unique category identifier. */
  id: number;
  /** Human-readable category name. */
  name: string;
  /** Hex color code for UI display (e.g. "#FF5733"). */
  colorHex: string;
  /** Icon identifier or emoji for the category. */
  icon: string;
  /** Display sort order. */
  sortOrder: number;
  /** Number of goals using this category. */
  goalCount?: number;
}
