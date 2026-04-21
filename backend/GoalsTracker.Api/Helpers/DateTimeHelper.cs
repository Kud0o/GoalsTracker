// Provides utility methods for timezone conversions, overdue checks, and timeline progress calculations.

namespace GoalsTracker.Api.Helpers;

/// <summary>
/// Static helper class with date and time utility methods for goal tracking.
/// </summary>
public static class DateTimeHelper
{
    /// <summary>
    /// Determines whether a goal's target date has passed in the user's local timezone.
    /// </summary>
    /// <param name="targetDate">The goal's target completion date.</param>
    /// <param name="timezone">The IANA timezone identifier (e.g. "America/New_York").</param>
    /// <returns><c>true</c> if the target date is in the past; otherwise <c>false</c>.</returns>
    public static bool IsOverdue(DateOnly targetDate, string timezone)
    {
        var timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(timezone);
        var userNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneInfo);
        var userToday = DateOnly.FromDateTime(userNow);

        return targetDate < userToday;
    }

    /// <summary>
    /// Calculates the progress of a goal's timeline as a value between 0 and 1.
    /// Returns 0 when the goal was just created and 1 when the target date has been reached or passed.
    /// </summary>
    /// <param name="createdDate">The date the goal was created.</param>
    /// <param name="targetDate">The goal's target completion date.</param>
    /// <returns>A decimal between 0 and 1 representing the timeline progress.</returns>
    public static decimal GetTimelineProgress(DateOnly createdDate, DateOnly targetDate)
    {
        var totalDays = targetDate.DayNumber - createdDate.DayNumber;

        if (totalDays <= 0)
            return 1m;

        var elapsedDays = DateOnly.FromDateTime(DateTime.UtcNow).DayNumber - createdDate.DayNumber;

        if (elapsedDays <= 0)
            return 0m;

        var progress = (decimal)elapsedDays / totalDays;

        return Math.Clamp(progress, 0m, 1m);
    }

    /// <summary>
    /// Converts a UTC <see cref="DateTime"/> to the specified user timezone.
    /// </summary>
    /// <param name="utcTime">The UTC date and time to convert.</param>
    /// <param name="timezone">The IANA timezone identifier (e.g. "America/New_York").</param>
    /// <returns>The converted <see cref="DateTime"/> in the user's local timezone.</returns>
    public static DateTime ConvertToUserTimezone(DateTime utcTime, string timezone)
    {
        var timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(timezone);
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcTime, DateTimeKind.Utc), timeZoneInfo);
    }
}
