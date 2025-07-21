import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface Document {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  tags: string[];
  isShared: boolean;
  downloadUrl: string;
}

export interface DashboardStats {
  totalDocuments: number;
  recentUploads: number;
  sharedDocuments: number;
  storageUsed: string;
}

export interface UploadResponse {
  document: Document;
  message: string;
}

@Injectable({
  providedIn: "root",
})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/documents`;

  // Get all documents with optional filtering
  getDocuments(params?: {
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Observable<{ documents: Document[]; total: number }> {
    return this.http.get<{ documents: Document[]; total: number }>(
      this.apiUrl,
      { params }
    );
  }

  // Get a specific document by ID
  getDocument(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  // Get recent documents for dashboard
  getRecentDocuments(limit: number = 5): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/recent`, {
      params: { limit: limit.toString() },
    });
  }

  // Get dashboard statistics
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  // Upload a new document
  uploadDocument(file: File, tags?: string[]): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    if (tags && tags.length > 0) {
      formData.append("tags", JSON.stringify(tags));
    }

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  // Upload multiple documents
  uploadMultipleDocuments(
    files: File[],
    tags?: string[]
  ): Observable<UploadResponse[]> {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    if (tags && tags.length > 0) {
      formData.append("tags", JSON.stringify(tags));
    }

    return this.http.post<UploadResponse[]>(
      `${this.apiUrl}/upload-multiple`,
      formData
    );
  }

  // Update document metadata
  updateDocument(id: string, updates: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${id}`, updates);
  }

  // Delete a document
  deleteDocument(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Share/unshare a document
  toggleDocumentSharing(id: string, isShared: boolean): Observable<Document> {
    return this.http.patch<Document>(`${this.apiUrl}/${id}/share`, {
      isShared,
    });
  }

  // Download a document
  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: "blob",
    });
  }

  // Search documents
  searchDocuments(
    query: string,
    filters?: {
      tags?: string[];
      dateFrom?: Date;
      dateTo?: Date;
      mimeTypes?: string[];
    }
  ): Observable<Document[]> {
    const params: any = { q: query };

    if (filters) {
      if (filters.tags?.length) {
        params.tags = filters.tags.join(",");
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom.toISOString();
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo.toISOString();
      }
      if (filters.mimeTypes?.length) {
        params.mimeTypes = filters.mimeTypes.join(",");
      }
    }

    return this.http.get<Document[]>(`${this.apiUrl}/search`, { params });
  }

  // Get available tags
  getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tags`);
  }

  // Helper method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Helper method to get file icon based on mime type
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "📊";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "📈";
    if (mimeType.includes("zip") || mimeType.includes("archive")) return "🗜️";
    return "📁";
  }
}
