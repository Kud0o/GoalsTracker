// Response payload for a single point transaction history entry.

using GoalsTracker.Api.Models.Enums;

namespace GoalsTracker.Api.Models.Dtos.Points;

/// <summary>
/// Represents a single point transaction in the user's point history.
/// </summary>
public class PointHistoryDto
{
    /// <summary>The unique identifier of the point transaction.</summary>
    public int Id { get; set; }

    /// <summary>The identifier of the goal that triggered this transaction, if applicable.</summary>
    public int? GoalId { get; set; }

    /// <summary>The title of the goal that triggered this transaction, if applicable.</summary>
    public string? GoalTitle { get; set; }

    /// <summary>The number of points awarded or deducted.</summary>
    public int Points { get; set; }

    /// <summary>The type of transaction that generated these points.</summary>
    public TransactionType TransactionType { get; set; }

    /// <summary>A human-readable description of the transaction.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>The UTC date and time when the transaction was created.</summary>
    public DateTime CreatedAt { get; set; }
}
