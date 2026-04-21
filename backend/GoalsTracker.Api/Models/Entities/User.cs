// Extends ASP.NET Identity to store goal-tracking profile data for each user.

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace GoalsTracker.Api.Models.Entities;

/// <summary>
/// Application user, extending <see cref="IdentityUser{Guid}"/> with gamification and profile fields.
/// </summary>
public class User : IdentityUser<Guid>
{
    /// <summary>IANA timezone identifier for the user (e.g. "America/New_York").</summary>
    [Required]
    [MaxLength(50)]
    public string Timezone { get; set; } = "UTC";

    /// <summary>Cumulative points earned across all completed goals.</summary>
    public int TotalPoints { get; set; } = 0;

    /// <summary>Number of consecutive goal completions in the current streak.</summary>
    public int CurrentStreak { get; set; } = 0;

    /// <summary>Highest streak the user has ever achieved.</summary>
    public int BestStreak { get; set; } = 0;

    /// <summary>Foreign key to the user's current achievement level.</summary>
    public int AchievementLevelId { get; set; }

    /// <summary>Whether the user appears on the public leaderboard.</summary>
    public bool IsPublicOnLeaderboard { get; set; } = true;

    /// <summary>UTC timestamp when the account was created.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>UTC timestamp when the profile was last updated.</summary>
    public DateTime UpdatedAt { get; set; }

    // Navigation properties

    /// <summary>The user's current achievement level.</summary>
    public AchievementLevel AchievementLevel { get; set; } = null!;

    /// <summary>Goals created by this user.</summary>
    public ICollection<Goal> Goals { get; set; } = new List<Goal>();

    /// <summary>Point transaction history for this user.</summary>
    public ICollection<PointTransaction> PointTransactions { get; set; } = new List<PointTransaction>();

    /// <summary>Custom tags created by this user.</summary>
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
