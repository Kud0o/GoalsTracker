// DTO for creating or updating a category through the admin interface.

using System.ComponentModel.DataAnnotations;

namespace GoalsTracker.Api.Models.Dtos.Admin;

/// <summary>
/// Request payload for creating or updating a category via the admin API.
/// </summary>
public class AdminCategoryDto
{
    /// <summary>The display name of the category.</summary>
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Hex color code for the category (e.g. "#3B82F6").</summary>
    [Required]
    [MaxLength(7)]
    public string ColorHex { get; set; } = string.Empty;

    /// <summary>Icon identifier for the category.</summary>
    [Required]
    [MaxLength(50)]
    public string Icon { get; set; } = string.Empty;

    /// <summary>Ordering weight for display purposes; lower values appear first.</summary>
    public int SortOrder { get; set; }
}
