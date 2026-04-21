// Represents a predefined category that goals can be organized into.

using System.ComponentModel.DataAnnotations;

namespace GoalsTracker.Api.Models.Entities;

/// <summary>
/// A classification bucket for goals, providing color and icon metadata for the UI.
/// </summary>
public class Category
{
    /// <summary>Primary key.</summary>
    public int Id { get; set; }

    /// <summary>Display name of the category.</summary>
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Hex color code used to render the category (e.g. "#34D399").</summary>
    [Required]
    [MaxLength(7)]
    public string ColorHex { get; set; } = string.Empty;

    /// <summary>Icon identifier or CSS class for the category.</summary>
    [Required]
    [MaxLength(50)]
    public string Icon { get; set; } = string.Empty;

    /// <summary>Ordering weight for display purposes; lower values appear first.</summary>
    public int SortOrder { get; set; }

    // Navigation properties

    /// <summary>Goals assigned to this category.</summary>
    public ICollection<Goal> Goals { get; set; } = new List<Goal>();
}
