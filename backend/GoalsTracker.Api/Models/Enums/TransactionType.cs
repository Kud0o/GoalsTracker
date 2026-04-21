// Defines the types of point transactions that can be awarded to users.

namespace GoalsTracker.Api.Models.Enums;

/// <summary>
/// Represents the reason a point transaction was created.
/// </summary>
public enum TransactionType : byte
{
    /// <summary>Points awarded for completing a goal.</summary>
    Completion = 1,

    /// <summary>Bonus points awarded for completing a goal before its target date.</summary>
    EarlyBonus = 2,

    /// <summary>Points awarded for maintaining a consecutive completion streak.</summary>
    Streak = 3
}
