// Response payload for the user's strength and weakness analysis across categories.

namespace GoalsTracker.Api.Models.Dtos.Analytics;

/// <summary>
/// Provides a comprehensive strength and weakness analysis of the user's goal completions across categories.
/// </summary>
public class StrengthAnalysisDto
{
    /// <summary>Whether the user has completed enough goals to generate a meaningful analysis.</summary>
    public bool HasEnoughData { get; set; }

    /// <summary>Per-category breakdown of goal completion statistics, if enough data exists.</summary>
    public List<CategoryBreakdownDto>? CategoryBreakdown { get; set; }

    /// <summary>List of category names where the user performs best, if enough data exists.</summary>
    public List<string>? TopStrengths { get; set; }

    /// <summary>List of category names where the user has room for improvement, if enough data exists.</summary>
    public List<string>? ImprovementAreas { get; set; }

    /// <summary>Weekly completion trend data, if enough data exists.</summary>
    public TrendDto? Trend { get; set; }

    /// <summary>A human-readable message summarizing the analysis or explaining insufficient data.</summary>
    public string? Message { get; set; }

    /// <summary>The total number of goals the user has completed.</summary>
    public int GoalsCompleted { get; set; }

    /// <summary>The minimum number of completed goals needed before analysis is available.</summary>
    public int GoalsNeeded { get; set; }
}
