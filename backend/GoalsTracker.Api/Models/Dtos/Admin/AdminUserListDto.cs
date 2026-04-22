// DTO representing a user as seen from the admin user management view.

namespace GoalsTracker.Api.Models.Dtos.Admin;

/// <summary>
/// Represents a user with aggregated goal statistics for the admin user list.
/// </summary>
public class AdminUserListDto
{
    /// <summary>The unique identifier of the user.</summary>
    public Guid UserId { get; set; }

    /// <summary>The username of the user.</summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>The user's first name.</summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>The user's last name.</summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>The email address of the user.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Total number of goals the user has.</summary>
    public int TotalGoals { get; set; }

    /// <summary>Number of goals the user has completed.</summary>
    public int CompletedGoals { get; set; }

    /// <summary>Percentage of goals completed (0-100).</summary>
    public decimal CompletionRate { get; set; }

    /// <summary>Total gamification points earned by the user.</summary>
    public int TotalPoints { get; set; }

    /// <summary>The name of the user's current achievement level.</summary>
    public string AchievementLevel { get; set; } = string.Empty;

    /// <summary>Number of goals assigned to this user by administrators.</summary>
    public int AdminAssignedGoals { get; set; }

    /// <summary>Whether the user has the Admin role.</summary>
    public bool IsAdmin { get; set; }

    /// <summary>The date the user account was created.</summary>
    public DateTime MemberSince { get; set; }
}
