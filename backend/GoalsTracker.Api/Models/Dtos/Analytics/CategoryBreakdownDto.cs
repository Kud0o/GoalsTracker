// Represents goal completion statistics for a single category.

namespace GoalsTracker.Api.Models.Dtos.Analytics;

/// <summary>
/// Provides goal completion statistics broken down by a single category.
/// </summary>
public class CategoryBreakdownDto
{
    /// <summary>The unique identifier of the category.</summary>
    public int CategoryId { get; set; }

    /// <summary>The display name of the category.</summary>
    public string CategoryName { get; set; } = string.Empty;

    /// <summary>The total number of goals in this category.</summary>
    public int TotalGoals { get; set; }

    /// <summary>The number of completed goals in this category.</summary>
    public int CompletedGoals { get; set; }

    /// <summary>The number of overdue goals in this category.</summary>
    public int OverdueGoals { get; set; }

    /// <summary>The completion rate as a decimal (0.0 to 1.0).</summary>
    public decimal CompletionRate { get; set; }

    /// <summary>Whether this category is considered a strength based on the user's completion rate.</summary>
    public bool IsStrength { get; set; }
}
