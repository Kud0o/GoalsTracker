// Handles points history and summary endpoints for authenticated users.

using System.Security.Claims;
using GoalsTracker.Api.Models.Dtos;
using GoalsTracker.Api.Models.Dtos.Points;
using GoalsTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoalsTracker.Api.Controllers;

/// <summary>
/// Provides endpoints for viewing point transaction history and points summary.
/// </summary>
[ApiController]
[Route("api/points")]
[Authorize]
public class PointsController : ControllerBase
{
    private readonly IPointsService _pointsService;

    public PointsController(IPointsService pointsService)
    {
        _pointsService = pointsService;
    }

    /// <summary>
    /// Retrieves a paginated history of point transactions for the authenticated user.
    /// </summary>
    /// <param name="page">The 1-based page number (default 1).</param>
    /// <param name="pageSize">The maximum number of items per page (default 20).</param>
    /// <returns>A paginated list of point history entries.</returns>
    [HttpGet("history")]
    [ProducesResponseType(typeof(PagedResponse<PointHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPointsHistory(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        var result = await _pointsService.GetPointsHistoryAsync(userId, page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a summary of the authenticated user's points, streaks, and achievement level.
    /// </summary>
    /// <returns>The user's points summary.</returns>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(PointsSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPointsSummary()
    {
        var userId = GetUserId();
        var result = await _pointsService.GetPointsSummaryAsync(userId);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}
