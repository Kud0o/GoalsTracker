// Handles admin-level user management and listing with aggregated statistics.

using GoalsTracker.Api.Models.Dtos;
using GoalsTracker.Api.Models.Dtos.Admin;
using GoalsTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoalsTracker.Api.Controllers;

/// <summary>
/// Provides admin-only endpoints for viewing and managing users.
/// </summary>
[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly IAdminGoalService _adminGoalService;

    /// <summary>
    /// Initializes a new instance of <see cref="AdminUsersController"/>.
    /// </summary>
    /// <param name="adminGoalService">The admin goal service (provides user listing).</param>
    public AdminUsersController(IAdminGoalService adminGoalService)
    {
        _adminGoalService = adminGoalService;
    }

    /// <summary>
    /// Retrieves a paginated list of all users with their goal statistics.
    /// </summary>
    /// <param name="search">Optional search term to filter by username.</param>
    /// <param name="page">The 1-based page number (default 1).</param>
    /// <param name="pageSize">The maximum number of items per page (default 20).</param>
    /// <returns>A paginated list of users with aggregated goal statistics.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<AdminUserListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _adminGoalService.GetAllUsersAsync(search, page, pageSize);
        return Ok(result);
    }
}
