// Handles public leaderboard retrieval with optional authenticated user context.

using System.Security.Claims;
using GoalsTracker.Api.Models.Dtos.Leaderboard;
using GoalsTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoalsTracker.Api.Controllers;

/// <summary>
/// Provides the public leaderboard endpoint with optional user-specific ranking.
/// </summary>
[ApiController]
[Route("api/leaderboard")]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;

    public LeaderboardController(ILeaderboardService leaderboardService)
    {
        _leaderboardService = leaderboardService;
    }

    /// <summary>
    /// Retrieves a paginated leaderboard ranked by points for the specified period.
    /// If the caller is authenticated, their rank is included in the response.
    /// </summary>
    /// <param name="period">The ranking period: "weekly", "monthly", or "alltime" (default).</param>
    /// <param name="page">The 1-based page number (default 1).</param>
    /// <param name="pageSize">The maximum number of entries per page (default 20).</param>
    /// <returns>A leaderboard response with ranked entries and the current user's rank.</returns>
    [HttpGet("")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LeaderboardResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLeaderboard(
        [FromQuery] string? period,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        Guid? userId = null;
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdClaim, out var parsedId))
        {
            userId = parsedId;
        }

        var result = await _leaderboardService.GetLeaderboardAsync(userId, period, page, pageSize);
        return Ok(result);
    }
}
