// Response payload summarizing a user's points, streaks, and achievement level.

namespace GoalsTracker.Api.Models.Dtos.Points;

/// <summary>
/// Provides an overview of a user's points, streaks, and current achievement level.
/// </summary>
public class PointsSummaryDto
{
    /// <summary>The user's total accumulated points.</summary>
    public int TotalPoints { get; set; }

    /// <summary>The user's current consecutive completion streak.</summary>
    public int CurrentStreak { get; set; }

    /// <summary>The user's best (longest) consecutive completion streak.</summary>
    public int BestStreak { get; set; }

    /// <summary>Information about the user's current achievement level and progress to the next.</summary>
    public AchievementLevelInfoDto AchievementLevel { get; set; } = null!;

    /// <summary>Total points earned in the current week.</summary>
    public int ThisWeek { get; set; }

    /// <summary>Total points earned in the current month.</summary>
    public int ThisMonth { get; set; }
}

/// <summary>
/// Provides details about the user's current achievement level and the next level to reach.
/// </summary>
public class AchievementLevelInfoDto
{
    /// <summary>The name of the current achievement level.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>The minimum points required for the current level.</summary>
    public int MinPoints { get; set; }

    /// <summary>Information about the next achievement level, if one exists.</summary>
    public NextLevelDto? NextLevel { get; set; }
}

/// <summary>
/// Describes the next achievement level and how many points are needed to reach it.
/// </summary>
public class NextLevelDto
{
    /// <summary>The name of the next achievement level.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>The minimum points required to reach the next level.</summary>
    public int MinPoints { get; set; }

    /// <summary>The number of additional points the user needs to reach the next level.</summary>
    public int PointsNeeded { get; set; }
}
