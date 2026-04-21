// Defines the possible statuses a goal can have throughout its lifecycle.

namespace GoalsTracker.Api.Models.Enums;

/// <summary>
/// Represents the current status of a goal.
/// </summary>
public enum GoalStatus : byte
{
    /// <summary>The goal is currently in progress.</summary>
    Active = 1,

    /// <summary>The goal has been successfully completed.</summary>
    Completed = 2,

    /// <summary>The goal has passed its target date without completion.</summary>
    Overdue = 3
}
