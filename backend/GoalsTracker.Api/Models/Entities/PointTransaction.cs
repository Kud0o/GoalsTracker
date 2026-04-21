// Records individual point awards and their reasons for audit and history purposes.

using System.ComponentModel.DataAnnotations;
using GoalsTracker.Api.Models.Enums;

namespace GoalsTracker.Api.Models.Entities;

/// <summary>
/// An immutable ledger entry representing points awarded to a user for a specific action.
/// </summary>
public class PointTransaction
{
    /// <summary>Primary key.</summary>
    public int Id { get; set; }

    /// <summary>Foreign key to the user who received the points.</summary>
    public Guid UserId { get; set; }

    /// <summary>Optional foreign key to the goal that triggered this transaction.</summary>
    public int? GoalId { get; set; }

    /// <summary>Number of points awarded (positive value).</summary>
    public int Points { get; set; }

    /// <summary>The reason category for this point award.</summary>
    public TransactionType TransactionType { get; set; }

    /// <summary>Human-readable description of why points were awarded.</summary>
    [Required]
    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    /// <summary>UTC timestamp when the transaction was created.</summary>
    public DateTime CreatedAt { get; set; }

    // Navigation properties

    /// <summary>The user who received the points.</summary>
    public User User { get; set; } = null!;

    /// <summary>The goal that triggered this transaction, if applicable.</summary>
    public Goal? Goal { get; set; }
}
