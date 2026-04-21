// Defines the contract for leaderboard retrieval operations.

using GoalsTracker.Api.Models.Dtos.Leaderboard;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Provides operations for retrieving the public leaderboard with ranking data.
/// </summary>
public interface ILeaderboardService
{
    /// <summary>
    /// Retrieves a paginated leaderboard ranked by points for the specified period.
    /// </summary>
    /// <param name="currentUserId">The identifier of the requesting user, used to flag their entry.</param>
    /// <param name="period">The ranking period: "weekly", "monthly", or "alltime" (default).</param>
    /// <param name="page">The 1-based page number.</param>
    /// <param name="pageSize">The maximum number of entries per page.</param>
    /// <returns>A <see cref="LeaderboardResponseDto"/> with ranked entries and the current user's rank.</returns>
    Task<LeaderboardResponseDto> GetLeaderboardAsync(Guid? currentUserId, string? period, int page, int pageSize);
}
