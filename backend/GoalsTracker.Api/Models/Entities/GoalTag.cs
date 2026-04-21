// Join entity linking goals to tags in a many-to-many relationship.

namespace GoalsTracker.Api.Models.Entities;

/// <summary>
/// Composite-keyed join table connecting <see cref="Goal"/> and <see cref="Tag"/>.
/// </summary>
public class GoalTag
{
    /// <summary>Foreign key to the goal.</summary>
    public int GoalId { get; set; }

    /// <summary>Foreign key to the tag.</summary>
    public int TagId { get; set; }

    // Navigation properties

    /// <summary>The associated goal.</summary>
    public Goal Goal { get; set; } = null!;

    /// <summary>The associated tag.</summary>
    public Tag Tag { get; set; } = null!;
}
