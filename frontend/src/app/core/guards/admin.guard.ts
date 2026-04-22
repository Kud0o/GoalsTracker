/**
 * Route guard that protects admin-only routes.
 * Redirects non-admin users to the dashboard page.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Functional route guard checking admin role from the JWT token. */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (authService.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
