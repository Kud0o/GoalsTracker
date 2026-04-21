// AppDbContext.cs — EF Core database context for GoalsTracker.
// Configures entity relationships, indexes, and Identity integration.

using GoalsTracker.Api.Models.Entities;
using GoalsTracker.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Data;

/// <summary>
/// Primary database context for GoalsTracker. Extends IdentityDbContext
/// to integrate ASP.NET Identity with custom User entity.
/// </summary>
public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<GoalTag> GoalTags => Set<GoalTag>();
    public DbSet<PointTransaction> PointTransactions => Set<PointTransaction>();
    public DbSet<AchievementLevel> AchievementLevels => Set<AchievementLevel>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // --- User configuration ---
        builder.Entity<User>(e =>
        {
            e.Property(u => u.Timezone).HasMaxLength(50).HasDefaultValue("UTC");
            e.Property(u => u.TotalPoints).HasDefaultValue(0);
            e.Property(u => u.CurrentStreak).HasDefaultValue(0);
            e.Property(u => u.BestStreak).HasDefaultValue(0);
            e.Property(u => u.IsPublicOnLeaderboard).HasDefaultValue(true);
            e.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasIndex(u => u.TotalPoints).IsDescending();
            e.HasIndex(u => u.AchievementLevelId);
            e.HasOne(u => u.AchievementLevel)
                .WithMany(a => a.Users)
                .HasForeignKey(u => u.AchievementLevelId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // --- Goal configuration ---
        builder.Entity<Goal>(e =>
        {
            e.Property(g => g.Title).HasMaxLength(200).IsRequired();
            e.Property(g => g.Description).HasMaxLength(2000);
            e.Property(g => g.TimelineType).HasConversion<byte>();
            e.Property(g => g.Status).HasConversion<byte>().HasDefaultValue(GoalStatus.Active);
            e.Property(g => g.PointsAwarded).HasDefaultValue(0);
            e.Property(g => g.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasIndex(g => new { g.UserId, g.Status });
            e.HasIndex(g => new { g.UserId, g.TimelineType });
            e.HasIndex(g => new { g.TargetDate, g.Status });
            e.HasOne(g => g.User)
                .WithMany(u => u.Goals)
                .HasForeignKey(g => g.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(g => g.Category)
                .WithMany(c => c.Goals)
                .HasForeignKey(g => g.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // --- Category configuration ---
        builder.Entity<Category>(e =>
        {
            e.Property(c => c.Name).HasMaxLength(50).IsRequired();
            e.Property(c => c.ColorHex).HasMaxLength(7).IsRequired();
            e.Property(c => c.Icon).HasMaxLength(50).IsRequired();
            e.HasIndex(c => c.Name).IsUnique();
        });

        // --- Tag configuration ---
        builder.Entity<Tag>(e =>
        {
            e.Property(t => t.Name).HasMaxLength(50).IsRequired();
            e.HasIndex(t => new { t.UserId, t.Name }).IsUnique();
            e.HasOne(t => t.User)
                .WithMany(u => u.Tags)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // --- GoalTag join table ---
        builder.Entity<GoalTag>(e =>
        {
            e.HasKey(gt => new { gt.GoalId, gt.TagId });
            e.HasOne(gt => gt.Goal)
                .WithMany(g => g.GoalTags)
                .HasForeignKey(gt => gt.GoalId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(gt => gt.Tag)
                .WithMany(t => t.GoalTags)
                .HasForeignKey(gt => gt.TagId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // --- PointTransaction configuration ---
        builder.Entity<PointTransaction>(e =>
        {
            e.Property(p => p.TransactionType).HasConversion<byte>();
            e.Property(p => p.Description).HasMaxLength(200).IsRequired();
            e.Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasIndex(p => new { p.UserId, p.CreatedAt });
            e.HasIndex(p => new { p.UserId, p.TransactionType });
            e.HasOne(p => p.User)
                .WithMany(u => u.PointTransactions)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.Goal)
                .WithMany(g => g.PointTransactions)
                .HasForeignKey(p => p.GoalId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // --- AchievementLevel configuration ---
        builder.Entity<AchievementLevel>(e =>
        {
            e.Property(a => a.Name).HasMaxLength(50).IsRequired();
            e.Property(a => a.BadgeIcon).HasMaxLength(50).IsRequired();
            e.Property(a => a.ColorHex).HasMaxLength(7).IsRequired();
            e.HasIndex(a => a.Name).IsUnique();
            e.HasIndex(a => a.MinPoints).IsUnique();
        });
    }
}
