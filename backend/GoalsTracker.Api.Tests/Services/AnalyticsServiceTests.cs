// Tests for AnalyticsService covering insufficient data, strength identification, improvement areas, and trend calculation.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Entities;
using GoalsTracker.Api.Models.Enums;
using GoalsTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Tests.Services;

/// <summary>
/// Unit tests for <see cref="AnalyticsService"/> verifying strength analysis,
/// category breakdown, improvement areas, and trend direction calculation.
/// </summary>
public class AnalyticsServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly AnalyticsService _sut;
    private readonly Guid _userId = Guid.NewGuid();

    public AnalyticsServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _sut = new AnalyticsService(_context);

        SeedCategories();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private void SeedCategories()
    {
        _context.Categories.AddRange(
            new Category { Id = 1, Name = "Fitness", ColorHex = "#34D399", Icon = "dumbbell" },
            new Category { Id = 2, Name = "Finance", ColorHex = "#3B82F6", Icon = "wallet" },
            new Category { Id = 3, Name = "Learning", ColorHex = "#8B5CF6", Icon = "book" }
        );
        _context.SaveChanges();
    }

    /// <summary>
    /// Adds a set of goals with specific statuses and categories for the test user.
    /// </summary>
    private void SeedGoalsForAnalysis()
    {
        var goalId = 1;

        // Fitness: 4 completed, 1 active = 80% completion rate (strength).
        for (var i = 0; i < 4; i++)
        {
            _context.Goals.Add(new Goal
            {
                Id = goalId++,
                UserId = _userId,
                Title = $"Fitness Goal {i}",
                CategoryId = 1,
                TimelineType = TimelineType.Weekly,
                Status = GoalStatus.Completed,
                CompletedAt = DateTime.UtcNow,
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7 * i)),
                CreatedAt = DateTime.UtcNow.AddDays(-14 * i),
                UpdatedAt = DateTime.UtcNow
            });
        }
        _context.Goals.Add(new Goal
        {
            Id = goalId++,
            UserId = _userId,
            Title = "Fitness Goal Active",
            CategoryId = 1,
            TimelineType = TimelineType.Weekly,
            Status = GoalStatus.Active,
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        // Finance: 1 completed, 3 overdue = 25% completion rate (improvement area).
        _context.Goals.Add(new Goal
        {
            Id = goalId++,
            UserId = _userId,
            Title = "Finance Goal Completed",
            CategoryId = 2,
            TimelineType = TimelineType.Monthly,
            Status = GoalStatus.Completed,
            CompletedAt = DateTime.UtcNow,
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            UpdatedAt = DateTime.UtcNow
        });
        for (var i = 0; i < 3; i++)
        {
            _context.Goals.Add(new Goal
            {
                Id = goalId++,
                UserId = _userId,
                Title = $"Finance Goal Overdue {i}",
                CategoryId = 2,
                TimelineType = TimelineType.Monthly,
                Status = GoalStatus.Overdue,
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30)),
                CreatedAt = DateTime.UtcNow.AddDays(-60),
                UpdatedAt = DateTime.UtcNow
            });
        }

        // Learning: 1 completed, 0 overdue (not enough for strength analysis).
        _context.Goals.Add(new Goal
        {
            Id = goalId++,
            UserId = _userId,
            Title = "Learning Goal",
            CategoryId = 3,
            TimelineType = TimelineType.Monthly,
            Status = GoalStatus.Completed,
            CompletedAt = DateTime.UtcNow,
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            UpdatedAt = DateTime.UtcNow
        });

        _context.SaveChanges();
    }

    [Fact]
    public async Task GetStrengthAnalysis_LessThan5Goals_ReturnsInsufficientData()
    {
        // Arrange — add only 3 completed goals.
        for (var i = 1; i <= 3; i++)
        {
            _context.Goals.Add(new Goal
            {
                Id = 100 + i,
                UserId = _userId,
                Title = $"Goal {i}",
                CategoryId = 1,
                TimelineType = TimelineType.Weekly,
                Status = GoalStatus.Completed,
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetStrengthAnalysisAsync(_userId);

        // Assert
        Assert.False(result.HasEnoughData);
        Assert.Equal(3, result.GoalsCompleted);
        Assert.Equal(5, result.GoalsNeeded);
        Assert.Contains("at least 5", result.Message);
    }

    [Fact]
    public async Task GetStrengthAnalysis_IdentifiesTopStrengths()
    {
        // Arrange
        SeedGoalsForAnalysis();

        // Act
        var result = await _sut.GetStrengthAnalysisAsync(_userId);

        // Assert
        Assert.True(result.HasEnoughData);
        Assert.NotNull(result.TopStrengths);
        // Fitness has 4 completed out of 5 = 80%, should be a top strength.
        Assert.Contains("Fitness", result.TopStrengths);
    }

    [Fact]
    public async Task GetStrengthAnalysis_IdentifiesImprovementAreas()
    {
        // Arrange
        SeedGoalsForAnalysis();

        // Act
        var result = await _sut.GetStrengthAnalysisAsync(_userId);

        // Assert
        Assert.NotNull(result.ImprovementAreas);
        // Finance has 1 completed out of 4 = 25%, with 3 overdue > 1 completed.
        Assert.Contains("Finance", result.ImprovementAreas);
    }

    [Fact]
    public async Task GetStrengthAnalysis_CalculatesTrend()
    {
        // Arrange
        SeedGoalsForAnalysis();

        // Act
        var result = await _sut.GetStrengthAnalysisAsync(_userId);

        // Assert
        Assert.NotNull(result.Trend);
        Assert.NotNull(result.Trend.Direction);
        Assert.Contains(result.Trend.Direction, new[] { "improving", "declining", "stable" });
        Assert.Equal(8, result.Trend.WeeklyCompletionRates.Count);
    }
}
