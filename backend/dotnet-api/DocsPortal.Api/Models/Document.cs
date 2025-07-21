using System.ComponentModel.DataAnnotations;

namespace DocsPortal.Api.Models;

public class Document
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(255)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [Required]
    [StringLength(500)]
    public string FilePath { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string FileType { get; set; } = string.Empty;
    
    public long FileSize { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Tags { get; set; }
    
    public bool IsPublic { get; set; } = false;
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    [StringLength(100)]
    public string CreatedBy { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? UpdatedBy { get; set; }
    
    // Navigation properties
    public virtual ICollection<DocumentAccess> DocumentAccesses { get; set; } = new List<DocumentAccess>();
    public virtual ICollection<DocumentVersion> DocumentVersions { get; set; } = new List<DocumentVersion>();
}

public class DocumentAccess
{
    public int Id { get; set; }
    
    public int DocumentId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string AccessType { get; set; } = string.Empty; // Read, Write, Admin
    
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    
    [StringLength(100)]
    public string? GrantedBy { get; set; }
    
    // Navigation properties
    public virtual Document Document { get; set; } = null!;
}

public class DocumentVersion
{
    public int Id { get; set; }
    
    public int DocumentId { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Version { get; set; } = string.Empty;
    
    [Required]
    [StringLength(500)]
    public string FilePath { get; set; } = string.Empty;
    
    public long FileSize { get; set; }
    
    [StringLength(500)]
    public string? ChangeLog { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    [StringLength(100)]
    public string CreatedBy { get; set; } = string.Empty;
    
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual Document Document { get; set; } = null!;
}