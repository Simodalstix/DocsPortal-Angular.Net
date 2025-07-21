using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DocsPortal.Api.Models;
using DocsPortal.Api.Services;
using System.Security.Claims;

namespace DocsPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(IDocumentService documentService, ILogger<DocumentsController> logger)
    {
        _documentService = documentService;
        _logger = logger;
    }

    /// <summary>
    /// Get all documents accessible to the current user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments(
        [FromQuery] string? category = null,
        [FromQuery] string? search = null)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var documents = await _documentService.GetDocumentsAsync(userId.Value, category, search);
        var documentDtos = documents.Select(MapToDocumentDto);

        return Ok(documentDtos);
    }

    /// <summary>
    /// Get public documents (no authentication required)
    /// </summary>
    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetPublicDocuments()
    {
        var documents = await _documentService.GetPublicDocumentsAsync();
        var documentDtos = documents.Select(MapToDocumentDto);

        return Ok(documentDtos);
    }

    /// <summary>
    /// Get recent documents for the current user
    /// </summary>
    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetRecentDocuments([FromQuery] int count = 10)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var documents = await _documentService.GetRecentDocumentsAsync(userId.Value, count);
        var documentDtos = documents.Select(MapToDocumentDto);

        return Ok(documentDtos);
    }

    /// <summary>
    /// Get document by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentDto>> GetDocument(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var document = await _documentService.GetDocumentByIdAsync(id, userId.Value);
        if (document == null)
        {
            return NotFound(new { message = "Document not found or access denied" });
        }

        return Ok(MapToDocumentDto(document));
    }

    /// <summary>
    /// Create a new document
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<DocumentDto>> CreateDocument([FromBody] CreateDocumentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var document = new Document
        {
            Title = request.Title,
            Description = request.Description,
            FileName = request.FileName,
            FileType = request.FileType,
            FileSize = request.FileSize,
            Category = request.Category,
            Tags = request.Tags,
            IsPublic = request.IsPublic,
            FilePath = $"/documents/{Guid.NewGuid()}_{request.FileName}" // Simplified file path
        };

        var createdDocument = await _documentService.CreateDocumentAsync(document, userId.Value);
        if (createdDocument == null)
        {
            return BadRequest(new { message = "Failed to create document" });
        }

        return CreatedAtAction(nameof(GetDocument), new { id = createdDocument.Id }, MapToDocumentDto(createdDocument));
    }

    /// <summary>
    /// Update an existing document
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<DocumentDto>> UpdateDocument(int id, [FromBody] UpdateDocumentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var document = new Document
        {
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Tags = request.Tags,
            IsPublic = request.IsPublic
        };

        var updatedDocument = await _documentService.UpdateDocumentAsync(id, document, userId.Value);
        if (updatedDocument == null)
        {
            return NotFound(new { message = "Document not found or access denied" });
        }

        return Ok(MapToDocumentDto(updatedDocument));
    }

    /// <summary>
    /// Delete a document
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteDocument(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var success = await _documentService.DeleteDocumentAsync(id, userId.Value);
        if (!success)
        {
            return NotFound(new { message = "Document not found or access denied" });
        }

        return NoContent();
    }

    /// <summary>
    /// Grant access to a document
    /// </summary>
    [HttpPost("{id}/access")]
    public async Task<ActionResult> GrantAccess(int id, [FromBody] GrantAccessRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var success = await _documentService.GrantAccessAsync(id, request.UserId, request.AccessType, userId.Value);
        if (!success)
        {
            return BadRequest(new { message = "Failed to grant access. Check if you have admin rights to this document." });
        }

        return Ok(new { message = "Access granted successfully" });
    }

    /// <summary>
    /// Revoke access to a document
    /// </summary>
    [HttpDelete("{id}/access/{targetUserId}")]
    public async Task<ActionResult> RevokeAccess(int id, string targetUserId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var success = await _documentService.RevokeAccessAsync(id, targetUserId, userId.Value);
        if (!success)
        {
            return BadRequest(new { message = "Failed to revoke access. Check if you have admin rights to this document." });
        }

        return Ok(new { message = "Access revoked successfully" });
    }

    /// <summary>
    /// Get document access permissions
    /// </summary>
    [HttpGet("{id}/access")]
    public async Task<ActionResult<IEnumerable<DocumentAccess>>> GetDocumentAccess(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var accesses = await _documentService.GetDocumentAccessAsync(id, userId.Value);
        return Ok(accesses);
    }

    /// <summary>
    /// Get document versions
    /// </summary>
    [HttpGet("{id}/versions")]
    public async Task<ActionResult<IEnumerable<DocumentVersion>>> GetDocumentVersions(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var versions = await _documentService.GetDocumentVersionsAsync(id, userId.Value);
        return Ok(versions);
    }

    /// <summary>
    /// Create a new document version
    /// </summary>
    [HttpPost("{id}/versions")]
    public async Task<ActionResult<DocumentVersion>> CreateDocumentVersion(int id, [FromBody] CreateVersionRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var version = new DocumentVersion
        {
            Version = request.Version,
            FilePath = $"/documents/versions/{Guid.NewGuid()}_{request.FileName}",
            FileSize = request.FileSize,
            ChangeLog = request.ChangeLog
        };

        var createdVersion = await _documentService.CreateVersionAsync(id, version, userId.Value);
        if (createdVersion == null)
        {
            return BadRequest(new { message = "Failed to create document version" });
        }

        return Ok(createdVersion);
    }

    /// <summary>
    /// Get available document categories
    /// </summary>
    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _documentService.GetCategoriesAsync();
        return Ok(categories);
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private static DocumentDto MapToDocumentDto(Document document)
    {
        return new DocumentDto
        {
            Id = document.Id,
            Title = document.Title,
            Description = document.Description,
            FileName = document.FileName,
            FileType = document.FileType,
            FileSize = document.FileSize,
            Category = document.Category,
            Tags = document.Tags,
            IsPublic = document.IsPublic,
            IsActive = document.IsActive,
            CreatedAt = document.CreatedAt,
            UpdatedAt = document.UpdatedAt,
            CreatedBy = document.CreatedBy,
            UpdatedBy = document.UpdatedBy,
            VersionCount = document.DocumentVersions?.Count ?? 0,
            LatestVersion = document.DocumentVersions?.OrderByDescending(v => v.CreatedAt).FirstOrDefault()?.Version
        };
    }
}

public class CreateVersionRequest
{
    public string Version { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? ChangeLog { get; set; }
}