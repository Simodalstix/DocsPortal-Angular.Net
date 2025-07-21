import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full",
  },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./features/auth/register/register.component").then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  // {
  //   path: "documents",
  //   loadChildren: () =>
  //     import("./features/documents/documents.routes").then(
  //       (m) => m.documentsRoutes
  //     ),
  //   canActivate: [authGuard],
  // },
  // {
  //   path: "profile",
  //   loadComponent: () =>
  //     import("./features/profile/profile.component").then(
  //       (m) => m.ProfileComponent
  //     ),
  //   canActivate: [authGuard],
  // },
  {
    path: "**",
    loadComponent: () =>
      import("./shared/components/not-found/not-found.component").then(
        (m) => m.NotFoundComponent
      ),
  },
];
