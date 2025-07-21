using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;
using DocsPortal.Api.Data;
using DocsPortal.Api.Models;

namespace DocsPortal.Api.Services;

public class AuthService : IAuthService
{
    private readonly DocsPortalContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(DocsPortalContext context, IConfiguration configuration, ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

            if (user == null || !ValidatePassword(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Failed login attempt for email: {Email}", request.Email);
                return null;
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            
            // Generate tokens
            var jwtToken = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();
            
            // Save refresh token
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} logged in successfully", user.Id);

            return new AuthResponse
            {
                Token = jwtToken,
                RefreshToken = refreshToken,
                Expiration = DateTime.UtcNow.AddHours(1),
                User = MapToUserDto(user)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return null;
        }
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        try
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                _logger.LogWarning("Registration attempt with existing email: {Email}", request.Email);
                return null;
            }

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                _logger.LogWarning("Registration attempt with existing username: {Username}", request.Username);
                return null;
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Department = request.Department,
                JobTitle = request.JobTitle,
                PhoneNumber = request.PhoneNumber,
                Role = "User", // Default role
                IsActive = true,
                EmailConfirmed = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("New user registered: {UserId}", user.Id);

            // Generate tokens
            var jwtToken = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();
            
            // Save refresh token
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                Token = jwtToken,
                RefreshToken = refreshToken,
                Expiration = DateTime.UtcNow.AddHours(1),
                User = MapToUserDto(user)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
            return null;
        }
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && 
                                         u.RefreshTokenExpiryTime > DateTime.UtcNow &&
                                         u.IsActive);

            if (user == null)
            {
                _logger.LogWarning("Invalid refresh token attempt");
                return null;
            }

            // Generate new tokens
            var jwtToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();
            
            // Update refresh token
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                Token = jwtToken,
                RefreshToken = newRefreshToken,
                Expiration = DateTime.UtcNow.AddHours(1),
                User = MapToUserDto(user)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return null;
        }
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null) return false;

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token revocation");
            return false;
        }
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            return user != null ? MapToUserDto(user) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by ID: {UserId}", userId);
            return null;
        }
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

            return user != null ? MapToUserDto(user) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by email: {Email}", email);
            return null;
        }
    }

    public async Task<bool> UpdateUserAsync(int userId, UserDto userDto)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsActive) return false;

            user.FirstName = userDto.FirstName;
            user.LastName = userDto.LastName;
            user.Department = userDto.Department;
            user.JobTitle = userDto.JobTitle;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user: {UserId}", userId);
            return false;
        }
    }

    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsActive) return false;

            if (!ValidatePassword(currentPassword, user.PasswordHash))
                return false;

            user.PasswordHash = HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
            return false;
        }
    }

    public string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("FullName", user.FullName),
            new Claim("Department", user.Department ?? ""),
            new Claim("JobTitle", user.JobTitle ?? "")
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public bool ValidatePassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, 12);
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Department = user.Department,
            JobTitle = user.JobTitle,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}