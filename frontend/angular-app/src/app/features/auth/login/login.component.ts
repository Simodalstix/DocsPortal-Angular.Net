import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
          <div
            class="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4"
          >
            <span class="text-white font-bold text-xl">DP</span>
          </div>
          <h2 class="text-3xl font-bold text-gray-900">
            Sign in to DocsPortal
          </h2>
          <p class="mt-2 text-gray-600">
            Access your document management dashboard
          </p>
        </div>

        <!-- Login Form -->
        <form
          [formGroup]="loginForm"
          (ngSubmit)="onSubmit()"
          class="mt-8 space-y-6"
        >
          <!-- Error Message -->
          <div
            *ngIf="errorMessage()"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {{ errorMessage() }}
          </div>

          <div class="space-y-4">
            <!-- Email Field -->
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="input-field"
                [class.border-red-300]="
                  loginForm.get('email')?.invalid &&
                  loginForm.get('email')?.touched
                "
                placeholder="Enter your email"
                autocomplete="email"
              />
              <div
                *ngIf="
                  loginForm.get('email')?.invalid &&
                  loginForm.get('email')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                <span *ngIf="loginForm.get('email')?.errors?.['required']"
                  >Email is required</span
                >
                <span *ngIf="loginForm.get('email')?.errors?.['email']"
                  >Please enter a valid email</span
                >
              </div>
            </div>

            <!-- Password Field -->
            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  class="input-field pr-10"
                  [class.border-red-300]="
                    loginForm.get('password')?.invalid &&
                    loginForm.get('password')?.touched
                  "
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg
                    *ngIf="!showPassword()"
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <svg
                    *ngIf="showPassword()"
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                </button>
              </div>
              <div
                *ngIf="
                  loginForm.get('password')?.invalid &&
                  loginForm.get('password')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                <span *ngIf="loginForm.get('password')?.errors?.['required']"
                  >Password is required</span
                >
                <span *ngIf="loginForm.get('password')?.errors?.['minlength']"
                  >Password must be at least 6 characters</span
                >
              </div>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                formControlName="rememberMe"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" class="text-sm text-primary-600 hover:text-primary-500">
              Forgot password?
            </a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading()"
            class="btn-primary w-full flex justify-center items-center"
            [class.opacity-50]="loginForm.invalid || isLoading()"
            [class.cursor-not-allowed]="loginForm.invalid || isLoading()"
          >
            <div *ngIf="isLoading()" class="loading-spinner mr-2"></div>
            {{ isLoading() ? "Signing in..." : "Sign in" }}
          </button>

          <!-- Register Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <a
                routerLink="/register"
                class="text-primary-600 hover:text-primary-500 font-medium"
              >
                Sign up here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly errorMessage = signal("");
  readonly showPassword = signal(false);

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set("");

      const { email, password } = this.loginForm.value;

      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.isLoading.set(false);

          // Redirect to intended page or dashboard
          const returnUrl =
            this.route.snapshot.queryParams["returnUrl"] || "/dashboard";
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.error?.message ||
              "Login failed. Please check your credentials and try again."
          );
        },
      });
    }
  }
}
