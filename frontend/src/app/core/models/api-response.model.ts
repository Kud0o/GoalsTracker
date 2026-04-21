/**
 * Generic API response wrappers for pagination and error handling.
 * Used across all API service calls.
 */

/** Paginated response wrapper for list endpoints. */
export interface PagedResponse<T> {
  /** Array of items for the current page. */
  items: T[];
  /** Total number of items across all pages. */
  totalCount: number;
  /** Current page number (1-based). */
  page: number;
  /** Number of items per page. */
  pageSize: number;
}

/** Standard error response returned by the API on failure. */
export interface ErrorResponse {
  /** Short error code or type identifier. */
  error: string;
  /** Human-readable error message. */
  message: string;
  /** Optional additional details about the error. */
  details?: any;
}
