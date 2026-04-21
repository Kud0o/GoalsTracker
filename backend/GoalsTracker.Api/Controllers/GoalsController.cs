// Handles goal CRUD operations and goal completion for authenticated users.

using System.Security.Claims;
using GoalsTracker.Api.Models.Dtos;
using GoalsTracker.Api.Models.Dtos.Goals;
using GoalsTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoalsTracker.Api.Controllers;

/// <summary>
/// Provides endpoints for creating, reading, updating, deleting, and completing goals.
/// </summary>
[ApiController]
[Route("api/goals")]
[Authorize]
public class GoalsController : ControllerBase
{
    private readonly IGoalService _goalService;

    public GoalsController(IGoalService goalService)
    {
        _goalService = goalService;
    }

    /// <summary>
    /// Retrieves a paginated, filtered list of goals for the authenticated user.
    /// </summary>
    /// <param name="timelineType">Optional timeline type filter.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="categoryId">Optional category filter.</param>
    /// <param name="tag">Optional tag name filter.</param>
    /// <param name="page">The 1-based page number (default 1).</param>
    /// <param name="pageSize">The maximum number of items per page (default 20).</param>
    /// <returns>A paginated list of goals.</returns>
    [HttpGet("")]
    [ProducesResponseType(typeof(PagedResponse<GoalResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetGoals(
        [FromQuery] int? timelineType,
        [FromQuery] int? status,
        [FromQuery] int? categoryId,
        [FromQuery] string? tag,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        var result = await _goalService.GetGoalsAsync(userId, timelineType, status, categoryId, tag, page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Creates a new goal for the authenticated user.
    /// </summary>
    /// <param name="dto">The goal creation details.</param>
    /// <returns>The created goal.</returns>
    [HttpPost("")]
    [ProducesResponseType(typeof(GoalResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateGoal([FromBody] CreateGoalDto dto)
    {
        var userId = GetUserId();
        var result = await _goalService.CreateGoalAsync(userId, dto);
        return CreatedAtAction(nameof(GetGoalById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Retrieves a single goal by its identifier, verifying ownership.
    /// </summary>
    /// <param name="id">The goal identifier.</param>
    /// <returns>The requested goal.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(GoalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetGoalById(int id)
    {
        var userId = GetUserId();
        var result = await _goalService.GetGoalByIdAsync(userId, id);
        return Ok(result);
    }

    /// <summary>
    /// Updates an existing goal owned by the authenticated user.
    /// </summary>
    /// <param name="id">The goal identifier.</param>
    /// <param name="dto">The fields to update.</param>
    /// <returns>The updated goal.</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(GoalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateGoal(int id, [FromBody] UpdateGoalDto dto)
    {
        var userId = GetUserId();
        var result = await _goalService.UpdateGoalAsync(userId, id, dto);
        return Ok(result);
    }

    /// <summary>
    /// Deletes a goal owned by the authenticated user.
    /// </summary>
    /// <param name="id">The goal identifier.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteGoal(int id)
    {
        var userId = GetUserId();
        await _goalService.DeleteGoalAsync(userId, id);
        return NoContent();
    }

    /// <summary>
    /// Marks a goal as completed and awards points to the authenticated user.
    /// </summary>
    /// <param name="id">The goal identifier.</param>
    /// <returns>The completion result with points breakdown and achievement info.</returns>
    [HttpPost("{id:int}/complete")]
    [ProducesResponseType(typeof(GoalCompletionResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CompleteGoal(int id)
    {
        var userId = GetUserId();
        var result = await _goalService.CompleteGoalAsync(userId, id);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}
