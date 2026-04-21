// Tests for GoalService covering CRUD operations, tag management, completion, and ownership authorization.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Dtos.Goals;
using GoalsTracker.Api.Models.Entities;
using GoalsTracker.Api.Models.Enums;
using GoalsTracker.Api.Services;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace GoalsTracker.Api.Tests.Services;

/// <summary>
/// Unit tests for <see cref="GoalService"/> using an InMemory EF Core database
/// and a mocked <see cref="IPointsService"/>.
/// </summary>
public class GoalServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<IPointsService> _pointsServiceMock;
    private readonly GoalService _sut;
    private readonly Guid _ownerId = Guid.NewGuid();
    private readonly Guid _otherUserId = Guid.NewGuid();

    public GoalServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);

        _pointsServiceMock = new Mock<IPointsService>();
        _pointsServiceMock
            .Setup(p => p.CalculateAndAwardPointsAsync(It.IsAny<User>(), It.IsAny<Goal>()))
            .ReturnsAsync((User user, Goal goal) => new GoalCompletionResultDto
            {
                Goal = new GoalResponseDto
                {
                    Id = goal.Id,
                    Title = goal.Title,
                    Status = GoalStatus.Completed
                },
                PointsEarned = new PointsBreakdownDto { Base = 10, Total = 10 },
                NewTotalPoints = user.TotalPoints + 10,
                NewStreak = user.CurrentStreak + 1,
                AchievementLevel = new AchievementLevelDto { Name = "Bronze", Changed = false }
            });

        _sut = new GoalService(_context, _pointsServiceMock.Object);

        SeedDatabase();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private void SeedDatabase()
    {
        var achievementLevel = new AchievementLevel
        {
            Id = 1,
            Name = "Bronze",
            MinPoints = 0,
            BadgeIcon = "bronze",
            ColorHex = "#CD7F32"
        };
        _context.AchievementLevels.Add(achievementLevel);

        var owner = new User
        {
            Id = _ownerId,
            UserName = "owner",
            Email = "owner@test.com",
            Timezone = "UTC",
            AchievementLevelId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(owner);

        var otherUser = new User
        {
            Id = _otherUserId,
            UserName = "other",
            Email = "other@test.com",
            Timezone = "UTC",
            AchievementLevelId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(otherUser);

        var category = new Category
        {
            Id = 1,
            Name = "Fitness",
            ColorHex = "#34D399",
            Icon = "dumbbell"
        };
        _context.Categories.Add(category);

        // Seed some goals for filtering tests.
        _context.Goals.AddRange(
            new Goal
            {
                Id = 100,
                UserId = _ownerId,
                Title = "Weekly Run",
                TimelineType = TimelineType.Weekly,
                Status = GoalStatus.Active,
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Goal
            {
                Id = 101,
                UserId = _ownerId,
                Title = "Monthly Reading",
                TimelineType = TimelineType.Monthly,
                Status = GoalStatus.Completed,
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)),
                CompletedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Goal
            {
                Id = 102,
                UserId = _ownerId,
                Title = "Yearly Savings",
                TimelineType = TimelineType.Yearly,
                Status = GoalStatus.Active,
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(365)),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Goal
            {
                Id = 200,
                UserId = _otherUserId,
                Title = "Other User Goal",
                TimelineType = TimelineType.Weekly,
                Status = GoalStatus.Active,
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        _context.SaveChanges();
    }

    [Fact]
    public async Task CreateGoalAsync_WithValidData_ReturnsGoalDto()
    {
        // Arrange
        var dto = new CreateGoalDto
        {
            Title = "Learn C#",
            Description = "Complete a C# course",
            TimelineType = TimelineType.Monthly,
            CategoryId = 1,
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30))
        };

        // Act
        var result = await _sut.CreateGoalAsync(_ownerId, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Learn C#", result.Title);
        Assert.Equal("Complete a C# course", result.Description);
        Assert.Equal(TimelineType.Monthly, result.TimelineType);
        Assert.Equal(GoalStatus.Active, result.Status);
        Assert.NotNull(result.Category);
        Assert.Equal("Fitness", result.Category.Name);
    }

    [Fact]
    public async Task CreateGoalAsync_WithTags_CreatesNewTags()
    {
        // Arrange
        var dto = new CreateGoalDto
        {
            Title = "Tagged Goal",
            TimelineType = TimelineType.Weekly,
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            TagNames = new List<string> { "health", "priority" }
        };

        // Act
        var result = await _sut.CreateGoalAsync(_ownerId, dto);

        // Assert
        Assert.Equal(2, result.Tags.Count);
        Assert.Contains(result.Tags, t => t.Name == "health");
        Assert.Contains(result.Tags, t => t.Name == "priority");

        // Verify tags were persisted.
        var tagsInDb = await _context.Tags.Where(t => t.UserId == _ownerId).ToListAsync();
        Assert.True(tagsInDb.Count >= 2);
    }

    [Fact]
    public async Task UpdateGoalAsync_AsOwner_UpdatesGoal()
    {
        // Arrange
        var dto = new UpdateGoalDto
        {
            Title = "Updated Weekly Run",
            Description = "Updated description"
        };

        // Act
        var result = await _sut.UpdateGoalAsync(_ownerId, 100, dto);

        // Assert
        Assert.Equal("Updated Weekly Run", result.Title);
        Assert.Equal("Updated description", result.Description);
    }

    [Fact]
    public async Task UpdateGoalAsync_AsNonOwner_ThrowsUnauthorized()
    {
        // Arrange
        var dto = new UpdateGoalDto { Title = "Hacked" };

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.UpdateGoalAsync(_otherUserId, 100, dto));
    }

    [Fact]
    public async Task DeleteGoalAsync_AsOwner_DeletesGoal()
    {
        // Arrange — use a known goal owned by the owner.
        var goalId = 100;

        // Act
        await _sut.DeleteGoalAsync(_ownerId, goalId);

        // Assert
        var goal = await _context.Goals.FindAsync(goalId);
        Assert.Null(goal);
    }

    [Fact]
    public async Task DeleteGoalAsync_AsNonOwner_ThrowsUnauthorized()
    {
        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.DeleteGoalAsync(_otherUserId, 100));
    }

    [Fact]
    public async Task CompleteGoalAsync_ActiveGoal_SetsCompletedStatus()
    {
        // Act
        var result = await _sut.CompleteGoalAsync(_ownerId, 100);

        // Assert
        Assert.NotNull(result);
        _pointsServiceMock.Verify(
            p => p.CalculateAndAwardPointsAsync(It.IsAny<User>(), It.IsAny<Goal>()),
            Times.Once);

        var goal = await _context.Goals.FindAsync(100);
        Assert.Equal(GoalStatus.Completed, goal!.Status);
        Assert.NotNull(goal.CompletedAt);
    }

    [Fact]
    public async Task CompleteGoalAsync_AlreadyCompleted_ThrowsInvalidOperation()
    {
        // Arrange — goal 101 is already completed in seed data.
        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CompleteGoalAsync(_ownerId, 101));
    }

    [Fact]
    public async Task GetGoalsAsync_FilterByTimelineType_ReturnsFilteredGoals()
    {
        // Act — filter by Weekly (value 1).
        var result = await _sut.GetGoalsAsync(_ownerId, (int)TimelineType.Weekly, null, null, null, 1, 10);

        // Assert
        Assert.All(result.Items, item => Assert.Equal(TimelineType.Weekly, item.TimelineType));
        Assert.Single(result.Items);
    }

    [Fact]
    public async Task GetGoalsAsync_FilterByStatus_ReturnsFilteredGoals()
    {
        // Act — filter by Completed (value 2).
        var result = await _sut.GetGoalsAsync(_ownerId, null, (int)GoalStatus.Completed, null, null, 1, 10);

        // Assert
        Assert.All(result.Items, item => Assert.Equal(GoalStatus.Completed, item.Status));
        Assert.Single(result.Items);
        Assert.Equal("Monthly Reading", result.Items[0].Title);
    }

    [Fact]
    public async Task GetGoalByIdAsync_AsOwner_ReturnsGoal()
    {
        // Act
        var result = await _sut.GetGoalByIdAsync(_ownerId, 100);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(100, result.Id);
        Assert.Equal("Weekly Run", result.Title);
    }

    [Fact]
    public async Task GetGoalByIdAsync_AsNonOwner_ThrowsUnauthorized()
    {
        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.GetGoalByIdAsync(_otherUserId, 100));
    }
}
