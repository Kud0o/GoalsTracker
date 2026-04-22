// Request payload for new user registration.

using System.ComponentModel.DataAnnotations;

namespace GoalsTracker.Api.Models.Dtos.Auth;

/// <summary>
/// Contains the fields required to register a new user account.
/// </summary>
public class RegisterDto
{
    /// <summary>The user's first name.</summary>
    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    /// <summary>The user's last name.</summary>
    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    /// <summary>The user's email address, used for login and notifications.</summary>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>The desired display name for the user.</summary>
    [Required]
    [MinLength(3)]
    [MaxLength(50)]
    public string UserName { get; set; } = string.Empty;

    /// <summary>The account password (minimum 8 characters).</summary>
    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    /// <summary>Optional IANA timezone identifier for date/time localization (e.g. "America/New_York").</summary>
    public string? Timezone { get; set; }
}
