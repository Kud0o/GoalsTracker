// Request payload for creating a new goal.

using System.ComponentModel.DataAnnotations;
using GoalsTracker.Api.Models.Enums;

namespace GoalsTracker.Api.Models.Dtos.Goals;

/// <summary>
/// Contains the fields required to create a new goal.
/// </summary>
public class CreateGoalDto
{
    /// <summary>The title of the goal.</summary>
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>An optional detailed description of the goal.</summary>
    [MaxLength(2000)]
    public string? Description { get; set; }

    /// <summary>The timeline category that determines the goal's duration scope.</summary>
    [Required]
    public TimelineType TimelineType { get; set; }

    /// <summary>The optional category identifier to classify the goal.</summary>
    public int? CategoryId { get; set; }

    /// <summary>The target date by which the goal should be completed.</summary>
    [Required]
    public DateOnly TargetDate { get; set; }

    /// <summary>Optional image URL or base64 data URL for the goal.</summary>
    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    /// <summary>Optional list of tag names to associate with the goal.</summary>
    public List<string>? TagNames { get; set; }
}
