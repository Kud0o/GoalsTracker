// Implements strength analysis by evaluating goal completions across categories and over time.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Dtos.Analytics;
using GoalsTracker.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Analyzes user goal completion patterns to identify strengths, improvement areas, and trends.
/// </summary>
public class AnalyticsService : IAnalyticsService
{
    private const int MinCompletedGoals = 5;
    private const int MinCategoryGoals = 2;
    private const int TrendWeeks = 8;

    private readonly AppDbContext _context;

    /// <summary>
    /// Initializes a new instance of <see cref="AnalyticsService"/>.
    /// </summary>
    /// <param name="context">The application database context.</param>
    public AnalyticsService(AppDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<StrengthAnalysisDto> GetStrengthAnalysisAsync(Guid userId)
    {
        var goals = await _context.Goals
            .Where(g => g.UserId == userId)
            .Include(g => g.Category)
            .ToListAsync();

        var completedCount = goals.Count(g => g.Status == GoalStatus.Completed);

        // Check minimum data threshold.
        if (completedCount < MinCompletedGoals)
        {
            return new StrengthAnalysisDto
            {
                HasEnoughData = false,
                GoalsCompleted = completedCount,
                GoalsNeeded = MinCompletedGoals,
                Message = $"You need at least {MinCompletedGoals} completed goals for analysis. You have {completedCount} so far."
            };
        }

        // Build category breakdown. Group by CategoryId, treating null as uncategorized.
        var categoryGroups = goals
            .Where(g => g.CategoryId.HasValue)
            .GroupBy(g => new { g.CategoryId, CategoryName = g.Category?.Name ?? "Unknown" })
            .Select(group =>
            {
                var total = group.Count();
                var completed = group.Count(g => g.Status == GoalStatus.Completed);
                var overdue = group.Count(g => g.Status == GoalStatus.Overdue);
                var rate = total > 0 ? (decimal)completed / total : 0m;

                return new CategoryBreakdownDto
                {
                    CategoryId = group.Key.CategoryId!.Value,
                    CategoryName = group.Key.CategoryName,
                    TotalGoals = total,
                    CompletedGoals = completed,
                    OverdueGoals = overdue,
                    CompletionRate = Math.Round(rate, 2),
                    IsStrength = completed >= MinCategoryGoals && rate >= 0.5m
                };
            })
            .OrderByDescending(c => c.CompletionRate)
            .ToList();

        // Identify top 3 strengths: highest completion rate with at least MinCategoryGoals completed.
        var topStrengths = categoryGroups
            .Where(c => c.CompletedGoals >= MinCategoryGoals && c.CompletionRate >= 0.5m)
            .OrderByDescending(c => c.CompletionRate)
            .Take(3)
            .Select(c => c.CategoryName)
            .ToList();

        // Identify improvement areas: completion rate below 50% or categories with most overdue goals.
        var improvementAreas = categoryGroups
            .Where(c => c.CompletionRate < 0.5m || c.OverdueGoals > c.CompletedGoals)
            .OrderBy(c => c.CompletionRate)
            .Select(c => c.CategoryName)
            .ToList();

        // Calculate weekly completion trend over the last 8 weeks.
        var trend = CalculateWeeklyTrend(goals);

        return new StrengthAnalysisDto
        {
            HasEnoughData = true,
            CategoryBreakdown = categoryGroups,
            TopStrengths = topStrengths,
            ImprovementAreas = improvementAreas,
            Trend = trend,
            GoalsCompleted = completedCount,
            GoalsNeeded = MinCompletedGoals,
            Message = topStrengths.Count > 0
                ? $"You excel in {string.Join(", ", topStrengths)}!"
                : "Keep completing goals to identify your strengths."
        };
    }

    /// <summary>
    /// Computes weekly completion rates over the last 8 weeks and determines the overall trend direction.
    /// </summary>
    private static TrendDto CalculateWeeklyTrend(List<Models.Entities.Goal> goals)
    {
        var now = DateTime.UtcNow;
        var weeklyRates = new List<WeeklyRateDto>();

        for (var i = TrendWeeks - 1; i >= 0; i--)
        {
            var weekStart = DateOnly.FromDateTime(now.AddDays(-7 * (i + 1)));
            var weekEnd = DateOnly.FromDateTime(now.AddDays(-7 * i));

            // Goals that had their target date within this week.
            var goalsInWeek = goals.Where(g =>
                g.TargetDate >= weekStart && g.TargetDate < weekEnd).ToList();

            var completedInWeek = goalsInWeek.Count(g => g.Status == GoalStatus.Completed);
            var total = goalsInWeek.Count;
            var rate = total > 0 ? (decimal)completedInWeek / total : 0m;

            weeklyRates.Add(new WeeklyRateDto
            {
                WeekStart = weekStart,
                Rate = Math.Round(rate, 2)
            });
        }

        // Determine direction by comparing recent 4 weeks average to prior 4 weeks average.
        var recentAvg = weeklyRates.Skip(TrendWeeks / 2).Average(w => w.Rate);
        var priorAvg = weeklyRates.Take(TrendWeeks / 2).Average(w => w.Rate);

        string direction;
        if (recentAvg > priorAvg + 0.05m)
            direction = "improving";
        else if (recentAvg < priorAvg - 0.05m)
            direction = "declining";
        else
            direction = "stable";

        return new TrendDto
        {
            Direction = direction,
            WeeklyCompletionRates = weeklyRates
        };
    }
}
