// Request payload for completing a password reset with a valid token.

using System.ComponentModel.DataAnnotations;

namespace GoalsTracker.Api.Models.Dtos.Auth;

/// <summary>
/// Contains the fields required to reset a user's password using a previously issued token.
/// </summary>
public class ResetPasswordDto
{
    /// <summary>The email address associated with the account.</summary>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>The password reset token received via email.</summary>
    [Required]
    public string Token { get; set; } = string.Empty;

    /// <summary>The new password to set for the account (minimum 8 characters).</summary>
    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
