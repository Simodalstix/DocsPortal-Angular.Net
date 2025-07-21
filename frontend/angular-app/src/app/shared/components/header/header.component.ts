import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center space-x-4">
            <a routerLink="/" class="flex items-center space-x-2">
              <div
                class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
              >
                <span class="text-white font-bold text-sm">DP</span>
              </div>
              <span class="text-xl font-semibold text-gray-900"
                >DocsPortal</span
              >
            </a>
          </div>

          <!-- Navigation Links (when authenticated) -->
          <nav
            class="hidden md:flex space-x-6"
            *ngIf="authService.isAuthenticated()"
          >
            <a
              routerLink="/dashboard"
              routerLinkActive="nav-link-active"
              class="nav-link"
            >
              Dashboard
            </a>
            <a
              routerLink="/documents"
              routerLinkActive="nav-link-active"
              class="nav-link"
            >
              Documents
            </a>
          </nav>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div
              *ngIf="authService.isAuthenticated(); else loginButtons"
              class="relative"
            >
              <!-- User Avatar and Dropdown -->
              <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-700">
                  Welcome, {{ authService.currentUser()?.firstName }}
                </span>
                <div class="relative">
                  <button
                    (click)="toggleUserMenu()"
                    class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-primary-600 font-medium text-sm">
                        {{ getUserInitials() }}
                      </span>
                    </div>
                    <svg
                      class="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>

                  <!-- Dropdown Menu -->
                  <div
                    *ngIf="showUserMenu"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <a
                      routerLink="/profile"
                      (click)="closeUserMenu()"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </a>
                    <hr class="my-1" />
                    <button
                      (click)="logout()"
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Login/Register Buttons -->
            <ng-template #loginButtons>
              <div class="flex items-center space-x-3">
                <a routerLink="/login" class="btn-secondary"> Sign In </a>
                <a routerLink="/register" class="btn-primary"> Sign Up </a>
              </div>
            </ng-template>
          </div>

          <!-- Mobile Menu Button -->
          <button
            (click)="toggleMobileMenu()"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <div
          *ngIf="showMobileMenu"
          class="md:hidden py-4 border-t border-gray-200"
        >
          <div class="flex flex-col space-y-2">
            <a
              routerLink="/dashboard"
              (click)="closeMobileMenu()"
              class="nav-link"
            >
              Dashboard
            </a>
            <a
              routerLink="/documents"
              (click)="closeMobileMenu()"
              class="nav-link"
            >
              Documents
            </a>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [],
})
export class HeaderComponent {
  readonly authService = inject(AuthService);

  showUserMenu = false;
  showMobileMenu = false;

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return "";

    const firstInitial = user.firstName?.charAt(0) || "";
    const lastInitial = user.lastName?.charAt(0) || "";
    return (firstInitial + lastInitial).toUpperCase();
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }
}
