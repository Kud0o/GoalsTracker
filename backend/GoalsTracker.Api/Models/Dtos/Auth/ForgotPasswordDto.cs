// Request payload for initiating a password reset flow.

using System.ComponentModel.DataAnnotations;

namespace GoalsTracker.Api.Models.Dtos.Auth;

/// <summary>
/// Contains the email address for which a password reset link should be generated.
/// </summary>
public class ForgotPasswordDto
{
    /// <summary>The email address associated with the account to reset.</summary>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
