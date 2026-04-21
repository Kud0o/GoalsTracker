// Handles analytics endpoints for authenticated users' strength analysis.

using System.Security.Claims;
using GoalsTracker.Api.Models.Dtos.Analytics;
using GoalsTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoalsTracker.Api.Controllers;

/// <summary>
/// Provides endpoints for analyzing user goal completion patterns and identifying strengths.
/// </summary>
[ApiController]
[Route("api/analytics")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    /// <summary>
    /// Analyzes the authenticated user's goal completion data to identify strengths,
    /// improvement areas, and trends.
    /// </summary>
    /// <returns>A strength analysis with category breakdowns and trends.</returns>
    [HttpGet("strengths")]
    [ProducesResponseType(typeof(StrengthAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStrengthAnalysis()
    {
        var userId = GetUserId();
        var result = await _analyticsService.GetStrengthAnalysisAsync(userId);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}
