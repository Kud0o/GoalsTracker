// Handles user profile retrieval and update operations.

using System.Security.Claims;
using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Controllers;

/// <summary>
/// Provides endpoints for viewing and updating the authenticated user's profile.
/// </summary>
[ApiController]
[Route("api/user")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly AppDbContext _dbContext;

    public UserController(UserManager<User> userManager, AppDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    /// <summary>
    /// Retrieves the authenticated user's profile information.
    /// </summary>
    /// <returns>The user's profile including username, email, timezone, and leaderboard preference.</returns>
    [HttpGet("profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserId();
        var user = await _dbContext.Users
            .Include(u => u.AchievementLevel)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return NotFound();

        return Ok(new
        {
            user.Id,
            user.FirstName,
            user.LastName,
            user.UserName,
            user.Email,
            user.Timezone,
            user.TotalPoints,
            user.CurrentStreak,
            user.BestStreak,
            user.IsPublicOnLeaderboard,
            AchievementLevel = new
            {
                user.AchievementLevel.Name,
                user.AchievementLevel.BadgeIcon,
                user.AchievementLevel.ColorHex
            },
            user.CreatedAt
        });
    }

    /// <summary>
    /// Updates the authenticated user's profile settings.
    /// </summary>
    /// <param name="dto">The profile fields to update.</param>
    /// <returns>A confirmation that the profile was updated.</returns>
    [HttpPut("profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetUserId();
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user is null)
            return NotFound();

        if (dto.FirstName is not null)
            user.FirstName = dto.FirstName;

        if (dto.LastName is not null)
            user.LastName = dto.LastName;

        if (dto.UserName is not null)
        {
            var setResult = await _userManager.SetUserNameAsync(user, dto.UserName);
            if (!setResult.Succeeded)
                return BadRequest(new { error = "ValidationError", message = string.Join("; ", setResult.Errors.Select(e => e.Description)) });
        }

        if (dto.Timezone is not null)
            user.Timezone = dto.Timezone;

        if (dto.IsPublicOnLeaderboard.HasValue)
            user.IsPublicOnLeaderboard = dto.IsPublicOnLeaderboard.Value;

        user.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Profile updated successfully." });
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}

/// <summary>
/// Contains the fields that can be updated on a user's profile. All fields are optional.
/// </summary>
public class UpdateProfileDto
{
    /// <summary>The updated first name.</summary>
    public string? FirstName { get; set; }

    /// <summary>The updated last name.</summary>
    public string? LastName { get; set; }

    /// <summary>The updated display name.</summary>
    public string? UserName { get; set; }

    /// <summary>The updated IANA timezone identifier.</summary>
    public string? Timezone { get; set; }

    /// <summary>Whether the user should appear on the public leaderboard.</summary>
    public bool? IsPublicOnLeaderboard { get; set; }
}
