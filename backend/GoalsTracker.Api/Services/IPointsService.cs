// Defines the contract for points calculation, history, and summary operations.

using GoalsTracker.Api.Models.Dtos;
using GoalsTracker.Api.Models.Dtos.Goals;
using GoalsTracker.Api.Models.Dtos.Points;
using GoalsTracker.Api.Models.Entities;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Provides operations for calculating point awards, retrieving point history, and summarizing user points.
/// </summary>
public interface IPointsService
{
    /// <summary>
    /// Calculates and awards points for a completed goal, including base, early bonus, and streak bonus.
    /// </summary>
    /// <param name="user">The user who completed the goal.</param>
    /// <param name="goal">The goal that was completed.</param>
    /// <returns>A <see cref="GoalCompletionResultDto"/> with the full points breakdown.</returns>
    Task<GoalCompletionResultDto> CalculateAndAwardPointsAsync(User user, Goal goal);

    /// <summary>
    /// Retrieves a paginated history of point transactions for the specified user.
    /// </summary>
    /// <param name="userId">The identifier of the user.</param>
    /// <param name="page">The 1-based page number.</param>
    /// <param name="pageSize">The maximum number of items per page.</param>
    /// <returns>A paginated list of point history entries.</returns>
    Task<PagedResponse<PointHistoryDto>> GetPointsHistoryAsync(Guid userId, int page, int pageSize);

    /// <summary>
    /// Retrieves a summary of the user's points, streaks, and achievement level.
    /// </summary>
    /// <param name="userId">The identifier of the user.</param>
    /// <returns>A <see cref="PointsSummaryDto"/> with the user's points overview.</returns>
    Task<PointsSummaryDto> GetPointsSummaryAsync(Guid userId);
}
