import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, switchMap, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip auth for login/register endpoints
  if (req.url.includes("/auth/login") || req.url.includes("/auth/register")) {
    return next(req);
  }

  const token = authService.getAuthToken();

  // Clone request and add authorization header if token exists
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      // Handle 401 Unauthorized - token might be expired
      if (error.status === 401 && token) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the original request with new token
            const newToken = authService.getAuthToken();
            const retryReq = newToken
              ? req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`,
                  },
                })
              : req;
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh failed, logout user
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
