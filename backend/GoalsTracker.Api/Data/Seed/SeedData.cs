// SeedData.cs — Seeds predefined categories and achievement levels on startup.

using GoalsTracker.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Data.Seed;

/// <summary>
/// Provides methods to seed initial reference data into the database.
/// Called during application startup to ensure categories and achievement
/// levels exist.
/// </summary>
public static class SeedData
{
    /// <summary>
    /// Seeds categories and achievement levels if they don't already exist.
    /// </summary>
    public static async Task SeedAsync(AppDbContext context)
    {
        await SeedCategoriesAsync(context);
        await SeedAchievementLevelsAsync(context);
        await context.SaveChangesAsync();
    }

    private static async Task SeedCategoriesAsync(AppDbContext context)
    {
        if (await context.Categories.AnyAsync()) return;

        var categories = new List<Category>
        {
            new() { Name = "Career", ColorHex = "#3B82F6", Icon = "briefcase", SortOrder = 1 },
            new() { Name = "Health", ColorHex = "#10B981", Icon = "heart", SortOrder = 2 },
            new() { Name = "Finance", ColorHex = "#F59E0B", Icon = "banknotes", SortOrder = 3 },
            new() { Name = "Education", ColorHex = "#8B5CF6", Icon = "academic-cap", SortOrder = 4 },
            new() { Name = "Personal", ColorHex = "#EC4899", Icon = "user", SortOrder = 5 },
            new() { Name = "Social", ColorHex = "#06B6D4", Icon = "users", SortOrder = 6 }
        };

        context.Categories.AddRange(categories);
    }

    private static async Task SeedAchievementLevelsAsync(AppDbContext context)
    {
        if (await context.AchievementLevels.AnyAsync()) return;

        var levels = new List<AchievementLevel>
        {
            new() { Name = "Bronze", MinPoints = 0, BadgeIcon = "shield", ColorHex = "#CD7F32" },
            new() { Name = "Silver", MinPoints = 500, BadgeIcon = "shield", ColorHex = "#C0C0C0" },
            new() { Name = "Gold", MinPoints = 2000, BadgeIcon = "star", ColorHex = "#FFD700" },
            new() { Name = "Platinum", MinPoints = 5000, BadgeIcon = "star", ColorHex = "#E5E4E2" },
            new() { Name = "Diamond", MinPoints = 10000, BadgeIcon = "trophy", ColorHex = "#B9F2FF" }
        };

        context.AchievementLevels.AddRange(levels);
    }
}
