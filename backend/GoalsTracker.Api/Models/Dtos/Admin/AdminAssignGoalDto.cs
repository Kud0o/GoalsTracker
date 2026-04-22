// DTO for batch-assigning a goal to one or more users by an administrator.

using System.ComponentModel.DataAnnotations;
using GoalsTracker.Api.Models.Enums;

namespace GoalsTracker.Api.Models.Dtos.Admin;

/// <summary>
/// Request payload for an admin to assign a goal to multiple users at once.
/// </summary>
public class AdminAssignGoalDto
{
    /// <summary>Short title describing the goal.</summary>
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>Optional longer description of the goal.</summary>
    [MaxLength(2000)]
    public string? Description { get; set; }

    /// <summary>The timeline category for the assigned goal.</summary>
    [Required]
    public TimelineType TimelineType { get; set; }

    /// <summary>Optional category to classify the goal.</summary>
    public int? CategoryId { get; set; }

    /// <summary>The date by which the goal should be completed.</summary>
    [Required]
    public DateOnly TargetDate { get; set; }

    /// <summary>Optional image URL for the goal.</summary>
    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    /// <summary>The list of user identifiers to receive this goal.</summary>
    [Required]
    public List<Guid> UserIds { get; set; } = [];
}
