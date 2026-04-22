// Implements admin-level goal operations: batch assignment, user goal queries, and user listing.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Dtos;
using GoalsTracker.Api.Models.Dtos.Admin;
using GoalsTracker.Api.Models.Dtos.Goals;
using GoalsTracker.Api.Models.Entities;
using GoalsTracker.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Handles admin-level goal operations including batch goal assignment,
/// user-scoped goal retrieval, and user listing with statistics.
/// </summary>
public class AdminGoalService : IAdminGoalService
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;

    /// <summary>
    /// Initializes a new instance of <see cref="AdminGoalService"/>.
    /// </summary>
    /// <param name="context">The application database context.</param>
    /// <param name="userManager">The ASP.NET Identity user manager.</param>
    public AdminGoalService(AppDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    /// <inheritdoc />
    public async Task<AdminBatchResultDto> AssignGoalsAsync(Guid adminId, AdminAssignGoalDto dto)
    {
        var goals = new List<Goal>();
        var resultItems = new List<AdminBatchGoalItem>();

        foreach (var userId in dto.UserIds)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString())
                ?? throw new KeyNotFoundException($"User with id {userId} not found.");

            var goal = new Goal
            {
                UserId = userId,
                Title = dto.Title,
                Description = dto.Description,
                TimelineType = dto.TimelineType,
                CategoryId = dto.CategoryId,
                TargetDate = dto.TargetDate,
                ImageUrl = dto.ImageUrl,
                Status = GoalStatus.Active,
                AssignedByAdminId = adminId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            goals.Add(goal);
            _context.Goals.Add(goal);

            resultItems.Add(new AdminBatchGoalItem
            {
                UserId = userId,
                UserName = user.UserName ?? string.Empty,
                Title = dto.Title
            });
        }

        await _context.SaveChangesAsync();

        // Populate GoalIds after save so EF has generated them.
        for (var i = 0; i < goals.Count; i++)
        {
            resultItems[i].GoalId = goals[i].Id;
        }

        return new AdminBatchResultDto
        {
            GoalsCreated = goals.Count,
            Goals = resultItems
        };
    }

    /// <inheritdoc />
    public async Task<PagedResponse<GoalResponseDto>> GetUserGoalsAsync(
        Guid userId, string? source, int page, int pageSize)
    {
        var query = _context.Goals
            .Where(g => g.UserId == userId)
            .Include(g => g.Category)
            .Include(g => g.GoalTags).ThenInclude(gt => gt.Tag)
            .Include(g => g.AssignedByAdmin)
            .AsQueryable();

        if (string.Equals(source, "admin", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(g => g.AssignedByAdminId != null);
        }
        else if (string.Equals(source, "user", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(g => g.AssignedByAdminId == null);
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
    public async Task<PagedResponse<AdminUserListDto>> GetAllUsersAsync(
        string? search, int page, int pageSize)
    {
        var query = _context.Users
            .Include(u => u.AchievementLevel)
            .Include(u => u.Goals)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u => u.UserName != null && u.UserName.Contains(search));
        }

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderBy(u => u.UserName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new List<AdminUserListDto>();

        foreach (var user in users)
        {
            var totalGoals = user.Goals.Count;
            var completedGoals = user.Goals.Count(g => g.Status == GoalStatus.Completed);
            var completionRate = totalGoals > 0
                ? Math.Round((decimal)completedGoals / totalGoals * 100, 1)
                : 0m;
            var adminAssignedGoals = user.Goals.Count(g => g.AssignedByAdminId != null);
            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");

            result.Add(new AdminUserListDto
            {
                UserId = user.Id,
                UserName = user.UserName ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? string.Empty,
                TotalGoals = totalGoals,
                CompletedGoals = completedGoals,
                CompletionRate = completionRate,
                TotalPoints = user.TotalPoints,
                AchievementLevel = user.AchievementLevel?.Name ?? string.Empty,
                AdminAssignedGoals = adminAssignedGoals,
                IsAdmin = isAdmin,
                MemberSince = user.CreatedAt
            });
        }

        return new PagedResponse<AdminUserListDto>
        {
            Items = result,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
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
