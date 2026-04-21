// Request payload for refreshing an expired JWT access token.

using System.ComponentModel.DataAnnotations;

namespace GoalsTracker.Api.Models.Dtos.Auth;

/// <summary>
/// Contains the token pair required to obtain a new access token.
/// </summary>
public class RefreshTokenDto
{
    /// <summary>The expired or soon-to-expire JWT access token.</summary>
    [Required]
    public string Token { get; set; } = string.Empty;

    /// <summary>The refresh token previously issued alongside the access token.</summary>
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
