// Defines the contract for authentication and account management operations.

using GoalsTracker.Api.Models.Dtos.Auth;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Provides authentication operations including registration, login, token refresh, and password reset.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new user account and returns a JWT token pair.
    /// </summary>
    /// <param name="dto">The registration details including email, username, and password.</param>
    /// <returns>A <see cref="TokenDto"/> containing the access and refresh tokens.</returns>
    Task<TokenDto> RegisterAsync(RegisterDto dto);

    /// <summary>
    /// Authenticates a user with email and password, returning a JWT token pair.
    /// </summary>
    /// <param name="dto">The login credentials.</param>
    /// <returns>A <see cref="TokenDto"/> containing the access and refresh tokens.</returns>
    Task<TokenDto> LoginAsync(LoginDto dto);

    /// <summary>
    /// Exchanges an expired access token and valid refresh token for a new token pair.
    /// </summary>
    /// <param name="dto">The expired access token and refresh token.</param>
    /// <returns>A new <see cref="TokenDto"/> containing fresh access and refresh tokens.</returns>
    Task<TokenDto> RefreshTokenAsync(RefreshTokenDto dto);

    /// <summary>
    /// Initiates the password reset flow by generating a reset token for the given email.
    /// </summary>
    /// <param name="dto">The email address to send the reset token to.</param>
    Task ForgotPasswordAsync(ForgotPasswordDto dto);

    /// <summary>
    /// Completes the password reset flow using a valid reset token.
    /// </summary>
    /// <param name="dto">The reset token, email, and new password.</param>
    Task ResetPasswordAsync(ResetPasswordDto dto);
}
