// Handles admin-level goal operations including batch assignment and user goal queries.

using System.Security.Claims;
using GoalsTracker.Api.Models.Dtos;
using GoalsTracker.Api.Models.Dtos.Admin;
using GoalsTracker.Api.Models.Dtos.Goals;
using GoalsTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoalsTracker.Api.Controllers;

/// <summary>
/// Provides admin-only endpoints for batch goal assignment and viewing user goals.
/// </summary>
[ApiController]
[Route("api/admin/goals")]
[Authorize(Roles = "Admin")]
public class AdminGoalsController : ControllerBase
{
    private readonly IAdminGoalService _adminGoalService;

    /// <summary>
    /// Initializes a new instance of <see cref="AdminGoalsController"/>.
    /// </summary>
    /// <param name="adminGoalService">The admin goal service.</param>
    public AdminGoalsController(IAdminGoalService adminGoalService)
    {
        _adminGoalService = adminGoalService;
    }

    /// <summary>
    /// Assigns a goal to one or more users in a single batch operation.
    /// </summary>
    /// <param name="dto">The goal details and list of target user identifiers.</param>
    /// <returns>A summary of the created goals.</returns>
    [HttpPost("assign")]
    [ProducesResponseType(typeof(AdminBatchResultDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AssignGoals([FromBody] AdminAssignGoalDto dto)
    {
        var adminId = GetUserId();
        var result = await _adminGoalService.AssignGoalsAsync(adminId, dto);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Retrieves a paginated list of goals for a specific user, optionally filtered by source.
    /// </summary>
    /// <param name="userId">The identifier of the user whose goals to retrieve.</param>
    /// <param name="source">Filter: "admin" for admin-assigned, "user" for self-created, null for all.</param>
    /// <param name="page">The 1-based page number (default 1).</param>
    /// <param name="pageSize">The maximum number of items per page (default 20).</param>
    /// <returns>A paginated list of the user's goals.</returns>
    [HttpGet("users/{userId:guid}/goals")]
    [ProducesResponseType(typeof(PagedResponse<GoalResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUserGoals(
        Guid userId,
        [FromQuery] string? source,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _adminGoalService.GetUserGoalsAsync(userId, source, page, pageSize);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}
