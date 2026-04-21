// Represents a single entry (row) on the leaderboard.

namespace GoalsTracker.Api.Models.Dtos.Leaderboard;

/// <summary>
/// Represents a single user's entry on the leaderboard.
/// </summary>
public class LeaderboardEntryDto
{
    /// <summary>The user's rank position on the leaderboard.</summary>
    public int Rank { get; set; }

    /// <summary>The display name of the user.</summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>The user's total accumulated points.</summary>
    public int TotalPoints { get; set; }

    /// <summary>The total number of goals the user has completed.</summary>
    public int GoalsCompleted { get; set; }

    /// <summary>The user's current consecutive completion streak.</summary>
    public int CurrentStreak { get; set; }

    /// <summary>The name of the user's current achievement level.</summary>
    public string AchievementLevel { get; set; } = string.Empty;

    /// <summary>The badge icon identifier for the user's achievement level.</summary>
    public string? BadgeIcon { get; set; }

    /// <summary>The color associated with the user's achievement level.</summary>
    public string? AchievementColor { get; set; }

    /// <summary>Whether this entry represents the currently authenticated user.</summary>
    public bool IsCurrentUser { get; set; }
}
