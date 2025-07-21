using DocsPortal.Api.Models;

namespace DocsPortal.Api.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken);
    Task<bool> RevokeTokenAsync(string refreshToken);
    Task<UserDto?> GetUserByIdAsync(int userId);
    Task<UserDto?> GetUserByEmailAsync(string email);
    Task<bool> UpdateUserAsync(int userId, UserDto userDto);
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    string GenerateJwtToken(User user);
    string GenerateRefreshToken();
    bool ValidatePassword(string password, string hash);
    string HashPassword(string password);
}