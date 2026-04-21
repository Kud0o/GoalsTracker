// Handles read-only category listing for goal classification.

using GoalsTracker.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Controllers;

/// <summary>
/// Provides a public endpoint for listing available goal categories.
/// </summary>
[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public CategoriesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Retrieves all categories ordered by their sort order.
    /// </summary>
    /// <returns>A list of all available categories.</returns>
    [HttpGet("")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _dbContext.Categories
            .OrderBy(c => c.SortOrder)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.ColorHex,
                c.Icon,
                c.SortOrder
            })
            .ToListAsync();

        return Ok(categories);
    }
}
