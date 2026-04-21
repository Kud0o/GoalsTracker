// Implements points calculation, streak tracking, achievement promotion, and history retrieval.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Helpers;
using GoalsTracker.Api.Models.Dtos;
using GoalsTracker.Api.Models.Dtos.Goals;
using GoalsTracker.Api.Models.Dtos.Points;
using GoalsTracker.Api.Models.Entities;
using GoalsTracker.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Calculates point awards for goal completions, manages streaks, and provides points history and summaries.
/// </summary>
public class PointsService : IPointsService
{
    private readonly AppDbContext _context;

    /// <summary>
    /// Initializes a new instance of <see cref="PointsService"/>.
    /// </summary>
    /// <param name="context">The application database context.</param>
    public PointsService(AppDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<GoalCompletionResultDto> CalculateAndAwardPointsAsync(User user, Goal goal)
    {
        var basePoints = GetBasePoints(goal.TimelineType);
        var earlyBonus = 0;
        var streakBonus = 0;

        // Create base completion transaction.
        _context.PointTransactions.Add(new PointTransaction
        {
            UserId = user.Id,
            GoalId = goal.Id,
            Points = basePoints,
            TransactionType = TransactionType.Completion,
            Description = $"Completed {goal.TimelineType.ToString().ToLower()} goal: {goal.Title}",
            CreatedAt = DateTime.UtcNow
        });

        // Check early completion: completed before 50% of timeline elapsed.
        var createdDate = DateOnly.FromDateTime(goal.CreatedAt);
        var timelineProgress = DateTimeHelper.GetTimelineProgress(createdDate, goal.TargetDate);

        if (timelineProgress < 0.5m)
        {
            earlyBonus = (int)(basePoints * 0.5m);
            _context.PointTransactions.Add(new PointTransaction
            {
                UserId = user.Id,
                GoalId = goal.Id,
                Points = earlyBonus,
                TransactionType = TransactionType.EarlyBonus,
                Description = $"Early completion bonus for: {goal.Title}",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Update streak.
        user.CurrentStreak++;
        if (user.CurrentStreak > user.BestStreak)
        {
            user.BestStreak = user.CurrentStreak;
        }

        // Check streak bonus thresholds.
        streakBonus = GetStreakBonus(goal.TimelineType, user.CurrentStreak);
        if (streakBonus > 0)
        {
            _context.PointTransactions.Add(new PointTransaction
            {
                UserId = user.Id,
                GoalId = goal.Id,
                Points = streakBonus,
                TransactionType = TransactionType.Streak,
                Description = $"Streak bonus ({user.CurrentStreak} streak) for: {goal.Title}",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Update totals.
        var totalAwarded = basePoints + earlyBonus + streakBonus;
        user.TotalPoints += totalAwarded;
        goal.PointsAwarded = totalAwarded;
        user.UpdatedAt = DateTime.UtcNow;

        // Check achievement level promotion.
        var previousLevelName = user.AchievementLevel.Name;
        var newLevel = await _context.AchievementLevels
            .Where(a => a.MinPoints <= user.TotalPoints)
            .OrderByDescending(a => a.MinPoints)
            .FirstAsync();

        var levelChanged = newLevel.Id != user.AchievementLevelId;
        user.AchievementLevelId = newLevel.Id;
        user.AchievementLevel = newLevel;

        // Build the response DTO.
        return new GoalCompletionResultDto
        {
            Goal = MapGoalToDto(goal),
            PointsEarned = new PointsBreakdownDto
            {
                Base = basePoints,
                EarlyBonus = earlyBonus,
                StreakBonus = streakBonus,
                Total = totalAwarded
            },
            NewTotalPoints = user.TotalPoints,
            NewStreak = user.CurrentStreak,
            AchievementLevel = new AchievementLevelDto
            {
                Name = newLevel.Name,
                Changed = levelChanged
            }
        };
    }

    /// <inheritdoc />
    public async Task<PagedResponse<PointHistoryDto>> GetPointsHistoryAsync(Guid userId, int page, int pageSize)
    {
        var query = _context.PointTransactions
            .Where(p => p.UserId == userId)
            .Include(p => p.Goal)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PointHistoryDto
            {
                Id = p.Id,
                GoalId = p.GoalId,
                GoalTitle = p.Goal != null ? p.Goal.Title : null,
                Points = p.Points,
                TransactionType = p.TransactionType,
                Description = p.Description,
                CreatedAt = p.CreatedAt
            });

        return await query.ToPagedResponseAsync(page, pageSize);
    }

    /// <inheritdoc />
    public async Task<PointsSummaryDto> GetPointsSummaryAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.AchievementLevel)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException($"User with id {userId} not found.");

        var now = DateTime.UtcNow;

        // Calculate start of current week (Monday).
        var daysSinceMonday = ((int)now.DayOfWeek + 6) % 7;
        var weekStart = now.AddDays(-daysSinceMonday).Date;

        // Calculate start of current month.
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var thisWeek = await _context.PointTransactions
            .Where(p => p.UserId == userId && p.CreatedAt >= weekStart)
            .SumAsync(p => p.Points);

        var thisMonth = await _context.PointTransactions
            .Where(p => p.UserId == userId && p.CreatedAt >= monthStart)
            .SumAsync(p => p.Points);

        // Find next achievement level.
        var nextLevel = await _context.AchievementLevels
            .Where(a => a.MinPoints > user.TotalPoints)
            .OrderBy(a => a.MinPoints)
            .FirstOrDefaultAsync();

        return new PointsSummaryDto
        {
            TotalPoints = user.TotalPoints,
            CurrentStreak = user.CurrentStreak,
            BestStreak = user.BestStreak,
            AchievementLevel = new AchievementLevelInfoDto
            {
                Name = user.AchievementLevel.Name,
                MinPoints = user.AchievementLevel.MinPoints,
                NextLevel = nextLevel is not null
                    ? new NextLevelDto
                    {
                        Name = nextLevel.Name,
                        MinPoints = nextLevel.MinPoints,
                        PointsNeeded = nextLevel.MinPoints - user.TotalPoints
                    }
                    : null
            },
            ThisWeek = thisWeek,
            ThisMonth = thisMonth
        };
    }

    /// <summary>
    /// Returns the base point value for a given timeline type.
    /// </summary>
    private static int GetBasePoints(TimelineType timelineType) => timelineType switch
    {
        TimelineType.Weekly => 10,
        TimelineType.Monthly => 50,
        TimelineType.Yearly => 200,
        _ => 10
    };

    /// <summary>
    /// Returns the streak bonus points based on timeline type and current streak count.
    /// </summary>
    private static int GetStreakBonus(TimelineType timelineType, int currentStreak) => timelineType switch
    {
        TimelineType.Weekly => currentStreak switch
        {
            3 => 5,
            7 => 15,
            14 => 30,
            _ => 0
        },
        TimelineType.Monthly => currentStreak switch
        {
            3 => 25,
            6 => 50,
            _ => 0
        },
        TimelineType.Yearly => currentStreak switch
        {
            2 => 100,
            _ => 0
        },
        _ => 0
    };

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
            CreatedAt = goal.CreatedAt
        };
    }
}
