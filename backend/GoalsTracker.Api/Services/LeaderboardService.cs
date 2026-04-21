// Implements leaderboard retrieval with period-based ranking and current user position tracking.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Dtos.Leaderboard;
using GoalsTracker.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Retrieves ranked leaderboard data with support for weekly, monthly, and all-time periods.
/// </summary>
public class LeaderboardService : ILeaderboardService
{
    private readonly AppDbContext _context;

    /// <summary>
    /// Initializes a new instance of <see cref="LeaderboardService"/>.
    /// </summary>
    /// <param name="context">The application database context.</param>
    public LeaderboardService(AppDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<LeaderboardResponseDto> GetLeaderboardAsync(
        Guid? currentUserId,
        string? period,
        int page,
        int pageSize)
    {
        var normalizedPeriod = (period ?? "alltime").ToLowerInvariant();
        var now = DateTime.UtcNow;

        // Build the ranked entries based on the requested period.
        List<RankedEntry> allRanked;

        if (normalizedPeriod is "weekly" or "monthly")
        {
            var cutoff = normalizedPeriod == "weekly"
                ? now.AddDays(-7)
                : now.AddDays(-30);

            // Sum points from transactions within the period for public users.
            var periodPoints = await _context.PointTransactions
                .Where(pt => pt.CreatedAt >= cutoff)
                .Where(pt => pt.User.IsPublicOnLeaderboard)
                .GroupBy(pt => pt.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    Points = g.Sum(pt => pt.Points)
                })
                .ToListAsync();

            var userIds = periodPoints.Select(pp => pp.UserId).ToList();

            var users = await _context.Users
                .Include(u => u.AchievementLevel)
                .Where(u => userIds.Contains(u.Id))
                .ToListAsync();

            var goalsCompletedMap = await _context.Goals
                .Where(g => userIds.Contains(g.UserId) && g.Status == GoalStatus.Completed)
                .GroupBy(g => g.UserId)
                .Select(g => new { UserId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.UserId, x => x.Count);

            allRanked = periodPoints
                .OrderByDescending(pp => pp.Points)
                .Select((pp, index) =>
                {
                    var user = users.First(u => u.Id == pp.UserId);
                    goalsCompletedMap.TryGetValue(pp.UserId, out var goalsCompleted);
                    return new RankedEntry
                    {
                        Rank = index + 1,
                        UserId = pp.UserId,
                        UserName = user.UserName ?? string.Empty,
                        TotalPoints = pp.Points,
                        GoalsCompleted = goalsCompleted,
                        CurrentStreak = user.CurrentStreak,
                        AchievementLevel = user.AchievementLevel.Name,
                        BadgeIcon = user.AchievementLevel.BadgeIcon,
                        AchievementColor = user.AchievementLevel.ColorHex
                    };
                })
                .ToList();
        }
        else
        {
            // All-time: use TotalPoints directly.
            var users = await _context.Users
                .Include(u => u.AchievementLevel)
                .Where(u => u.IsPublicOnLeaderboard)
                .OrderByDescending(u => u.TotalPoints)
                .ToListAsync();

            var userIds = users.Select(u => u.Id).ToList();
            var goalsCompletedMap = await _context.Goals
                .Where(g => userIds.Contains(g.UserId) && g.Status == GoalStatus.Completed)
                .GroupBy(g => g.UserId)
                .Select(g => new { UserId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.UserId, x => x.Count);

            allRanked = users
                .Select((u, index) =>
                {
                    goalsCompletedMap.TryGetValue(u.Id, out var goalsCompleted);
                    return new RankedEntry
                    {
                        Rank = index + 1,
                        UserId = u.Id,
                        UserName = u.UserName ?? string.Empty,
                        TotalPoints = u.TotalPoints,
                        GoalsCompleted = goalsCompleted,
                        CurrentStreak = u.CurrentStreak,
                        AchievementLevel = u.AchievementLevel.Name,
                        BadgeIcon = u.AchievementLevel.BadgeIcon,
                        AchievementColor = u.AchievementLevel.ColorHex
                    };
                })
                .ToList();
        }

        // Apply dense ranking (users with same points get same rank).
        ApplyDenseRanking(allRanked);

        var totalCount = allRanked.Count;

        // Paginate.
        var pagedItems = allRanked
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        // Determine current user rank.
        int? currentUserRank = null;
        if (currentUserId.HasValue)
        {
            var currentEntry = allRanked.FirstOrDefault(r => r.UserId == currentUserId.Value);
            currentUserRank = currentEntry?.Rank;
        }

        return new LeaderboardResponseDto
        {
            Items = pagedItems.Select(r => new LeaderboardEntryDto
            {
                Rank = r.Rank,
                UserName = r.UserName,
                TotalPoints = r.TotalPoints,
                GoalsCompleted = r.GoalsCompleted,
                CurrentStreak = r.CurrentStreak,
                AchievementLevel = r.AchievementLevel,
                BadgeIcon = r.BadgeIcon,
                AchievementColor = r.AchievementColor,
                IsCurrentUser = currentUserId.HasValue && r.UserId == currentUserId.Value
            }).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            CurrentUserRank = currentUserRank
        };
    }

    /// <summary>
    /// Applies dense ranking to a pre-sorted list of entries (same points receive same rank).
    /// </summary>
    private static void ApplyDenseRanking(List<RankedEntry> entries)
    {
        if (entries.Count == 0) return;

        var rank = 1;
        entries[0].Rank = rank;

        for (var i = 1; i < entries.Count; i++)
        {
            if (entries[i].TotalPoints < entries[i - 1].TotalPoints)
            {
                rank++;
            }

            entries[i].Rank = rank;
        }
    }

    /// <summary>
    /// Internal model used during leaderboard computation before mapping to DTOs.
    /// </summary>
    private class RankedEntry
    {
        public int Rank { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int TotalPoints { get; set; }
        public int GoalsCompleted { get; set; }
        public int CurrentStreak { get; set; }
        public string AchievementLevel { get; set; } = string.Empty;
        public string? BadgeIcon { get; set; }
        public string? AchievementColor { get; set; }
    }
}
