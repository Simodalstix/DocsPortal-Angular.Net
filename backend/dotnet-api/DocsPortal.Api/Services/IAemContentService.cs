namespace DocsPortal.Api.Services;

public interface IAemContentService
{
    Task<AemContentResponse?> GetContentAsync(string path);
    Task<IEnumerable<AemContentItem>> GetContentListAsync(string? category = null);
    Task<AemContentResponse?> CreateContentAsync(AemContentRequest request);
    Task<AemContentResponse?> UpdateContentAsync(string path, AemContentRequest request);
    Task<bool> DeleteContentAsync(string path);
    Task<IEnumerable<string>> GetCategoriesAsync();
}

public class AemContentResponse
{
    public string Path { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Content { get; set; } = string.Empty;
    public string ContentType { get; set; } = "text/html";
    public string Category { get; set; } = string.Empty;
    public string[] Tags { get; set; } = Array.Empty<string>();
    public DateTime CreatedDate { get; set; }
    public DateTime ModifiedDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string ModifiedBy { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public Dictionary<string, object> Properties { get; set; } = new();
}

public class AemContentItem
{
    public string Path { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string[] Tags { get; set; } = Array.Empty<string>();
    public DateTime ModifiedDate { get; set; }
    public bool IsPublished { get; set; }
}

public class AemContentRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Content { get; set; } = string.Empty;
    public string ContentType { get; set; } = "text/html";
    public string Category { get; set; } = string.Empty;
    public string[] Tags { get; set; } = Array.Empty<string>();
    public bool IsPublished { get; set; } = false;
    public Dictionary<string, object> Properties { get; set; } = new();
}