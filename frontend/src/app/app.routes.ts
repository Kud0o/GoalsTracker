/**
 * Application route definitions for the GoalsTracker app.
 * Uses lazy-loaded standalone components and the authGuard for protected routes.
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'goals',
    loadComponent: () =>
      import('./features/goals/goal-list/goal-list.component').then((m) => m.GoalListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'goals/new',
    loadComponent: () =>
      import('./features/goals/goal-form/goal-form.component').then((m) => m.GoalFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'goals/:id',
    loadComponent: () =>
      import('./features/goals/goal-detail/goal-detail.component').then(
        (m) => m.GoalDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'goals/:id/edit',
    loadComponent: () =>
      import('./features/goals/goal-form/goal-form.component').then((m) => m.GoalFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'points',
    loadComponent: () =>
      import('./features/points/points-summary/points-summary.component').then(
        (m) => m.PointsSummaryComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'points/history',
    loadComponent: () =>
      import('./features/points/points-history/points-history.component').then(
        (m) => m.PointsHistoryComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./features/leaderboard/leaderboard.component').then((m) => m.LeaderboardComponent),
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./features/analytics/strength-analysis.component').then(
        (m) => m.StrengthAnalysisComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
];
