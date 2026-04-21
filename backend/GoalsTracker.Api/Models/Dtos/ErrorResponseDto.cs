// Standardized error response returned by all API error handlers.

namespace GoalsTracker.Api.Models.Dtos;

/// <summary>
/// Represents a standardized API error response.
/// </summary>
public class ErrorResponseDto
{
    /// <summary>A short error code or category (e.g. "ValidationError", "NotFound").</summary>
    public string Error { get; set; } = string.Empty;

    /// <summary>A human-readable description of the error.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Optional additional details such as field-level validation errors.</summary>
    public object? Details { get; set; }
}
