// Implements admin-level category CRUD operations with uniqueness and referential integrity checks.

using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Dtos.Admin;
using GoalsTracker.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Handles admin-level category management including creation, updates,
/// deletion with referential integrity checks, and retrieval.
/// </summary>
public class AdminCategoryService : IAdminCategoryService
{
    private readonly AppDbContext _context;

    /// <summary>
    /// Initializes a new instance of <see cref="AdminCategoryService"/>.
    /// </summary>
    /// <param name="context">The application database context.</param>
    public AdminCategoryService(AppDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<Category> CreateCategoryAsync(AdminCategoryDto dto)
    {
        var nameExists = await _context.Categories.AnyAsync(c => c.Name == dto.Name);

        if (nameExists)
        {
            throw new InvalidOperationException($"A category with the name '{dto.Name}' already exists.");
        }

        var category = new Category
        {
            Name = dto.Name,
            ColorHex = dto.ColorHex,
            Icon = dto.Icon,
            SortOrder = dto.SortOrder
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return category;
    }

    /// <inheritdoc />
    public async Task<Category> UpdateCategoryAsync(int id, AdminCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id)
            ?? throw new KeyNotFoundException($"Category with id {id} not found.");

        var nameExists = await _context.Categories.AnyAsync(c => c.Name == dto.Name && c.Id != id);

        if (nameExists)
        {
            throw new InvalidOperationException($"A category with the name '{dto.Name}' already exists.");
        }

        category.Name = dto.Name;
        category.ColorHex = dto.ColorHex;
        category.Icon = dto.Icon;
        category.SortOrder = dto.SortOrder;

        await _context.SaveChangesAsync();

        return category;
    }

    /// <inheritdoc />
    public async Task DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id)
            ?? throw new KeyNotFoundException($"Category with id {id} not found.");

        var goalCount = await _context.Goals.CountAsync(g => g.CategoryId == id);

        if (goalCount > 0)
        {
            throw new InvalidOperationException(
                $"Cannot delete category '{category.Name}' because it is used by {goalCount} goal(s).");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc />
    public async Task<List<Category>> GetAllCategoriesAsync()
    {
        return await _context.Categories
            .OrderBy(c => c.SortOrder)
            .ToListAsync();
    }
}
