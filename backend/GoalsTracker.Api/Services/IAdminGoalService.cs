// Defines the contract for admin-level goal operations such as batch assignment and user goal queries.

using GoalsTracker.Api.Models.Dtos;
using GoalsTracker.Api.Models.Dtos.Admin;
using GoalsTracker.Api.Models.Dtos.Goals;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Provides admin-level goal operations including batch assignment and user-scoped queries.
/// </summary>
public interface IAdminGoalService
{
    /// <summary>
    /// Assigns a goal to multiple users in a single batch operation.
    /// </summary>
    /// <param name="adminId">The identifier of the admin performing the assignment.</param>
    /// <param name="dto">The goal details and target user list.</param>
    /// <returns>A summary of the batch assignment including created goal details.</returns>
    Task<AdminBatchResultDto> AssignGoalsAsync(Guid adminId, AdminAssignGoalDto dto);

    /// <summary>
    /// Retrieves a paginated list of goals for a specific user, optionally filtered by source.
    /// </summary>
    /// <param name="userId">The user whose goals to retrieve.</param>
    /// <param name="source">Filter: "admin" for admin-assigned, "user" for self-created, null for all.</param>
    /// <param name="page">The 1-based page number.</param>
    /// <param name="pageSize">The maximum number of items per page.</param>
    /// <returns>A paginated list of goals for the specified user.</returns>
    Task<PagedResponse<GoalResponseDto>> GetUserGoalsAsync(Guid userId, string? source, int page, int pageSize);

    /// <summary>
    /// Retrieves a paginated list of all users with aggregated goal statistics.
    /// </summary>
    /// <param name="search">Optional search term to filter users by username.</param>
    /// <param name="page">The 1-based page number.</param>
    /// <param name="pageSize">The maximum number of items per page.</param>
    /// <returns>A paginated list of users with their goal statistics.</returns>
    Task<PagedResponse<AdminUserListDto>> GetAllUsersAsync(string? search, int page, int pageSize);
}
