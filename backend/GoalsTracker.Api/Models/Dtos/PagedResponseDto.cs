// Generic paged response wrapper for paginated API endpoints.

namespace GoalsTracker.Api.Models.Dtos;

/// <summary>
/// Wraps a paginated list of items with metadata about the current page and total count.
/// </summary>
/// <typeparam name="T">The type of items in the paged result.</typeparam>
public class PagedResponse<T>
{
    /// <summary>The collection of items for the current page.</summary>
    public List<T> Items { get; set; } = [];

    /// <summary>The total number of items across all pages.</summary>
    public int TotalCount { get; set; }

    /// <summary>The current page number (1-based).</summary>
    public int Page { get; set; }

    /// <summary>The maximum number of items per page.</summary>
    public int PageSize { get; set; }
}
