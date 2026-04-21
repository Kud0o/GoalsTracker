// Request payload for user authentication.

using System.ComponentModel.DataAnnotations;

namespace GoalsTracker.Api.Models.Dtos.Auth;

/// <summary>
/// Contains the credentials required to authenticate a user.
/// </summary>
public class LoginDto
{
    /// <summary>The user's registered email address.</summary>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>The user's account password.</summary>
    [Required]
    public string Password { get; set; } = string.Empty;
}
