// Provides extension methods for converting IQueryable sources into paginated responses.

using GoalsTracker.Api.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Helpers;

/// <summary>
/// Static helper class with extension methods for query pagination.
/// </summary>
public static class PaginationHelper
{
    /// <summary>
    /// Asynchronously paginates an <see cref="IQueryable{T}"/> source and returns a <see cref="PagedResponse{T}"/>.
    /// </summary>
    /// <typeparam name="T">The type of elements in the query.</typeparam>
    /// <param name="query">The queryable source to paginate.</param>
    /// <param name="page">The 1-based page number to retrieve.</param>
    /// <param name="pageSize">The maximum number of items per page.</param>
    /// <returns>A <see cref="PagedResponse{T}"/> containing the paginated items and metadata.</returns>
    public static async Task<PagedResponse<T>> ToPagedResponseAsync<T>(
        this IQueryable<T> query,
        int page,
        int pageSize)
    {
        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResponse<T>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}
