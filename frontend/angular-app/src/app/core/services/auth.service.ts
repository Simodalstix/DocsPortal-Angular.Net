import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, BehaviorSubject, tap, catchError, of } from "rxjs";
import { environment } from "../../../environments/environment";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Modern Angular signals for reactive state
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  // Observable streams for components that need them
  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    if (token && !this.isTokenExpired(token)) {
      const user = this.getStoredUser();
      if (user) {
        this.setAuthState(user, true);
      }
    } else {
      this.clearAuthState();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.handleAuthSuccess(response);
        }),
        catchError((error) => {
          console.error("Login failed:", error);
          throw error;
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        tap((response) => {
          this.handleAuthSuccess(response);
        }),
        catchError((error) => {
          console.error("Registration failed:", error);
          throw error;
        })
      );
  }

  logout(): void {
    this.clearStoredAuth();
    this.clearAuthState();
    this.router.navigate(["/login"]);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      this.logout();
      return of();
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          this.handleAuthSuccess(response);
        }),
        catchError((error) => {
          console.error("Token refresh failed:", error);
          this.logout();
          throw error;
        })
      );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.storeAuthData(response);
    this.setAuthState(response.user, true);
  }

  private setAuthState(user: User, isAuthenticated: boolean): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(isAuthenticated);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  private clearAuthState(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    localStorage.setItem("tokenExpiry", response.expiresAt);
  }

  private clearStoredAuth(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("refreshToken");
  }

  private getStoredToken(): string | null {
    return localStorage.getItem("authToken");
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  private isTokenExpired(token: string): boolean {
    const expiry = localStorage.getItem("tokenExpiry");
    if (!expiry) return true;

    return new Date() >= new Date(expiry);
  }

  getAuthToken(): string | null {
    const token = this.getStoredToken();
    return token && !this.isTokenExpired(token) ? token : null;
  }
}
