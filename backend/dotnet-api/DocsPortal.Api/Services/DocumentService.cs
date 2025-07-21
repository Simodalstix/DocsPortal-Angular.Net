using Microsoft.EntityFrameworkCore;
using DocsPortal.Api.Data;
using DocsPortal.Api.Models;

namespace DocsPortal.Api.Services;

public class DocumentService : IDocumentService
{
    private readonly DocsPortalContext _context;
    private readonly ILogger<DocumentService> _logger;

    public DocumentService(DocsPortalContext context, ILogger<DocumentService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Document>> GetDocumentsAsync(int userId, string? category = null, string? searchTerm = null)
    {
        try
        {
            var query = _context.Documents
                .Include(d => d.DocumentAccesses)
                .Include(d => d.DocumentVersions)
                .Where(d => d.IsActive && 
                           (d.IsPublic || 
                            d.CreatedBy == userId.ToString() ||
                            d.DocumentAccesses.Any(da => da.UserId == userId.ToString())));

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(d => d.Category.ToLower() == category.ToLower());
            }

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var lowerSearchTerm = searchTerm.ToLower();
                query = query.Where(d => 
                    d.Title.ToLower().Contains(lowerSearchTerm) ||
                    d.Description!.ToLower().Contains(lowerSearchTerm) ||
                    d.Tags!.ToLower().Contains(lowerSearchTerm));
            }

            return await query
                .OrderByDescending(d => d.UpdatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting documents for user: {UserId}", userId);
            return Enumerable.Empty<Document>();
        }
    }

    public async Task<Document?> GetDocumentByIdAsync(int documentId, int userId)
    {
        try
        {
            var document = await _context.Documents
                .Include(d => d.DocumentAccesses)
                .Include(d => d.DocumentVersions)
                .FirstOrDefaultAsync(d => d.Id == documentId && d.IsActive);

            if (document == null) return null;

            // Check access permissions
            if (!await HasAccessAsync(documentId, userId))
                return null;

            return document;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting document {DocumentId} for user: {UserId}", documentId, userId);
            return null;
        }
    }

    public async Task<Document?> CreateDocumentAsync(Document document, int userId)
    {
        try
        {
            document.CreatedBy = userId.ToString();
            document.CreatedAt = DateTime.UtcNow;
            document.UpdatedAt = DateTime.UtcNow;
            document.IsActive = true;

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            // Grant admin access to creator
            var access = new DocumentAccess
            {
                DocumentId = document.Id,
                UserId = userId.ToString(),
                AccessType = "Admin",
                GrantedAt = DateTime.UtcNow,
                GrantedBy = userId.ToString()
            };

            _context.DocumentAccesses.Add(access);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Document {DocumentId} created by user {UserId}", document.Id, userId);
            return document;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating document for user: {UserId}", userId);
            return null;
        }
    }

    public async Task<Document?> UpdateDocumentAsync(int documentId, Document updatedDocument, int userId)
    {
        try
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document == null || !document.IsActive) return null;

            // Check write access
            if (!await HasAccessAsync(documentId, userId, "Write"))
                return null;

            document.Title = updatedDocument.Title;
            document.Description = updatedDocument.Description;
            document.Category = updatedDocument.Category;
            document.Tags = updatedDocument.Tags;
            document.IsPublic = updatedDocument.IsPublic;
            document.UpdatedAt = DateTime.UtcNow;
            document.UpdatedBy = userId.ToString();

            await _context.SaveChangesAsync();

            _logger.LogInformation("Document {DocumentId} updated by user {UserId}", documentId, userId);
            return document;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating document {DocumentId} for user: {UserId}", documentId, userId);
            return null;
        }
    }

    public async Task<bool> DeleteDocumentAsync(int documentId, int userId)
    {
        try
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document == null || !document.IsActive) return false;

            // Check admin access
            if (!await HasAccessAsync(documentId, userId, "Admin"))
                return false;

            document.IsActive = false;
            document.UpdatedAt = DateTime.UtcNow;
            document.UpdatedBy = userId.ToString();

            await _context.SaveChangesAsync();

            _logger.LogInformation("Document {DocumentId} deleted by user {UserId}", documentId, userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document {DocumentId} for user: {UserId}", documentId, userId);
            return false;
        }
    }

    public async Task<bool> GrantAccessAsync(int documentId, string userId, string accessType, int grantedBy)
    {
        try
        {
            // Check if granter has admin access
            if (!await HasAccessAsync(documentId, grantedBy, "Admin"))
                return false;

            // Check if access already exists
            var existingAccess = await _context.DocumentAccesses
                .FirstOrDefaultAsync(da => da.DocumentId == documentId && da.UserId == userId);

            if (existingAccess != null)
            {
                existingAccess.AccessType = accessType;
                existingAccess.GrantedAt = DateTime.UtcNow;
                existingAccess.GrantedBy = grantedBy.ToString();
            }
            else
            {
                var access = new DocumentAccess
                {
                    DocumentId = documentId,
                    UserId = userId,
                    AccessType = accessType,
                    GrantedAt = DateTime.UtcNow,
                    GrantedBy = grantedBy.ToString()
                };

                _context.DocumentAccesses.Add(access);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Access granted to user {UserId} for document {DocumentId} by {GrantedBy}", 
                userId, documentId, grantedBy);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error granting access to document {DocumentId}", documentId);
            return false;
        }
    }

    public async Task<bool> RevokeAccessAsync(int documentId, string userId, int revokedBy)
    {
        try
        {
            // Check if revoker has admin access
            if (!await HasAccessAsync(documentId, revokedBy, "Admin"))
                return false;

            var access = await _context.DocumentAccesses
                .FirstOrDefaultAsync(da => da.DocumentId == documentId && da.UserId == userId);

            if (access == null) return false;

            _context.DocumentAccesses.Remove(access);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Access revoked for user {UserId} from document {DocumentId} by {RevokedBy}", 
                userId, documentId, revokedBy);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking access from document {DocumentId}", documentId);
            return false;
        }
    }

    public async Task<IEnumerable<DocumentAccess>> GetDocumentAccessAsync(int documentId, int userId)
    {
        try
        {
            // Check if user has admin access to view permissions
            if (!await HasAccessAsync(documentId, userId, "Admin"))
                return Enumerable.Empty<DocumentAccess>();

            return await _context.DocumentAccesses
                .Where(da => da.DocumentId == documentId)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting document access for document {DocumentId}", documentId);
            return Enumerable.Empty<DocumentAccess>();
        }
    }

    public async Task<DocumentVersion?> CreateVersionAsync(int documentId, DocumentVersion version, int userId)
    {
        try
        {
            // Check write access
            if (!await HasAccessAsync(documentId, userId, "Write"))
                return null;

            version.DocumentId = documentId;
            version.CreatedBy = userId.ToString();
            version.CreatedAt = DateTime.UtcNow;
            version.IsActive = true;

            _context.DocumentVersions.Add(version);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Version {Version} created for document {DocumentId} by user {UserId}", 
                version.Version, documentId, userId);
            return version;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating version for document {DocumentId}", documentId);
            return null;
        }
    }

    public async Task<IEnumerable<DocumentVersion>> GetDocumentVersionsAsync(int documentId, int userId)
    {
        try
        {
            // Check read access
            if (!await HasAccessAsync(documentId, userId))
                return Enumerable.Empty<DocumentVersion>();

            return await _context.DocumentVersions
                .Where(dv => dv.DocumentId == documentId && dv.IsActive)
                .OrderByDescending(dv => dv.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting versions for document {DocumentId}", documentId);
            return Enumerable.Empty<DocumentVersion>();
        }
    }

    public async Task<bool> HasAccessAsync(int documentId, int userId, string accessType = "Read")
    {
        try
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document == null || !document.IsActive) return false;

            // Public documents allow read access to everyone
            if (document.IsPublic && accessType == "Read") return true;

            // Creator has full access
            if (document.CreatedBy == userId.ToString()) return true;

            // Check explicit access permissions
            var access = await _context.DocumentAccesses
                .FirstOrDefaultAsync(da => da.DocumentId == documentId && da.UserId == userId.ToString());

            if (access == null) return false;

            return accessType switch
            {
                "Read" => true, // Any access level allows read
                "Write" => access.AccessType is "Write" or "Admin",
                "Admin" => access.AccessType == "Admin",
                _ => false
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking access for document {DocumentId} and user {UserId}", documentId, userId);
            return false;
        }
    }

    public async Task<IEnumerable<Document>> GetPublicDocumentsAsync()
    {
        try
        {
            return await _context.Documents
                .Include(d => d.DocumentVersions)
                .Where(d => d.IsPublic && d.IsActive)
                .OrderByDescending(d => d.UpdatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting public documents");
            return Enumerable.Empty<Document>();
        }
    }

    public async Task<IEnumerable<Document>> GetRecentDocumentsAsync(int userId, int count = 10)
    {
        try
        {
            return await _context.Documents
                .Include(d => d.DocumentAccesses)
                .Include(d => d.DocumentVersions)
                .Where(d => d.IsActive && 
                           (d.IsPublic || 
                            d.CreatedBy == userId.ToString() ||
                            d.DocumentAccesses.Any(da => da.UserId == userId.ToString())))
                .OrderByDescending(d => d.UpdatedAt)
                .Take(count)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent documents for user: {UserId}", userId);
            return Enumerable.Empty<Document>();
        }
    }

    public async Task<IEnumerable<string>> GetCategoriesAsync()
    {
        try
        {
            return await _context.Documents
                .Where(d => d.IsActive)
                .Select(d => d.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting document categories");
            return Enumerable.Empty<string>();
        }
    }
}