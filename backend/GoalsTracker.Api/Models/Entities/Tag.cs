// Represents a user-defined label that can be applied to goals for custom grouping.

using System.ComponentModel.DataAnnotations;

namespace GoalsTracker.Api.Models.Entities;

/// <summary>
/// A lightweight, user-scoped label for organizing goals beyond categories.
/// </summary>
public class Tag
{
    /// <summary>Primary key.</summary>
    public int Id { get; set; }

    /// <summary>Foreign key to the user who created this tag.</summary>
    public Guid UserId { get; set; }

    /// <summary>Display name of the tag.</summary>
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    // Navigation properties

    /// <summary>The user who owns this tag.</summary>
    public User User { get; set; } = null!;

    /// <summary>Goals associated with this tag through the join entity.</summary>
    public ICollection<GoalTag> GoalTags { get; set; } = new List<GoalTag>();
}
