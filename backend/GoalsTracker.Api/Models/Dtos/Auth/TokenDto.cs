// Response payload containing JWT authentication tokens after successful login or refresh.

namespace GoalsTracker.Api.Models.Dtos.Auth;

/// <summary>
/// Contains the JWT token pair and associated user information returned after authentication.
/// </summary>
public class TokenDto
{
    /// <summary>The unique identifier of the authenticated user.</summary>
    public Guid UserId { get; set; }

    /// <summary>The display name of the authenticated user.</summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>The JWT access token used for authenticating API requests.</summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>The refresh token used to obtain a new access token when the current one expires.</summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>The UTC date and time when the access token expires.</summary>
    public DateTime ExpiresAt { get; set; }
}
