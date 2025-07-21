import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { DocumentService } from "../../core/services/document.service";

interface DashboardStats {
  totalDocuments: number;
  recentUploads: number;
  sharedDocuments: number;
  storageUsed: string;
}

interface RecentDocument {
  id: string;
  name: string;
  mimeType: string;
  uploadedAt: Date;
  size: number;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Welcome Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {{ authService.currentUser()?.firstName }}!
        </h1>
        <p class="text-gray-600">
          Here's what's happening with your documents today.
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 mr-4">
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Total Documents</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats()?.totalDocuments || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 mr-4">
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Recent Uploads</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats()?.recentUploads || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 mr-4">
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Shared Documents</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats()?.sharedDocuments || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-orange-100 mr-4">
              <svg
                class="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Storage Used</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats()?.storageUsed || "0 MB" }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Documents -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-gray-900">
              Recent Documents
            </h2>
          </div>

          <div *ngIf="isLoadingDocuments()" class="flex justify-center py-8">
            <div class="loading-spinner"></div>
          </div>

          <div
            *ngIf="!isLoadingDocuments() && recentDocuments().length === 0"
            class="text-center py-8 text-gray-500"
          >
            <svg
              class="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <p>No documents uploaded yet</p>
            <a routerLink="/documents" class="btn-primary mt-4 inline-block">
              Upload Your First Document
            </a>
          </div>

          <div
            *ngIf="!isLoadingDocuments() && recentDocuments().length > 0"
            class="space-y-3"
          >
            <div
              *ngFor="let doc of recentDocuments()"
              class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ doc.name }}</p>
                  <p class="text-sm text-gray-500">
                    {{ doc.size }} • {{ doc.uploadedAt | date : "short" }}
                  </p>
                </div>
              </div>
              <button class="text-gray-400 hover:text-gray-600">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  ></path>
                </svg>
              </button>
            </div>

            <div class="pt-4 border-t border-gray-200">
              <a
                routerLink="/documents"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all documents →
              </a>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <a
              routerLink="/documents/upload"
              class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <div
                class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary-200"
              >
                <svg
                  class="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Upload Document</h3>
                <p class="text-sm text-gray-500">
                  Add new files to your collection
                </p>
              </div>
            </a>

            <a
              routerLink="/documents"
              class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <div
                class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200"
              >
                <svg
                  class="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Browse Documents</h3>
                <p class="text-sm text-gray-500">
                  Search and manage your files
                </p>
              </div>
            </a>

            <a
              href="#"
              class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <div
                class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200"
              >
                <svg
                  class="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">View Analytics</h3>
                <p class="text-sm text-gray-500">Track usage and insights</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly documentService = inject(DocumentService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly recentDocuments = signal<RecentDocument[]>([]);
  readonly isLoadingDocuments = signal(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoadingDocuments.set(true);

    // Load dashboard statistics
    this.documentService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error("Failed to load dashboard stats:", error);
      },
    });

    // Load recent documents
    this.documentService.getRecentDocuments(5).subscribe({
      next: (documents) => {
        this.recentDocuments.set(documents);
        this.isLoadingDocuments.set(false);
      },
      error: (error) => {
        console.error("Failed to load recent documents:", error);
        this.isLoadingDocuments.set(false);
      },
    });
  }
}
