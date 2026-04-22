// DTO returned after a batch goal assignment, summarizing the created goals.

namespace GoalsTracker.Api.Models.Dtos.Admin;

/// <summary>
/// Result payload returned after an admin batch-assigns a goal to multiple users.
/// </summary>
public class AdminBatchResultDto
{
    /// <summary>The number of goals created in this batch.</summary>
    public int GoalsCreated { get; set; }

    /// <summary>Details for each individual goal that was created.</summary>
    public List<AdminBatchGoalItem> Goals { get; set; } = [];
}

/// <summary>
/// Represents a single goal created during a batch assignment operation.
/// </summary>
public class AdminBatchGoalItem
{
    /// <summary>The unique identifier of the created goal.</summary>
    public int GoalId { get; set; }

    /// <summary>The user to whom the goal was assigned.</summary>
    public Guid UserId { get; set; }

    /// <summary>The username of the assigned user.</summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>The title of the assigned goal.</summary>
    public string Title { get; set; } = string.Empty;
}
