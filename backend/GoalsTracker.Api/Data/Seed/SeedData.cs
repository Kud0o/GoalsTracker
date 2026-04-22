// SeedData.cs — Seeds predefined categories, achievement levels, roles, and default admin on startup.

using GoalsTracker.Api.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace GoalsTracker.Api.Data.Seed;

/// <summary>
/// Provides methods to seed initial reference data into the database.
/// Called during application startup to ensure categories, achievement
/// levels, roles, and the default admin user exist.
/// </summary>
public static class SeedData
{
    /// <summary>
    /// Seeds categories, achievement levels, roles, and the default admin user if they don't already exist.
    /// </summary>
    /// <param name="context">The application database context.</param>
    /// <param name="roleManager">The ASP.NET Identity role manager.</param>
    /// <param name="userManager">The ASP.NET Identity user manager.</param>
    /// <param name="configuration">Application configuration for admin seed settings.</param>
    public static async Task SeedAsync(
        AppDbContext context,
        RoleManager<IdentityRole<Guid>> roleManager,
        UserManager<User> userManager,
        IConfiguration configuration)
    {
        await SeedCategoriesAsync(context);
        await SeedAchievementLevelsAsync(context);
        await context.SaveChangesAsync();
        await SeedRolesAsync(roleManager);
        await SeedDefaultAdminAsync(userManager, configuration);
    }

    /// <summary>
    /// Creates the "Admin" and "User" roles if they do not already exist.
    /// </summary>
    /// <param name="roleManager">The ASP.NET Identity role manager.</param>
    private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        string[] roles = ["Admin", "User"];

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid> { Name = role });
            }
        }
    }

    /// <summary>
    /// Promotes users specified by <c>Admin:SeedEmails</c> configuration to the Admin role.
    /// Supports both a single email (Admin:SeedEmail) and an array (Admin:SeedEmails).
    /// Skips emails where the user hasn't registered yet.
    /// </summary>
    private static async Task SeedDefaultAdminAsync(UserManager<User> userManager, IConfiguration configuration)
    {
        // Support both array format (SeedEmails) and single value (SeedEmail) for backwards compat
        var emails = configuration.GetSection("Admin:SeedEmails").Get<string[]>()
            ?? Array.Empty<string>();

        var singleEmail = configuration["Admin:SeedEmail"];
        if (!string.IsNullOrWhiteSpace(singleEmail) && !emails.Contains(singleEmail, StringComparer.OrdinalIgnoreCase))
        {
            emails = emails.Append(singleEmail).ToArray();
        }

        foreach (var email in emails)
        {
            if (string.IsNullOrWhiteSpace(email)) continue;

            var user = await userManager.FindByEmailAsync(email);
            if (user is null) continue;

            if (!await userManager.IsInRoleAsync(user, "Admin"))
            {
                await userManager.AddToRoleAsync(user, "Admin");
            }
        }
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
