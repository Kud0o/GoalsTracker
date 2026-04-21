// Defines the timeline categories used to classify goal durations.

namespace GoalsTracker.Api.Models.Enums;

/// <summary>
/// Represents the timeline category for a goal.
/// </summary>
public enum TimelineType : byte
{
    /// <summary>Goals targeted for completion within a week.</summary>
    Weekly = 1,

    /// <summary>Goals targeted for completion within a month.</summary>
    Monthly = 2,

    /// <summary>Goals targeted for completion within a year.</summary>
    Yearly = 3
}
