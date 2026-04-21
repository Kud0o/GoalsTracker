// Paged leaderboard response with the current user's rank.

namespace GoalsTracker.Api.Models.Dtos.Leaderboard;

/// <summary>
/// A paginated leaderboard response that includes the current user's rank regardless of their page position.
/// </summary>
public class LeaderboardResponseDto
{
    /// <summary>The leaderboard entries for the current page.</summary>
    public List<LeaderboardEntryDto> Items { get; set; } = [];

    /// <summary>The total number of users on the leaderboard.</summary>
    public int TotalCount { get; set; }

    /// <summary>The current page number (1-based).</summary>
    public int Page { get; set; }

    /// <summary>The maximum number of entries per page.</summary>
    public int PageSize { get; set; }

    /// <summary>The rank of the currently authenticated user, or null if not ranked.</summary>
    public int? CurrentUserRank { get; set; }
}
