// Tests for PointsService covering base point calculation, early bonus, streaks, and summaries.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Dtos.Points;
using GoalsTracker.Api.Models.Entities;
using GoalsTracker.Api.Models.Enums;
using GoalsTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Tests.Services;

/// <summary>
/// Unit tests for <see cref="PointsService"/> verifying point calculations,
/// streak tracking, achievement promotion, and summary retrieval.
/// </summary>
public class PointsServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly PointsService _sut;
    private readonly Guid _userId = Guid.NewGuid();

    public PointsServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _sut = new PointsService(_context);

        SeedDatabase();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private void SeedDatabase()
    {
        _context.AchievementLevels.AddRange(
            new AchievementLevel { Id = 1, Name = "Bronze", MinPoints = 0, BadgeIcon = "bronze", ColorHex = "#CD7F32" },
            new AchievementLevel { Id = 2, Name = "Silver", MinPoints = 100, BadgeIcon = "silver", ColorHex = "#C0C0C0" },
            new AchievementLevel { Id = 3, Name = "Gold", MinPoints = 500, BadgeIcon = "gold", ColorHex = "#FFD700" }
        );

        var user = new User
        {
            Id = _userId,
            UserName = "tester",
            Email = "tester@test.com",
            Timezone = "UTC",
            TotalPoints = 0,
            CurrentStreak = 0,
            BestStreak = 0,
            AchievementLevelId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);
        _context.SaveChanges();
    }

    /// <summary>
    /// Creates a goal with the specified timeline type set to be completed "late"
    /// (timeline progress >= 0.5), meaning CreatedAt is far in the past relative to TargetDate.
    /// </summary>
    private Goal CreateLateGoal(TimelineType timelineType, int goalId)
    {
        return new Goal
        {
            Id = goalId,
            UserId = _userId,
            Title = $"Test {timelineType}",
            TimelineType = timelineType,
            Status = GoalStatus.Active,
            // CreatedAt set far enough back that progress >= 0.5 (no early bonus).
            CreatedAt = DateTime.UtcNow.AddDays(-60),
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            GoalTags = new List<GoalTag>()
        };
    }

    /// <summary>
    /// Creates a goal that qualifies for early completion bonus (timeline progress < 0.5).
    /// </summary>
    private Goal CreateEarlyGoal(TimelineType timelineType, int goalId)
    {
        return new Goal
        {
            Id = goalId,
            UserId = _userId,
            Title = $"Early {timelineType}",
            TimelineType = timelineType,
            Status = GoalStatus.Active,
            // CreatedAt is now, TargetDate is far in the future so progress < 0.5.
            CreatedAt = DateTime.UtcNow,
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(120)),
            GoalTags = new List<GoalTag>()
        };
    }

    private async Task<User> GetUserAsync()
    {
        return await _context.Users
            .Include(u => u.AchievementLevel)
            .FirstAsync(u => u.Id == _userId);
    }

    [Fact]
    public async Task CalculatePoints_WeeklyGoal_Awards10BasePoints()
    {
        // Arrange
        var user = await GetUserAsync();
        var goal = CreateLateGoal(TimelineType.Weekly, 1);
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.CalculateAndAwardPointsAsync(user, goal);

        // Assert
        Assert.Equal(10, result.PointsEarned.Base);
    }

    [Fact]
    public async Task CalculatePoints_MonthlyGoal_Awards50BasePoints()
    {
        // Arrange
        var user = await GetUserAsync();
        var goal = CreateLateGoal(TimelineType.Monthly, 2);
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.CalculateAndAwardPointsAsync(user, goal);

        // Assert
        Assert.Equal(50, result.PointsEarned.Base);
    }

    [Fact]
    public async Task CalculatePoints_YearlyGoal_Awards200BasePoints()
    {
        // Arrange
        var user = await GetUserAsync();
        var goal = CreateLateGoal(TimelineType.Yearly, 3);
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.CalculateAndAwardPointsAsync(user, goal);

        // Assert
        Assert.Equal(200, result.PointsEarned.Base);
    }

    [Fact]
    public async Task CalculatePoints_EarlyCompletion_AppliesBonusMultiplier()
    {
        // Arrange
        var user = await GetUserAsync();
        var goal = CreateEarlyGoal(TimelineType.Monthly, 4);
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.CalculateAndAwardPointsAsync(user, goal);

        // Assert — early bonus is 50% of base (50 * 0.5 = 25).
        Assert.Equal(25, result.PointsEarned.EarlyBonus);
        Assert.True(result.PointsEarned.Total >= result.PointsEarned.Base + result.PointsEarned.EarlyBonus);
    }

    [Fact]
    public async Task CalculatePoints_LateCompletion_NoBonus()
    {
        // Arrange
        var user = await GetUserAsync();
        var goal = CreateLateGoal(TimelineType.Monthly, 5);
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.CalculateAndAwardPointsAsync(user, goal);

        // Assert
        Assert.Equal(0, result.PointsEarned.EarlyBonus);
    }

    [Fact]
    public async Task CalculatePoints_IncrementsStreak()
    {
        // Arrange
        var user = await GetUserAsync();
        Assert.Equal(0, user.CurrentStreak);

        var goal = CreateLateGoal(TimelineType.Weekly, 6);
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.CalculateAndAwardPointsAsync(user, goal);

        // Assert
        Assert.Equal(1, result.NewStreak);
        Assert.Equal(1, user.CurrentStreak);
    }

    [Fact]
    public async Task CalculatePoints_StreakThreshold3_AwardsStreakBonus()
    {
        // Arrange — set user streak to 2 so next completion hits threshold 3.
        var user = await GetUserAsync();
        user.CurrentStreak = 2;
        await _context.SaveChangesAsync();

        var goal = CreateLateGoal(TimelineType.Weekly, 7);
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.CalculateAndAwardPointsAsync(user, goal);

        // Assert — weekly streak bonus at 3 = 5 points.
        Assert.Equal(5, result.PointsEarned.StreakBonus);
        Assert.Equal(3, user.CurrentStreak);
    }

    [Fact]
    public async Task CalculatePoints_UpdatesUserTotalPoints()
    {
        // Arrange
        var user = await GetUserAsync();
        var initialPoints = user.TotalPoints;

        var goal = CreateLateGoal(TimelineType.Weekly, 8);
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.CalculateAndAwardPointsAsync(user, goal);

        // Assert
        Assert.Equal(initialPoints + result.PointsEarned.Total, user.TotalPoints);
        Assert.Equal(user.TotalPoints, result.NewTotalPoints);
    }

    [Fact]
    public async Task CalculatePoints_PromotesAchievementLevel()
    {
        // Arrange — set user to 95 points; completing a weekly goal (10 pts) pushes past 100 (Silver).
        var user = await GetUserAsync();
        user.TotalPoints = 95;
        await _context.SaveChangesAsync();

        var goal = CreateLateGoal(TimelineType.Weekly, 9);
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.CalculateAndAwardPointsAsync(user, goal);

        // Assert
        Assert.True(result.AchievementLevel.Changed);
        Assert.Equal("Silver", result.AchievementLevel.Name);
    }

    [Fact]
    public async Task GetPointsSummary_ReturnsCorrectTotals()
    {
        // Arrange — set up user with known state.
        var user = await GetUserAsync();
        user.TotalPoints = 150;
        user.CurrentStreak = 5;
        user.BestStreak = 7;

        _context.PointTransactions.Add(new PointTransaction
        {
            UserId = _userId,
            Points = 50,
            TransactionType = TransactionType.Completion,
            Description = "Test transaction",
            CreatedAt = DateTime.UtcNow // Within this week and this month.
        });
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetPointsSummaryAsync(_userId);

        // Assert
        Assert.Equal(150, result.TotalPoints);
        Assert.Equal(5, result.CurrentStreak);
        Assert.Equal(7, result.BestStreak);
        Assert.Equal("Bronze", result.AchievementLevel.Name);
        Assert.Equal(50, result.ThisWeek);
        Assert.Equal(50, result.ThisMonth);
        Assert.NotNull(result.AchievementLevel.NextLevel);
        // why: user has 150 points, Silver threshold is 100 (already passed),
        // so next level above current points is Gold at 500
        Assert.Equal("Gold", result.AchievementLevel.NextLevel!.Name);
        Assert.Equal(350, result.AchievementLevel.NextLevel.PointsNeeded);
    }
}
