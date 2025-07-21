using System.ComponentModel.DataAnnotations;

namespace DocsPortal.Api.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [StringLength(255)]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? Department { get; set; }
    
    [StringLength(100)]
    public string? JobTitle { get; set; }
    
    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Role { get; set; } = "User"; // User, Admin, Manager
    
    public bool IsActive { get; set; } = true;
    
    public bool EmailConfirmed { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastLoginAt { get; set; }
    
    [StringLength(500)]
    public string? RefreshToken { get; set; }
    
    public DateTime? RefreshTokenExpiryTime { get; set; }
    
    // Navigation properties
    public virtual ICollection<DocumentAccess> DocumentAccesses { get; set; } = new List<DocumentAccess>();
    
    // Computed properties
    public string FullName => $"{FirstName} {LastName}";
    
    public bool IsAdmin => Role.Equals("Admin", StringComparison.OrdinalIgnoreCase);
    
    public bool IsManager => Role.Equals("Manager", StringComparison.OrdinalIgnoreCase) || IsAdmin;
}

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
    
    public bool RememberMe { get; set; } = false;
}

public class RegisterRequest
{
    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
    
    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? Department { get; set; }
    
    [StringLength(100)]
    public string? JobTitle { get; set; }
    
    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? JobTitle { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}