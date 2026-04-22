// Tests for AdminCategoryService covering CRUD operations, uniqueness constraints, and referential integrity.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Dtos.Admin;
using GoalsTracker.Api.Models.Entities;
using GoalsTracker.Api.Models.Enums;
using GoalsTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Tests.Services;

/// <summary>
/// Unit tests for <see cref="AdminCategoryService"/> using an InMemory EF Core database.
/// </summary>
public class AdminCategoryServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly AdminCategoryService _sut;
    private readonly Guid _userId = Guid.NewGuid();

    public AdminCategoryServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _sut = new AdminCategoryService(_context);

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

        var user = new User
        {
            Id = _userId,
            UserName = "testuser",
            Email = "test@test.com",
            Timezone = "UTC",
            AchievementLevelId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);

        _context.Categories.AddRange(
            new Category { Id = 1, Name = "Fitness", ColorHex = "#34D399", Icon = "dumbbell", SortOrder = 1 },
            new Category { Id = 2, Name = "Finance", ColorHex = "#3B82F6", Icon = "wallet", SortOrder = 2 },
            new Category { Id = 3, Name = "Learning", ColorHex = "#8B5CF6", Icon = "book", SortOrder = 3 }
        );

        // Add a goal using the Fitness category so we can test deletion protection.
        _context.Goals.Add(new Goal
        {
            Id = 100,
            UserId = _userId,
            Title = "Run 5K",
            TimelineType = TimelineType.Weekly,
            Status = GoalStatus.Active,
            CategoryId = 1,
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        _context.SaveChanges();
    }

    // --- CreateCategoryAsync Tests ---

    [Fact]
    public async Task CreateCategoryAsync_ValidData_CreatesCategory()
    {
        // Arrange
        var dto = new AdminCategoryDto
        {
            Name = "Health",
            ColorHex = "#EF4444",
            Icon = "heart",
            SortOrder = 4
        };

        // Act
        var result = await _sut.CreateCategoryAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Id > 0);
        Assert.Equal("Health", result.Name);
        Assert.Equal("#EF4444", result.ColorHex);
        Assert.Equal("heart", result.Icon);
        Assert.Equal(4, result.SortOrder);

        // Verify persisted in database.
        var category = await _context.Categories.FindAsync(result.Id);
        Assert.NotNull(category);
        Assert.Equal("Health", category.Name);
    }

    [Fact]
    public async Task CreateCategoryAsync_DuplicateName_ThrowsInvalidOperation()
    {
        // Arrange — "Fitness" already exists in seed data.
        var dto = new AdminCategoryDto
        {
            Name = "Fitness",
            ColorHex = "#FF0000",
            Icon = "running",
            SortOrder = 5
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateCategoryAsync(dto));
        Assert.Contains("Fitness", ex.Message);
    }

    // --- UpdateCategoryAsync Tests ---

    [Fact]
    public async Task UpdateCategoryAsync_ExistingCategory_UpdatesFields()
    {
        // Arrange
        var dto = new AdminCategoryDto
        {
            Name = "Fitness Updated",
            ColorHex = "#10B981",
            Icon = "running",
            SortOrder = 10
        };

        // Act
        var result = await _sut.UpdateCategoryAsync(1, dto);

        // Assert
        Assert.Equal(1, result.Id);
        Assert.Equal("Fitness Updated", result.Name);
        Assert.Equal("#10B981", result.ColorHex);
        Assert.Equal("running", result.Icon);
        Assert.Equal(10, result.SortOrder);

        // Verify persisted.
        var category = await _context.Categories.FindAsync(1);
        Assert.NotNull(category);
        Assert.Equal("Fitness Updated", category.Name);
    }

    [Fact]
    public async Task UpdateCategoryAsync_NotFound_ThrowsKeyNotFound()
    {
        // Arrange
        var dto = new AdminCategoryDto
        {
            Name = "Ghost",
            ColorHex = "#000000",
            Icon = "ghost",
            SortOrder = 0
        };

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _sut.UpdateCategoryAsync(999, dto));
    }

    // --- DeleteCategoryAsync Tests ---

    [Fact]
    public async Task DeleteCategoryAsync_NoGoalsUsingIt_DeletesCategory()
    {
        // Arrange — category 3 (Learning) has no goals using it.
        var categoryId = 3;

        // Verify it exists before deletion.
        var before = await _context.Categories.FindAsync(categoryId);
        Assert.NotNull(before);

        // Act
        await _sut.DeleteCategoryAsync(categoryId);

        // Assert
        var after = await _context.Categories.FindAsync(categoryId);
        Assert.Null(after);
    }

    [Fact]
    public async Task DeleteCategoryAsync_GoalsUsingIt_ThrowsInvalidOperationWithCount()
    {
        // Arrange — category 1 (Fitness) has 1 goal using it (Goal 100).
        var categoryId = 1;

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.DeleteCategoryAsync(categoryId));

        // The error message should include the goal count.
        Assert.Contains("1", ex.Message);
        Assert.Contains("Fitness", ex.Message);
    }
}
