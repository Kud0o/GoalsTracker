/**
 * Goal domain models, enums, and filter types.
 * Defines the shape of goal data, categories, tags, and query filters.
 */

/** Timeline type constants matching the backend enum values. */
export const TimelineType = {
  Weekly: 1,
  Monthly: 2,
  Yearly: 3,
} as const;

/** Union type derived from TimelineType values. */
export type TimelineTypeValue = (typeof TimelineType)[keyof typeof TimelineType];

/** Goal status constants matching the backend enum values. */
export const GoalStatus = {
  Active: 1,
  Completed: 2,
  Overdue: 3,
} as const;

/** Union type derived from GoalStatus values. */
export type GoalStatusValue = (typeof GoalStatus)[keyof typeof GoalStatus];

/** Lightweight category information attached to a goal. */
export interface CategoryInfo {
  /** Unique category identifier. */
  id: number;
  /** Human-readable category name. */
  name: string;
  /** Hex color code for UI display (e.g. "#FF5733"). */
  colorHex: string;
  /** Icon identifier or emoji for the category. */
  icon: string;
}

/** Lightweight tag information attached to a goal. */
export interface TagInfo {
  /** Unique tag identifier. */
  id: number;
  /** Tag display name. */
  name: string;
}

/** Represents a single goal with all its metadata. */
export interface Goal {
  /** Unique goal identifier. */
  id: number;
  /** Short title describing the goal. */
  title: string;
  /** Optional longer description of the goal. */
  description: string | null;
  /** Timeline type value (Weekly, Monthly, or Yearly). */
  timelineType: number;
  /** Associated category, if any. */
  category: CategoryInfo | null;
  /** Tags applied to this goal. */
  tags: TagInfo[];
  /** ISO 8601 target completion date. */
  targetDate: string;
  /** Current status value (Active, Completed, or Overdue). */
  status: number;
  /** ISO 8601 date when the goal was completed, if applicable. */
  completedAt: string | null;
  /** Optional image URL for the goal. */
  imageUrl: string | null;
  /** Points awarded upon completion. */
  pointsAwarded: number;
  /** ISO 8601 date when the goal was created. */
  createdAt: string;
  /** Whether this goal was assigned by an admin. */
  isAdminAssigned: boolean;
  /** Name of the admin who assigned this goal, if applicable. */
  assignedByAdminName: string | null;
}

/** Filter parameters for querying goals with pagination. */
export interface GoalFilter {
  /** Filter by timeline type. */
  timelineType?: number;
  /** Filter by goal status. */
  status?: number;
  /** Filter by category identifier. */
  categoryId?: number;
  /** Filter by tag name. */
  tag?: string;
  /** Page number (1-based). */
  page: number;
  /** Number of items per page. */
  pageSize: number;
}
