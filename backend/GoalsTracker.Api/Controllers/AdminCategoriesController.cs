// Handles admin-level category CRUD operations.

using GoalsTracker.Api.Models.Dtos.Admin;
using GoalsTracker.Api.Models.Entities;
using GoalsTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoalsTracker.Api.Controllers;

/// <summary>
/// Provides admin-only endpoints for managing goal categories.
/// </summary>
[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
public class AdminCategoriesController : ControllerBase
{
    private readonly IAdminCategoryService _adminCategoryService;

    /// <summary>
    /// Initializes a new instance of <see cref="AdminCategoriesController"/>.
    /// </summary>
    /// <param name="adminCategoryService">The admin category service.</param>
    public AdminCategoriesController(IAdminCategoryService adminCategoryService)
    {
        _adminCategoryService = adminCategoryService;
    }

    /// <summary>
    /// Retrieves all categories ordered by sort order.
    /// </summary>
    /// <returns>A list of all categories.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<Category>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _adminCategoryService.GetAllCategoriesAsync();
        return Ok(categories);
    }

    /// <summary>
    /// Creates a new category.
    /// </summary>
    /// <param name="dto">The category creation details.</param>
    /// <returns>The created category.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(Category), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] AdminCategoryDto dto)
    {
        var category = await _adminCategoryService.CreateCategoryAsync(dto);
        return StatusCode(StatusCodes.Status201Created, category);
    }

    /// <summary>
    /// Updates an existing category.
    /// </summary>
    /// <param name="id">The identifier of the category to update.</param>
    /// <param name="dto">The updated category details.</param>
    /// <returns>The updated category.</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(Category), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] AdminCategoryDto dto)
    {
        var category = await _adminCategoryService.UpdateCategoryAsync(id, dto);
        return Ok(category);
    }

    /// <summary>
    /// Deletes a category if it is not in use by any goals.
    /// </summary>
    /// <param name="id">The identifier of the category to delete.</param>
    /// <returns>No content on success, or 409 Conflict if the category is in use.</returns>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _adminCategoryService.DeleteCategoryAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}
