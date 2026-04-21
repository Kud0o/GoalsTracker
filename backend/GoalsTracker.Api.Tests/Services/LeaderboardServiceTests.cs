// Tests for LeaderboardService covering ranking, privacy filtering, tie handling, and period-based queries.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Entities;
using GoalsTracker.Api.Models.Enums;
using GoalsTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Tests.Services;

/// <summary>
/// Unit tests for <see cref="LeaderboardService"/> verifying ranking logic,
/// privacy filtering, tied ranks, current user flag, and period-based queries.
/// </summary>
public class LeaderboardServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly LeaderboardService _sut;

    private readonly Guid _user1Id = Guid.NewGuid();
    private readonly Guid _user2Id = Guid.NewGuid();
    private readonly Guid _user3Id = Guid.NewGuid();
    private readonly Guid _privateUserId = Guid.NewGuid();

    public LeaderboardServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _sut = new LeaderboardService(_context);

        SeedDatabase();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private void SeedDatabase()
    {
        var level = new AchievementLevel
        {
            Id = 1,
            Name = "Bronze",
            MinPoints = 0,
            BadgeIcon = "bronze",
            ColorHex = "#CD7F32"
        };
        _context.AchievementLevels.Add(level);

        // User1: 300 points (public)
        _context.Users.Add(new User
        {
            Id = _user1Id,
            UserName = "Alice",
            Email = "alice@test.com",
            Timezone = "UTC",
            TotalPoints = 300,
            CurrentStreak = 5,
            IsPublicOnLeaderboard = true,
            AchievementLevelId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        // User2: 300 points (public, tied with User1)
        _context.Users.Add(new User
        {
            Id = _user2Id,
            UserName = "Bob",
            Email = "bob@test.com",
            Timezone = "UTC",
            TotalPoints = 300,
            CurrentStreak = 3,
            IsPublicOnLeaderboard = true,
            AchievementLevelId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        // User3: 100 points (public)
        _context.Users.Add(new User
        {
            Id = _user3Id,
            UserName = "Charlie",
            Email = "charlie@test.com",
            Timezone = "UTC",
            TotalPoints = 100,
            CurrentStreak = 1,
            IsPublicOnLeaderboard = true,
            AchievementLevelId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        // Private user: 500 points but hidden.
        _context.Users.Add(new User
        {
            Id = _privateUserId,
            UserName = "Ghost",
            Email = "ghost@test.com",
            Timezone = "UTC",
            TotalPoints = 500,
            CurrentStreak = 10,
            IsPublicOnLeaderboard = false,
            AchievementLevelId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        // Completed goals for goal count.
        _context.Goals.Add(new Goal
        {
            Id = 1,
            UserId = _user1Id,
            Title = "Alice Goal",
            TimelineType = TimelineType.Weekly,
            Status = GoalStatus.Completed,
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        // Point transactions for weekly filtering.
        _context.PointTransactions.Add(new PointTransaction
        {
            Id = 1,
            UserId = _user1Id,
            Points = 50,
            TransactionType = TransactionType.Completion,
            Description = "Recent completion",
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        });

        _context.PointTransactions.Add(new PointTransaction
        {
            Id = 2,
            UserId = _user3Id,
            Points = 80,
            TransactionType = TransactionType.Completion,
            Description = "Recent completion",
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        });

        _context.SaveChanges();
    }

    [Fact]
    public async Task GetLeaderboard_AllTime_ReturnsRankedUsers()
    {
        // Act
        var result = await _sut.GetLeaderboardAsync(null, "alltime", 1, 10);

        // Assert
        Assert.True(result.Items.Count >= 3);
        Assert.True(result.Items[0].TotalPoints >= result.Items[1].TotalPoints);
    }

    [Fact]
    public async Task GetLeaderboard_HidesPrivateUsers()
    {
        // Act
        var result = await _sut.GetLeaderboardAsync(null, "alltime", 1, 10);

        // Assert — Ghost (private user) should not appear.
        Assert.DoesNotContain(result.Items, item => item.UserName == "Ghost");
    }

    [Fact]
    public async Task GetLeaderboard_TiedUsers_ShareRank()
    {
        // Act
        var result = await _sut.GetLeaderboardAsync(null, "alltime", 1, 10);

        // Assert — Alice and Bob both have 300 points, should share rank 1.
        var alice = result.Items.FirstOrDefault(i => i.UserName == "Alice");
        var bob = result.Items.FirstOrDefault(i => i.UserName == "Bob");

        Assert.NotNull(alice);
        Assert.NotNull(bob);
        Assert.Equal(alice.Rank, bob.Rank);
    }

    [Fact]
    public async Task GetLeaderboard_SetsCurrentUserFlag()
    {
        // Act
        var result = await _sut.GetLeaderboardAsync(_user1Id, "alltime", 1, 10);

        // Assert
        var alice = result.Items.FirstOrDefault(i => i.UserName == "Alice");
        var bob = result.Items.FirstOrDefault(i => i.UserName == "Bob");

        Assert.NotNull(alice);
        Assert.True(alice.IsCurrentUser);
        Assert.NotNull(bob);
        Assert.False(bob.IsCurrentUser);
        Assert.NotNull(result.CurrentUserRank);
    }

    [Fact]
    public async Task GetLeaderboard_Weekly_FiltersByRecentPoints()
    {
        // Act
        var result = await _sut.GetLeaderboardAsync(null, "weekly", 1, 10);

        // Assert — only users with transactions in the last 7 days should appear.
        // User2 (Bob) has no recent transactions, so should not appear.
        Assert.DoesNotContain(result.Items, item => item.UserName == "Bob");

        // Charlie has 80 recent points, Alice has 50.
        if (result.Items.Count >= 2)
        {
            Assert.True(result.Items[0].TotalPoints >= result.Items[1].TotalPoints);
        }
    }
}
