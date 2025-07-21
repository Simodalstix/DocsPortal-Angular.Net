import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p class="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <!-- Profile Form -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <!-- Success Message -->
            <div
              *ngIf="successMessage()"
              class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
            >
              {{ successMessage() }}
            </div>

            <!-- Error Message -->
            <div
              *ngIf="errorMessage()"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {{ errorMessage() }}
            </div>

            <div class="space-y-6">
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
                      profileForm.get('firstName')?.invalid &&
                      profileForm.get('firstName')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      profileForm.get('firstName')?.invalid &&
                      profileForm.get('firstName')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    First name is required
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
                      profileForm.get('lastName')?.invalid &&
                      profileForm.get('lastName')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      profileForm.get('lastName')?.invalid &&
                      profileForm.get('lastName')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    Last name is required
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
                    profileForm.get('email')?.invalid &&
                    profileForm.get('email')?.touched
                  "
                />
                <div
                  *ngIf="
                    profileForm.get('email')?.invalid &&
                    profileForm.get('email')?.touched
                  "
                  class="mt-1 text-sm text-red-600"
                >
                  <span *ngIf="profileForm.get('email')?.errors?.['required']"
                    >Email is required</span
                  >
                  <span *ngIf="profileForm.get('email')?.errors?.['email']"
                    >Please enter a valid email</span
                  >
                </div>
              </div>

              <!-- Role Display -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div
                  class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700"
                >
                  {{ currentUser()?.role || "User" }}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  (click)="resetForm()"
                  class="btn-secondary"
                >
                  Reset Changes
                </button>

                <button
                  type="submit"
                  [disabled]="profileForm.invalid || isLoading()"
                  class="btn-primary"
                  [class.opacity-50]="profileForm.invalid || isLoading()"
                  [class.cursor-not-allowed]="
                    profileForm.invalid || isLoading()
                  "
                >
                  <div *ngIf="isLoading()" class="loading-spinner mr-2"></div>
                  {{ isLoading() ? "Saving..." : "Save Changes" }}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Account Actions -->
        <div class="card mt-8">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-gray-900">Account Actions</h2>
          </div>

          <div class="space-y-4">
            <div
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 class="font-medium text-gray-900">Change Password</h3>
                <p class="text-sm text-gray-500">
                  Update your account password
                </p>
              </div>
              <button class="btn-secondary">Change Password</button>
            </div>

            <div
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 class="font-medium text-gray-900">Download Data</h3>
                <p class="text-sm text-gray-500">
                  Export your account data and documents
                </p>
              </div>
              <button class="btn-secondary">Download</button>
            </div>

            <div
              class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
            >
              <div>
                <h3 class="font-medium text-red-900">Delete Account</h3>
                <p class="text-sm text-red-600">
                  Permanently delete your account and all data
                </p>
              </div>
              <button
                class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal("");
  readonly successMessage = signal("");
  readonly currentUser = this.authService.currentUser;

  profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }

  resetForm(): void {
    this.loadUserData();
    this.errorMessage.set("");
    this.successMessage.set("");
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set("");
      this.successMessage.set("");

      // TODO: Implement profile update API call
      // For now, simulate API call
      setTimeout(() => {
        this.isLoading.set(false);
        this.successMessage.set("Profile updated successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage.set("");
        }, 3000);
      }, 1000);
    }
  }
}
