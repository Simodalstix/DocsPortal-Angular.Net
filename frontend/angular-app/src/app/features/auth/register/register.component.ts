import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-register",
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
          <h2 class="text-3xl font-bold text-gray-900">Create your account</h2>
          <p class="mt-2 text-gray-600">
            Join DocsPortal to manage your documents
          </p>
        </div>

        <!-- Registration Form -->
        <form
          [formGroup]="registerForm"
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
            <!-- Name Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  for="firstName"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="input-field"
                  [class.border-red-300]="
                    registerForm.get('firstName')?.invalid &&
                    registerForm.get('firstName')?.touched
                  "
                  placeholder="John"
                  autocomplete="given-name"
                />
                <div
                  *ngIf="
                    registerForm.get('firstName')?.invalid &&
                    registerForm.get('firstName')?.touched
                  "
                  class="mt-1 text-sm text-red-600"
                >
                  <span
                    *ngIf="registerForm.get('firstName')?.errors?.['required']"
                    >First name is required</span
                  >
                  <span
                    *ngIf="registerForm.get('firstName')?.errors?.['minlength']"
                    >First name must be at least 2 characters</span
                  >
                </div>
              </div>

              <div>
                <label
                  for="lastName"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="input-field"
                  [class.border-red-300]="
                    registerForm.get('lastName')?.invalid &&
                    registerForm.get('lastName')?.touched
                  "
                  placeholder="Doe"
                  autocomplete="family-name"
                />
                <div
                  *ngIf="
                    registerForm.get('lastName')?.invalid &&
                    registerForm.get('lastName')?.touched
                  "
                  class="mt-1 text-sm text-red-600"
                >
                  <span
                    *ngIf="registerForm.get('lastName')?.errors?.['required']"
                    >Last name is required</span
                  >
                  <span
                    *ngIf="registerForm.get('lastName')?.errors?.['minlength']"
                    >Last name must be at least 2 characters</span
                  >
                </div>
              </div>
            </div>

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
                  registerForm.get('email')?.invalid &&
                  registerForm.get('email')?.touched
                "
                placeholder="john.doe@example.com"
                autocomplete="email"
              />
              <div
                *ngIf="
                  registerForm.get('email')?.invalid &&
                  registerForm.get('email')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                <span *ngIf="registerForm.get('email')?.errors?.['required']"
                  >Email is required</span
                >
                <span *ngIf="registerForm.get('email')?.errors?.['email']"
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
                    registerForm.get('password')?.invalid &&
                    registerForm.get('password')?.touched
                  "
                  placeholder="Create a strong password"
                  autocomplete="new-password"
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
                  registerForm.get('password')?.invalid &&
                  registerForm.get('password')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                <span *ngIf="registerForm.get('password')?.errors?.['required']"
                  >Password is required</span
                >
                <span
                  *ngIf="registerForm.get('password')?.errors?.['minlength']"
                  >Password must be at least 8 characters</span
                >
                <span *ngIf="registerForm.get('password')?.errors?.['pattern']"
                  >Password must contain uppercase, lowercase, number and
                  special character</span
                >
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div>
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  class="input-field pr-10"
                  [class.border-red-300]="
                    registerForm.get('confirmPassword')?.invalid &&
                    registerForm.get('confirmPassword')?.touched
                  "
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  (click)="toggleConfirmPasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg
                    *ngIf="!showConfirmPassword()"
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
                    *ngIf="showConfirmPassword()"
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
                  registerForm.get('confirmPassword')?.invalid &&
                  registerForm.get('confirmPassword')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                <span
                  *ngIf="registerForm.get('confirmPassword')?.errors?.['required']"
                  >Please confirm your password</span
                >
                <span
                  *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']"
                  >Passwords do not match</span
                >
              </div>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="flex items-start">
            <input
              id="acceptTerms"
              type="checkbox"
              formControlName="acceptTerms"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <label for="acceptTerms" class="ml-2 block text-sm text-gray-700">
              I agree to the
              <a href="#" class="text-primary-600 hover:text-primary-500"
                >Terms of Service</a
              >
              and
              <a href="#" class="text-primary-600 hover:text-primary-500"
                >Privacy Policy</a
              >
            </label>
          </div>
          <div
            *ngIf="
              registerForm.get('acceptTerms')?.invalid &&
              registerForm.get('acceptTerms')?.touched
            "
            class="text-sm text-red-600"
          >
            You must accept the terms and conditions
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="registerForm.invalid || isLoading()"
            class="btn-primary w-full flex justify-center items-center"
            [class.opacity-50]="registerForm.invalid || isLoading()"
            [class.cursor-not-allowed]="registerForm.invalid || isLoading()"
          >
            <div *ngIf="isLoading()" class="loading-spinner mr-2"></div>
            {{ isLoading() ? "Creating account..." : "Create Account" }}
          </button>

          <!-- Login Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <a
                routerLink="/login"
                class="text-primary-600 hover:text-primary-500 font-medium"
              >
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal("");
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group(
      {
        firstName: ["", [Validators.required, Validators.minLength(2)]],
        lastName: ["", [Validators.required, Validators.minLength(2)]],
        email: ["", [Validators.required, Validators.email]],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
            ),
          ],
        ],
        confirmPassword: ["", [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set("");

      const { firstName, lastName, email, password } = this.registerForm.value;

      this.authService
        .register({ firstName, lastName, email, password })
        .subscribe({
          next: () => {
            this.isLoading.set(false);
            this.router.navigate(["/dashboard"]);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set(
              error.error?.message || "Registration failed. Please try again."
            );
          },
        });
    }
  }
}
