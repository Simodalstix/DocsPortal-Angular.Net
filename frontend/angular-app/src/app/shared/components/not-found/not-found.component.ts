import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full text-center">
        <!-- 404 Illustration -->
        <div class="mb-8">
          <div
            class="mx-auto w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mb-6"
          >
            <svg
              class="w-16 h-16 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 class="text-2xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p class="text-gray-500 mb-8">
            Sorry, we couldn't find the page you're looking for. The document
            you requested might have been moved or deleted.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-4">
          <a routerLink="/dashboard" class="btn-primary w-full inline-block">
            Go to Dashboard
          </a>
          <button (click)="goBack()" class="btn-secondary w-full">
            Go Back
          </button>
        </div>

        <!-- Help Links -->
        <div class="mt-8 pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-4">Need help? Try these:</p>
          <div class="flex justify-center space-x-6 text-sm">
            <a
              routerLink="/documents"
              class="text-primary-600 hover:text-primary-700"
            >
              Browse Documents
            </a>
            <a href="#" class="text-primary-600 hover:text-primary-700">
              Help Center
            </a>
            <a href="#" class="text-primary-600 hover:text-primary-700">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}
