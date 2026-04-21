// Defines the contract for user analytics and strength analysis operations.

using GoalsTracker.Api.Models.Dtos.Analytics;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Provides operations for analyzing user goal completion patterns and identifying strengths.
/// </summary>
public interface IAnalyticsService
{
    /// <summary>
    /// Analyzes the user's goal completion data across categories and over time to identify
    /// strengths, improvement areas, and trends.
    /// </summary>
    /// <param name="userId">The identifier of the user to analyze.</param>
    /// <returns>A <see cref="StrengthAnalysisDto"/> with category breakdowns, strengths, and trends.</returns>
    Task<StrengthAnalysisDto> GetStrengthAnalysisAsync(Guid userId);
}
