using Microsoft.EntityFrameworkCore;
using DocsPortal.Api.Models;

namespace DocsPortal.Api.Data;

public class DocsPortalContext : DbContext
{
    public DocsPortalContext(DbContextOptions<DocsPortalContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<DocumentAccess> DocumentAccesses { get; set; }
    public DbSet<DocumentVersion> DocumentVersions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
            
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50).HasDefaultValue("User");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.EmailConfirmed).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Document entity configuration
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Title);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.CreatedAt);
            
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FileType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Tags).HasMaxLength(500);
            entity.Property(e => e.IsPublic).HasDefaultValue(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.UpdatedBy).HasMaxLength(100);
        });

        // DocumentAccess entity configuration
        modelBuilder.Entity<DocumentAccess>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.DocumentId, e.UserId }).IsUnique();
            
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.AccessType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.GrantedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.GrantedBy).HasMaxLength(100);

            // Foreign key relationships
            entity.HasOne(e => e.Document)
                  .WithMany(d => d.DocumentAccesses)
                  .HasForeignKey(e => e.DocumentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // DocumentVersion entity configuration
        modelBuilder.Entity<DocumentVersion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.DocumentId, e.Version }).IsUnique();
            
            entity.Property(e => e.Version).IsRequired().HasMaxLength(20);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ChangeLog).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            // Foreign key relationships
            entity.HasOne(e => e.Document)
                  .WithMany(d => d.DocumentVersions)
                  .HasForeignKey(e => e.DocumentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed default admin user
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@smartdocs.com",
                PasswordHash = "$2a$11$8K1p/a0dURXAm7QiK61.Gu.xEjKjaaVBdcsFK19Wgss7vCELDz/ca", // Password: Admin123!
                FirstName = "System",
                LastName = "Administrator",
                Department = "IT",
                JobTitle = "System Administrator",
                Role = "Admin",
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        // Seed document categories
        var sampleDocuments = new[]
        {
            new Document
            {
                Id = 1,
                Title = "Employee Handbook",
                Description = "Comprehensive guide for all employees",
                FilePath = "/documents/employee-handbook.pdf",
                FileName = "employee-handbook.pdf",
                FileType = "PDF",
                FileSize = 2048000,
                Category = "HR",
                Tags = "handbook,policies,guidelines",
                IsPublic = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "admin"
            },
            new Document
            {
                Id = 2,
                Title = "IT Security Policy",
                Description = "Information security guidelines and procedures",
                FilePath = "/documents/it-security-policy.pdf",
                FileName = "it-security-policy.pdf",
                FileType = "PDF",
                FileSize = 1536000,
                Category = "IT",
                Tags = "security,policy,guidelines",
                IsPublic = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "admin"
            }
        };

        modelBuilder.Entity<Document>().HasData(sampleDocuments);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is Document && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entityEntry in entries)
        {
            if (entityEntry.Entity is Document document)
            {
                document.UpdatedAt = DateTime.UtcNow;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}