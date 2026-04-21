// Defines the contract for goal CRUD and completion operations.

using GoalsTracker.Api.Models.Dtos;
using GoalsTracker.Api.Models.Dtos.Goals;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Provides operations for creating, reading, updating, deleting, and completing goals.
/// </summary>
public interface IGoalService
{
    /// <summary>
    /// Creates a new goal for the specified user.
    /// </summary>
    /// <param name="userId">The identifier of the user creating the goal.</param>
    /// <param name="dto">The goal creation details.</param>
    /// <returns>The created goal as a <see cref="GoalResponseDto"/>.</returns>
    Task<GoalResponseDto> CreateGoalAsync(Guid userId, CreateGoalDto dto);

    /// <summary>
    /// Updates an existing goal owned by the specified user.
    /// </summary>
    /// <param name="userId">The identifier of the user who owns the goal.</param>
    /// <param name="goalId">The identifier of the goal to update.</param>
    /// <param name="dto">The fields to update.</param>
    /// <returns>The updated goal as a <see cref="GoalResponseDto"/>.</returns>
    Task<GoalResponseDto> UpdateGoalAsync(Guid userId, int goalId, UpdateGoalDto dto);

    /// <summary>
    /// Deletes a goal owned by the specified user.
    /// </summary>
    /// <param name="userId">The identifier of the user who owns the goal.</param>
    /// <param name="goalId">The identifier of the goal to delete.</param>
    Task DeleteGoalAsync(Guid userId, int goalId);

    /// <summary>
    /// Marks a goal as completed and awards points to the user.
    /// </summary>
    /// <param name="userId">The identifier of the user who owns the goal.</param>
    /// <param name="goalId">The identifier of the goal to complete.</param>
    /// <returns>A <see cref="GoalCompletionResultDto"/> with points breakdown and achievement info.</returns>
    Task<GoalCompletionResultDto> CompleteGoalAsync(Guid userId, int goalId);

    /// <summary>
    /// Retrieves a paginated, filtered list of goals for the specified user.
    /// </summary>
    /// <param name="userId">The identifier of the user whose goals to retrieve.</param>
    /// <param name="timelineType">Optional timeline type filter.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="categoryId">Optional category filter.</param>
    /// <param name="tag">Optional tag name filter.</param>
    /// <param name="page">The 1-based page number.</param>
    /// <param name="pageSize">The maximum number of items per page.</param>
    /// <returns>A paginated list of goals.</returns>
    Task<PagedResponse<GoalResponseDto>> GetGoalsAsync(Guid userId, int? timelineType, int? status, int? categoryId, string? tag, int page, int pageSize);

    /// <summary>
    /// Retrieves a single goal by its identifier, verifying ownership.
    /// </summary>
    /// <param name="userId">The identifier of the user who owns the goal.</param>
    /// <param name="goalId">The identifier of the goal to retrieve.</param>
    /// <returns>The goal as a <see cref="GoalResponseDto"/>.</returns>
    Task<GoalResponseDto> GetGoalByIdAsync(Guid userId, int goalId);
}
