using DocsPortal.Api.Models;

namespace DocsPortal.Api.Services;

public interface IDocumentService
{
    Task<IEnumerable<Document>> GetDocumentsAsync(int userId, string? category = null, string? searchTerm = null);
    Task<Document?> GetDocumentByIdAsync(int documentId, int userId);
    Task<Document?> CreateDocumentAsync(Document document, int userId);
    Task<Document?> UpdateDocumentAsync(int documentId, Document document, int userId);
    Task<bool> DeleteDocumentAsync(int documentId, int userId);
    Task<bool> GrantAccessAsync(int documentId, string userId, string accessType, int grantedBy);
    Task<bool> RevokeAccessAsync(int documentId, string userId, int revokedBy);
    Task<IEnumerable<DocumentAccess>> GetDocumentAccessAsync(int documentId, int userId);
    Task<DocumentVersion?> CreateVersionAsync(int documentId, DocumentVersion version, int userId);
    Task<IEnumerable<DocumentVersion>> GetDocumentVersionsAsync(int documentId, int userId);
    Task<bool> HasAccessAsync(int documentId, int userId, string accessType = "Read");
    Task<IEnumerable<Document>> GetPublicDocumentsAsync();
    Task<IEnumerable<Document>> GetRecentDocumentsAsync(int userId, int count = 10);
    Task<IEnumerable<string>> GetCategoriesAsync();
}

public class DocumentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Tags { get; set; }
    public bool IsPublic { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? UpdatedBy { get; set; }
    public string? AccessType { get; set; }
    public int VersionCount { get; set; }
    public string? LatestVersion { get; set; }
}

public class CreateDocumentRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Tags { get; set; }
    public bool IsPublic { get; set; } = false;
    public IFormFile? File { get; set; }
}

public class UpdateDocumentRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Tags { get; set; }
    public bool IsPublic { get; set; }
}

public class GrantAccessRequest
{
    public string UserId { get; set; } = string.Empty;
    public string AccessType { get; set; } = "Read"; // Read, Write, Admin
}