// Implements authentication operations using ASP.NET Identity and JWT tokens.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using GoalsTracker.Api.Data;
using GoalsTracker.Api.Models.Dtos.Auth;
using GoalsTracker.Api.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GoalsTracker.Api.Services;

/// <summary>
/// Handles user registration, login, token refresh, and password reset using ASP.NET Identity and JWT.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;

    private const string TokenProvider = "GoalsTracker";
    private const string RefreshTokenName = "RefreshToken";

    /// <summary>
    /// Initializes a new instance of <see cref="AuthService"/>.
    /// </summary>
    /// <param name="userManager">The ASP.NET Identity user manager.</param>
    /// <param name="signInManager">The ASP.NET Identity sign-in manager.</param>
    /// <param name="configuration">Application configuration for JWT settings.</param>
    /// <param name="context">The application database context.</param>
    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration configuration,
        AppDbContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _context = context;
    }

    /// <inheritdoc />
    public async Task<TokenDto> RegisterAsync(RegisterDto dto)
    {
        // Find the Bronze achievement level (lowest MinPoints) to assign as default.
        var bronzeLevel = await _context.AchievementLevels
            .OrderBy(a => a.MinPoints)
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("No achievement levels configured. Seed the database first.");

        var user = new User
        {
            Email = dto.Email,
            UserName = dto.UserName,
            Timezone = dto.Timezone ?? "UTC",
            AchievementLevelId = bronzeLevel.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Registration failed: {errors}");
        }

        return await GenerateTokenPairAsync(user);
    }

    /// <inheritdoc />
    public async Task<TokenDto> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: false);

        if (!signInResult.Succeeded)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        return await GenerateTokenPairAsync(user);
    }

    /// <inheritdoc />
    public async Task<TokenDto> RefreshTokenAsync(RefreshTokenDto dto)
    {
        // Extract user from the expired access token without validating its lifetime.
        var principal = GetPrincipalFromExpiredToken(dto.Token);
        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Invalid access token.");

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new UnauthorizedAccessException("User not found.");

        // Validate the stored refresh token.
        var storedRefreshToken = await _userManager.GetAuthenticationTokenAsync(user, TokenProvider, RefreshTokenName);

        if (storedRefreshToken != dto.RefreshToken)
        {
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        return await GenerateTokenPairAsync(user);
    }

    /// <inheritdoc />
    public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user is null)
        {
            // Return silently to prevent email enumeration.
            return;
        }

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        // In v1, log the token rather than sending an actual email.
        // A real implementation would send this via an email service.
        Console.WriteLine($"[ForgotPassword] Reset token for {dto.Email}: {resetToken}");
    }

    /// <inheritdoc />
    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email)
            ?? throw new InvalidOperationException("Invalid email address.");

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Password reset failed: {errors}");
        }
    }

    /// <summary>
    /// Generates a JWT access token and a refresh token for the given user, storing the refresh token.
    /// </summary>
    private async Task<TokenDto> GenerateTokenPairAsync(User user)
    {
        var jwtToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        await _userManager.SetAuthenticationTokenAsync(user, TokenProvider, RefreshTokenName, refreshToken);

        var expiryMinutes = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "60");

        return new TokenDto
        {
            UserId = user.Id,
            UserName = user.UserName ?? string.Empty,
            Token = jwtToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
        };
    }

    /// <summary>
    /// Generates a signed JWT access token with standard claims for the given user.
    /// </summary>
    private string GenerateJwtToken(User user)
    {
        var secret = _configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT Secret is not configured.");
        var issuer = _configuration["Jwt:Issuer"] ?? "GoalsTracker";
        var audience = _configuration["Jwt:Audience"] ?? "GoalsTracker";
        var expiryMinutes = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Generates a cryptographically secure random refresh token.
    /// </summary>
    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    /// <summary>
    /// Extracts the <see cref="ClaimsPrincipal"/> from an expired JWT without validating its lifetime.
    /// </summary>
    private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var secret = _configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT Secret is not configured.");

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _configuration["Jwt:Issuer"] ?? "GoalsTracker",
            ValidAudience = _configuration["Jwt:Audience"] ?? "GoalsTracker",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            ValidateLifetime = false // Allow expired tokens for refresh.
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

        if (securityToken is not JwtSecurityToken jwtSecurityToken ||
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new UnauthorizedAccessException("Invalid token.");
        }

        return principal;
    }
}
