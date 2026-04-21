// Represents an achievement tier that users can reach based on accumulated points.

using System.ComponentModel.DataAnnotations;

namespace GoalsTracker.Api.Models.Entities;

/// <summary>
/// Defines a named achievement level with a minimum point threshold and visual badge.
/// </summary>
public class AchievementLevel
{
    /// <summary>Primary key.</summary>
    public int Id { get; set; }

    /// <summary>Display name of the achievement level (e.g. "Bronze", "Silver").</summary>
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Minimum cumulative points required to reach this level.</summary>
    public int MinPoints { get; set; }

    /// <summary>Icon identifier or path for the badge graphic.</summary>
    [Required]
    [MaxLength(50)]
    public string BadgeIcon { get; set; } = string.Empty;

    /// <summary>Hex color code for the badge (e.g. "#FFD700").</summary>
    [Required]
    [MaxLength(7)]
    public string ColorHex { get; set; } = string.Empty;

    // Navigation properties

    /// <summary>Users who currently hold this achievement level.</summary>
    public ICollection<User> Users { get; set; } = new List<User>();
}
