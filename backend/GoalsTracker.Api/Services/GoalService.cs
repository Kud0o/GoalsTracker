// Implements goal CRUD operations, tag management, and goal completion with points integration.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Helpers;
using GoalsTracker.Api.Models.Dtos;
using GoalsTracker.Api.Models.Dtos.Goals;
using GoalsTracker.Api.Models.Entities;
using GoalsTracker.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Manages goal lifecycle operations including creation, updates, deletion, completion, and retrieval.
/// </summary>
public class GoalService : IGoalService
{
    private readonly AppDbContext _context;
    private readonly IPointsService _pointsService;

    /// <summary>
    /// Initializes a new instance of <see cref="GoalService"/>.
    /// </summary>
    /// <param name="context">The application database context.</param>
    /// <param name="pointsService">The points service for awarding completion points.</param>
    public GoalService(AppDbContext context, IPointsService pointsService)
    {
        _context = context;
        _pointsService = pointsService;
    }

    /// <inheritdoc />
    public async Task<GoalResponseDto> CreateGoalAsync(Guid userId, CreateGoalDto dto)
    {
        var goal = new Goal
        {
            UserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            TimelineType = dto.TimelineType,
            CategoryId = dto.CategoryId,
            ImageUrl = dto.ImageUrl,
            TargetDate = dto.TargetDate,
            Status = GoalStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        // Handle tags after the goal is saved so we have a valid GoalId.
        if (dto.TagNames is { Count: > 0 })
        {
            await SyncGoalTagsAsync(goal, userId, dto.TagNames);
            await _context.SaveChangesAsync();
        }

        return await LoadAndMapGoalAsync(goal.Id);
    }

    /// <inheritdoc />
    public async Task<GoalResponseDto> UpdateGoalAsync(Guid userId, int goalId, UpdateGoalDto dto)
    {
        var goal = await _context.Goals
            .Include(g => g.GoalTags)
            .FirstOrDefaultAsync(g => g.Id == goalId)
            ?? throw new KeyNotFoundException($"Goal with id {goalId} not found.");

        if (goal.UserId != userId)
        {
            throw new UnauthorizedAccessException("You do not own this goal.");
        }

        if (dto.Title is not null)
            goal.Title = dto.Title;

        if (dto.Description is not null)
            goal.Description = dto.Description;

        if (dto.TimelineType.HasValue)
            goal.TimelineType = dto.TimelineType.Value;

        if (dto.CategoryId.HasValue)
            goal.CategoryId = dto.CategoryId.Value;

        if (dto.TargetDate.HasValue)
            goal.TargetDate = dto.TargetDate.Value;

        if (dto.ImageUrl is not null)
            goal.ImageUrl = dto.ImageUrl;

        goal.UpdatedAt = DateTime.UtcNow;

        if (dto.TagNames is not null)
        {
            // Remove existing tags and sync new ones.
            _context.GoalTags.RemoveRange(goal.GoalTags);
            await SyncGoalTagsAsync(goal, userId, dto.TagNames);
        }

        await _context.SaveChangesAsync();

        return await LoadAndMapGoalAsync(goal.Id);
    }

    /// <inheritdoc />
    public async Task DeleteGoalAsync(Guid userId, int goalId)
    {
        var goal = await _context.Goals
            .FirstOrDefaultAsync(g => g.Id == goalId)
            ?? throw new KeyNotFoundException($"Goal with id {goalId} not found.");

        if (goal.UserId != userId)
        {
            throw new UnauthorizedAccessException("You do not own this goal.");
        }

        _context.Goals.Remove(goal);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task<GoalCompletionResultDto> CompleteGoalAsync(Guid userId, int goalId)
    {
        var goal = await _context.Goals
            .Include(g => g.Category)
            .Include(g => g.GoalTags).ThenInclude(gt => gt.Tag)
            .FirstOrDefaultAsync(g => g.Id == goalId)
            ?? throw new KeyNotFoundException($"Goal with id {goalId} not found.");

        if (goal.UserId != userId)
        {
            throw new UnauthorizedAccessException("You do not own this goal.");
        }

        if (goal.Status == GoalStatus.Completed)
        {
            throw new InvalidOperationException("This goal has already been completed.");
        }

        goal.Status = GoalStatus.Completed;
        goal.CompletedAt = DateTime.UtcNow;
        goal.UpdatedAt = DateTime.UtcNow;

        var user = await _context.Users
            .Include(u => u.AchievementLevel)
            .FirstAsync(u => u.Id == userId);

        var result = await _pointsService.CalculateAndAwardPointsAsync(user, goal);

        await _context.SaveChangesAsync();

        return result;
    }

    /// <inheritdoc />
    public async Task<PagedResponse<GoalResponseDto>> GetGoalsAsync(
        Guid userId,
        int? timelineType,
        int? status,
        int? categoryId,
        string? tag,
        int page,
        int pageSize)
    {
        var query = _context.Goals
            .Where(g => g.UserId == userId)
            .Include(g => g.Category)
            .Include(g => g.GoalTags).ThenInclude(gt => gt.Tag)
            .Include(g => g.AssignedByAdmin)
            .AsQueryable();

        if (timelineType.HasValue)
        {
            var tt = (TimelineType)timelineType.Value;
            query = query.Where(g => g.TimelineType == tt);
        }

        if (status.HasValue)
        {
            var s = (GoalStatus)status.Value;
            query = query.Where(g => g.Status == s);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(g => g.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(tag))
        {
            query = query.Where(g => g.GoalTags.Any(gt => gt.Tag.Name == tag));
        }

        query = query.OrderByDescending(g => g.CreatedAt);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResponse<GoalResponseDto>
        {
            Items = items.Select(MapGoalToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    /// <inheritdoc />
    public async Task<GoalResponseDto> GetGoalByIdAsync(Guid userId, int goalId)
    {
        var goal = await _context.Goals
            .Include(g => g.Category)
            .Include(g => g.GoalTags).ThenInclude(gt => gt.Tag)
            .FirstOrDefaultAsync(g => g.Id == goalId)
            ?? throw new KeyNotFoundException($"Goal with id {goalId} not found.");

        if (goal.UserId != userId)
        {
            throw new UnauthorizedAccessException("You do not own this goal.");
        }

        return MapGoalToDto(goal);
    }

    /// <summary>
    /// Synchronizes the tags for a goal by finding existing user tags or creating new ones.
    /// </summary>
    private async Task SyncGoalTagsAsync(Goal goal, Guid userId, List<string> tagNames)
    {
        foreach (var tagName in tagNames.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var existingTag = await _context.Tags
                .FirstOrDefaultAsync(t => t.UserId == userId && t.Name == tagName);

            if (existingTag is null)
            {
                existingTag = new Tag
                {
                    UserId = userId,
                    Name = tagName
                };
                _context.Tags.Add(existingTag);
                await _context.SaveChangesAsync();
            }

            _context.GoalTags.Add(new GoalTag
            {
                GoalId = goal.Id,
                TagId = existingTag.Id
            });
        }
    }

    /// <summary>
    /// Loads a goal with all includes from the database and maps it to a DTO.
    /// </summary>
    private async Task<GoalResponseDto> LoadAndMapGoalAsync(int goalId)
    {
        var goal = await _context.Goals
            .Include(g => g.Category)
            .Include(g => g.GoalTags).ThenInclude(gt => gt.Tag)
            .Include(g => g.AssignedByAdmin)
            .FirstAsync(g => g.Id == goalId);

        return MapGoalToDto(goal);
    }

    /// <summary>
    /// Maps a <see cref="Goal"/> entity to a <see cref="GoalResponseDto"/>.
    /// </summary>
    private static GoalResponseDto MapGoalToDto(Goal goal)
    {
        return new GoalResponseDto
        {
            Id = goal.Id,
            Title = goal.Title,
            Description = goal.Description,
            TimelineType = goal.TimelineType,
            Category = goal.Category is not null
                ? new CategoryDto
                {
                    Id = goal.Category.Id,
                    Name = goal.Category.Name,
                    ColorHex = goal.Category.ColorHex,
                    Icon = goal.Category.Icon
                }
                : null,
            Tags = goal.GoalTags.Select(gt => new TagDto
            {
                Id = gt.Tag.Id,
                Name = gt.Tag.Name
            }).ToList(),
            TargetDate = goal.TargetDate,
            Status = goal.Status,
            CompletedAt = goal.CompletedAt,
            PointsAwarded = goal.PointsAwarded,
            ImageUrl = goal.ImageUrl,
            CreatedAt = goal.CreatedAt,
            IsAdminAssigned = goal.AssignedByAdminId != null,
            AssignedByAdminName = goal.AssignedByAdmin?.UserName
        };
    }
}
