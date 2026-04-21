/**
 * User domain models for authentication and profile management.
 * Defines the shape of user data returned from the API and token responses.
 */

/** Represents a registered user in the GoalsTracker system. */
export interface User {
  /** Unique identifier for the user. */
  userId: string;
  /** Display name chosen by the user. */
  userName: string;
  /** Email address used for authentication. */
  email: string;
  /** User's preferred timezone (IANA format). */
  timezone: string;
  /** Cumulative points earned from completing goals. */
  totalPoints: number;
  /** Current achievement level name based on total points. */
  achievementLevel: string;
  /** Whether the user opts in to appear on the public leaderboard. */
  isPublicOnLeaderboard: boolean;
  /** ISO 8601 date string of when the user registered. */
  memberSince: string;
}

/** Response returned after successful authentication or token refresh. */
export interface TokenResponse {
  /** Unique identifier for the authenticated user. */
  userId: string;
  /** Display name of the authenticated user. */
  userName: string;
  /** JWT access token for API authorization. */
  token: string;
  /** Opaque refresh token for obtaining new access tokens. */
  refreshToken: string;
  /** ISO 8601 date string indicating when the access token expires. */
  expiresAt: string;
}
