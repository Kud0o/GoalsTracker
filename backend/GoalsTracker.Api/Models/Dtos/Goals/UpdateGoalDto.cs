// Request payload for updating an existing goal. All fields are optional.

using GoalsTracker.Api.Models.Enums;

namespace GoalsTracker.Api.Models.Dtos.Goals;

/// <summary>
/// Contains the fields that can be updated on an existing goal. Only non-null fields are applied.
/// </summary>
public class UpdateGoalDto
{
    /// <summary>The updated title of the goal.</summary>
    public string? Title { get; set; }

    /// <summary>The updated description of the goal.</summary>
    public string? Description { get; set; }

    /// <summary>The updated timeline category for the goal.</summary>
    public TimelineType? TimelineType { get; set; }

    /// <summary>The updated category identifier for the goal.</summary>
    public int? CategoryId { get; set; }

    /// <summary>The updated target completion date.</summary>
    public DateOnly? TargetDate { get; set; }

    /// <summary>Optional updated image URL or base64 data URL.</summary>
    public string? ImageUrl { get; set; }

    /// <summary>The updated list of tag names to associate with the goal.</summary>
    public List<string>? TagNames { get; set; }
}
