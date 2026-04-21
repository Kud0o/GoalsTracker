/**
 * Points and achievement domain models.
 * Defines point transactions, summaries, achievement levels, and goal completion results.
 */

import { Goal } from './goal.model';

/** A single point transaction record. */
export interface PointTransaction {
  /** Unique transaction identifier. */
  id: number;
  /** Associated goal identifier, if applicable. */
  goalId: number | null;
  /** Title of the associated goal, if applicable. */
  goalTitle: string | null;
  /** Number of points in this transaction (positive or negative). */
  points: number;
  /** Type of transaction (e.g. earned, bonus, penalty). */
  transactionType: number;
  /** Human-readable description of the transaction. */
  description: string;
  /** ISO 8601 date when the transaction was created. */
  createdAt: string;
}

/** Information about an achievement level and progression to the next. */
export interface AchievementLevelInfo {
  /** Display name of the current achievement level. */
  name: string;
  /** Minimum points required to reach this level. */
  minPoints: number;
  /** Next level details, or null if at the highest level. */
  nextLevel: {
    /** Name of the next achievement level. */
    name: string;
    /** Minimum points required for the next level. */
    minPoints: number;
    /** Points still needed to reach the next level. */
    pointsNeeded: number;
  } | null;
}

/** Aggregated points summary for the current user. */
export interface PointsSummary {
  /** Total lifetime points. */
  totalPoints: number;
  /** Current consecutive completion streak. */
  currentStreak: number;
  /** Best consecutive completion streak ever achieved. */
  bestStreak: number;
  /** Current achievement level information. */
  achievementLevel: AchievementLevelInfo;
  /** Points earned this week. */
  thisWeek: number;
  /** Points earned this month. */
  thisMonth: number;
}

/** Result returned after completing a goal, including point breakdown. */
export interface GoalCompletionResult {
  /** The completed goal. */
  goal: Goal;
  /** Breakdown of points earned for this completion. */
  pointsEarned: {
    /** Base points for completing the goal. */
    base: number;
    /** Bonus points for completing early. */
    earlyBonus: number;
    /** Bonus points from an active streak. */
    streakBonus: number;
    /** Total points earned. */
    total: number;
  };
  /** Updated total points after this completion. */
  newTotalPoints: number;
  /** Updated streak count after this completion. */
  newStreak: number;
  /** Achievement level status after this completion. */
  achievementLevel: {
    /** Current achievement level name. */
    name: string;
    /** Whether the achievement level changed as a result. */
    changed: boolean;
  };
}
