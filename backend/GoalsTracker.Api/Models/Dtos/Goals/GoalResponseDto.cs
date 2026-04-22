// Response payload representing a goal with its related category and tags.

using GoalsTracker.Api.Models.Enums;

namespace GoalsTracker.Api.Models.Dtos.Goals;

/// <summary>
/// Represents a goal returned from the API, including its category, tags, and status information.
/// </summary>
public class GoalResponseDto
{
    /// <summary>The unique identifier of the goal.</summary>
    public int Id { get; set; }

    /// <summary>The title of the goal.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>The detailed description of the goal.</summary>
    public string? Description { get; set; }

    /// <summary>The timeline category of the goal.</summary>
    public TimelineType TimelineType { get; set; }

    /// <summary>The category assigned to the goal, if any.</summary>
    public CategoryDto? Category { get; set; }

    /// <summary>The tags associated with the goal.</summary>
    public List<TagDto> Tags { get; set; } = [];

    /// <summary>The target date by which the goal should be completed.</summary>
    public DateOnly TargetDate { get; set; }

    /// <summary>The current status of the goal.</summary>
    public GoalStatus Status { get; set; }

    /// <summary>The UTC date and time when the goal was completed, if applicable.</summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>The total points awarded for completing this goal.</summary>
    public int PointsAwarded { get; set; }

    /// <summary>Optional image URL or base64 data URL for the goal.</summary>
    public string? ImageUrl { get; set; }

    /// <summary>The UTC date and time when the goal was created.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Whether this goal was assigned by an administrator.</summary>
    public bool IsAdminAssigned { get; set; }

    /// <summary>The username of the admin who assigned this goal, if applicable.</summary>
    public string? AssignedByAdminName { get; set; }
}

/// <summary>
/// A lightweight representation of a category for embedding in goal responses.
/// </summary>
public class CategoryDto
{
    /// <summary>The unique identifier of the category.</summary>
    public int Id { get; set; }

    /// <summary>The display name of the category.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>The hex color code used to display the category (e.g. "#FF5733").</summary>
    public string? ColorHex { get; set; }

    /// <summary>The icon identifier for the category.</summary>
    public string? Icon { get; set; }
}

/// <summary>
/// A lightweight representation of a tag for embedding in goal responses.
/// </summary>
public class TagDto
{
    /// <summary>The unique identifier of the tag.</summary>
    public int Id { get; set; }

    /// <summary>The display name of the tag.</summary>
    public string Name { get; set; } = string.Empty;
}
