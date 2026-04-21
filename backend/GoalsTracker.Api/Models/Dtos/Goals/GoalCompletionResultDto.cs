// Response payload returned when a goal is marked as complete, including points and achievement info.

namespace GoalsTracker.Api.Models.Dtos.Goals;

/// <summary>
/// Contains the result of completing a goal, including points earned, streak info, and achievement status.
/// </summary>
public class GoalCompletionResultDto
{
    /// <summary>The completed goal details.</summary>
    public GoalResponseDto Goal { get; set; } = null!;

    /// <summary>Breakdown of points earned from the completion.</summary>
    public PointsBreakdownDto PointsEarned { get; set; } = null!;

    /// <summary>The user's total points after this completion.</summary>
    public int NewTotalPoints { get; set; }

    /// <summary>The user's current streak count after this completion.</summary>
    public int NewStreak { get; set; }

    /// <summary>The user's achievement level after this completion.</summary>
    public AchievementLevelDto AchievementLevel { get; set; } = null!;
}

/// <summary>
/// Breaks down the points awarded for a goal completion into individual components.
/// </summary>
public class PointsBreakdownDto
{
    /// <summary>Base points awarded for completing the goal.</summary>
    public int Base { get; set; }

    /// <summary>Bonus points awarded for completing the goal before the target date.</summary>
    public int EarlyBonus { get; set; }

    /// <summary>Bonus points awarded for maintaining a completion streak.</summary>
    public int StreakBonus { get; set; }

    /// <summary>The total points awarded (Base + EarlyBonus + StreakBonus).</summary>
    public int Total { get; set; }
}

/// <summary>
/// Represents the user's achievement level and whether it changed as a result of the action.
/// </summary>
public class AchievementLevelDto
{
    /// <summary>The name of the achievement level (e.g. "Silver", "Gold").</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Whether the achievement level changed as a result of the action.</summary>
    public bool Changed { get; set; }
}
