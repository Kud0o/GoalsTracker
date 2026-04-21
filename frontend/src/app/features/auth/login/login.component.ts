/**
 * Login page component with reactive form validation and auth integration.
 * Displays a centered DaisyUI card with email/password inputs, error alerts,
 * and navigation links to register and forgot-password routes.
 */

import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Handles user authentication via email and password.
 * On successful login, redirects to the returnUrl query param or /dashboard.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex justify-center items-center min-h-[70vh] px-4">
      <div class="card bg-base-100 shadow-xl w-full max-w-md">
        <div class="card-body">
          <h2 class="card-title text-2xl justify-center mb-2">Sign In</h2>
          <p class="text-base-content/60 text-center mb-4">Welcome back! Enter your credentials to continue.</p>

          @if (errorMessage()) {
            <div class="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-control mb-4">
              <label class="label" for="email">
                <span class="label-text">Email</span>
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="input input-bordered w-full"
                placeholder="you@example.com"
              />
              @if (form.controls.email.touched && form.controls.email.errors) {
                <label class="label">
                  <span class="label-text-alt text-error">
                    @if (form.controls.email.errors['required']) {
                      Email is required
                    } @else if (form.controls.email.errors['email']) {
                      Please enter a valid email
                    }
                  </span>
                </label>
              }
            </div>

            <div class="form-control mb-6">
              <label class="label" for="password">
                <span class="label-text">Password</span>
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="input input-bordered w-full"
                placeholder="Enter your password"
              />
              @if (form.controls.password.touched && form.controls.password.errors) {
                <label class="label">
                  <span class="label-text-alt text-error">Password is required</span>
                </label>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="loading loading-spinner loading-sm"></span>
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="divider">OR</div>

          <div class="flex flex-col gap-2 text-center text-sm">
            <a routerLink="/forgot-password" class="link link-hover link-primary">Forgot your password?</a>
            <span class="text-base-content/60">
              Don't have an account?
              <a routerLink="/register" class="link link-primary">Create one</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Reactive form with email and password fields. */
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  /** Whether a login request is in progress. */
  readonly loading = signal(false);

  /** Error message to display in the alert, if any. */
  readonly errorMessage = signal('');

  /** Submits the login form to the auth service. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Login failed. Please check your credentials.');
      },
    });
  }
}
