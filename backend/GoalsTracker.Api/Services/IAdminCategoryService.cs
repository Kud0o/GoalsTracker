// Defines the contract for admin-level category management operations.

using GoalsTracker.Api.Models.Dtos.Admin;
using GoalsTracker.Api.Models.Entities;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Provides admin-level CRUD operations for goal categories.
/// </summary>
public interface IAdminCategoryService
{
    /// <summary>
    /// Creates a new category with the specified details.
    /// </summary>
    /// <param name="dto">The category creation details.</param>
    /// <returns>The created category entity.</returns>
    Task<Category> CreateCategoryAsync(AdminCategoryDto dto);

    /// <summary>
    /// Updates an existing category with the specified details.
    /// </summary>
    /// <param name="id">The identifier of the category to update.</param>
    /// <param name="dto">The updated category details.</param>
    /// <returns>The updated category entity.</returns>
    Task<Category> UpdateCategoryAsync(int id, AdminCategoryDto dto);

    /// <summary>
    /// Deletes a category if it is not in use by any goals.
    /// </summary>
    /// <param name="id">The identifier of the category to delete.</param>
    /// <exception cref="InvalidOperationException">Thrown when the category is still assigned to goals.</exception>
    Task DeleteCategoryAsync(int id);

    /// <summary>
    /// Retrieves all categories ordered by their sort order.
    /// </summary>
    /// <returns>A list of all categories.</returns>
    Task<List<Category>> GetAllCategoriesAsync();
}
