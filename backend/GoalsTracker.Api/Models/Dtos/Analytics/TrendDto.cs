// Represents the user's weekly goal completion trend over time.

namespace GoalsTracker.Api.Models.Dtos.Analytics;

/// <summary>
/// Describes the user's goal completion trend direction and weekly breakdown.
/// </summary>
public class TrendDto
{
    /// <summary>The overall trend direction (e.g. "improving", "declining", "stable").</summary>
    public string Direction { get; set; } = string.Empty;

    /// <summary>Weekly completion rates ordered chronologically.</summary>
    public List<WeeklyRateDto> WeeklyCompletionRates { get; set; } = [];
}

/// <summary>
/// Represents the goal completion rate for a single week.
/// </summary>
public class WeeklyRateDto
{
    /// <summary>The start date of the week.</summary>
    public DateOnly WeekStart { get; set; }

    /// <summary>The completion rate for that week as a decimal (0.0 to 1.0).</summary>
    public decimal Rate { get; set; }
}
