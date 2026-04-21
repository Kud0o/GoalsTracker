// Handles authentication endpoints: registration, login, token refresh, and password reset.

using GoalsTracker.Api.Models.Dtos.Auth;
using GoalsTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoalsTracker.Api.Controllers;

/// <summary>
/// Provides public endpoints for user authentication and account management.
/// </summary>
[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Registers a new user account and returns a JWT token pair.
    /// </summary>
    /// <param name="dto">The registration details including email, username, and password.</param>
    /// <returns>A <see cref="TokenDto"/> containing access and refresh tokens.</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(TokenDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Authenticates a user with email and password and returns a JWT token pair.
    /// </summary>
    /// <param name="dto">The login credentials.</param>
    /// <returns>A <see cref="TokenDto"/> containing access and refresh tokens.</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(TokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Exchanges an expired access token and valid refresh token for a new token pair.
    /// </summary>
    /// <param name="dto">The expired access token and refresh token.</param>
    /// <returns>A new <see cref="TokenDto"/> containing fresh access and refresh tokens.</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(TokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Initiates the password reset flow by sending a reset token to the specified email.
    /// </summary>
    /// <param name="dto">The email address to send the reset token to.</param>
    /// <returns>A confirmation message regardless of whether the email exists.</returns>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _authService.ForgotPasswordAsync(dto);
        return Ok(new { message = "If the email exists, a reset link has been sent." });
    }

    /// <summary>
    /// Completes the password reset flow using a valid reset token.
    /// </summary>
    /// <param name="dto">The reset token, email, and new password.</param>
    /// <returns>A confirmation that the password was reset successfully.</returns>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        await _authService.ResetPasswordAsync(dto);
        return Ok(new { message = "Password has been reset successfully." });
    }
}
