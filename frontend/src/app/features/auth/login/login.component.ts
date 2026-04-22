/**
 * Login page component with reactive form validation and auth integration.
 * Displays a split layout with decorative gradient panel and form card.
 * On mobile, shows the form centered with a compact header.
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
    <div class="min-h-[85vh] flex">
      <!-- Left decorative panel - hidden on mobile -->
      <div class="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary via-primary/90 to-secondary relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <!-- Decorative shapes -->
          <div class="absolute top-20 left-10 w-32 h-32 rounded-full border-4 border-white/30"></div>
          <div class="absolute top-40 right-16 w-20 h-20 rounded-full bg-white/10"></div>
          <div class="absolute bottom-32 left-20 w-24 h-24 rotate-45 border-4 border-white/20"></div>
          <div class="absolute bottom-20 right-10 w-40 h-40 rounded-full border-2 border-white/20"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/10"></div>
        </div>
        <div class="relative z-10 flex flex-col justify-center px-12 text-white">
          <!-- Trophy icon -->
          <div class="mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 text-yellow-300 drop-shadow-lg">
              <path d="M5 3h14v2h2v6h-2.05a6.5 6.5 0 01-5.45 5.91V19h3v2H7.5v-2h3v-2.09A6.5 6.5 0 015.05 11H3V5h2V3zm2 2v4.5a4.5 4.5 0 109 0V5H7zM5 7v2h.05A6.52 6.52 0 015 7zm14 0c0 .69-.02 1.36-.05 2H19V7z"/>
            </svg>
          </div>
          <h1 class="text-4xl font-bold mb-4 leading-tight">Welcome back to<br/>GoalsTracker</h1>
          <p class="text-white/80 text-lg mb-8 leading-relaxed">Track your goals, earn points, and climb the leaderboard. Your journey to success starts with a single step.</p>
          <div class="flex items-center gap-4 text-white/70 text-sm">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-green-300">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Set goals
            </div>
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-green-300">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Earn points
            </div>
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-green-300">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Compete
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - form -->
      <div class="flex-1 flex justify-center items-center px-4 py-8 bg-base-200/30">
        <div class="w-full max-w-md">
          <!-- Mobile header -->
          <div class="lg:hidden text-center mb-8">
            <div class="flex justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-primary">
                <path d="M5 3h14v2h2v6h-2.05a6.5 6.5 0 01-5.45 5.91V19h3v2H7.5v-2h3v-2.09A6.5 6.5 0 015.05 11H3V5h2V3zm2 2v4.5a4.5 4.5 0 109 0V5H7zM5 7v2h.05A6.52 6.52 0 015 7zm14 0c0 .69-.02 1.36-.05 2H19V7z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-base-content">GoalsTracker</h1>
          </div>

          <div class="card bg-base-100 shadow-xl border border-base-300">
            <div class="card-body p-8">
              <h2 class="card-title text-2xl justify-center mb-1">Sign In</h2>
              <!-- Gradient accent line -->
              <div class="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-2"></div>
              <p class="text-base-content/60 text-center mb-6">Welcome back! Enter your credentials to continue.</p>

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
                    <span class="label-text font-medium">Email</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autocomplete="email"
                      formControlName="email"
                      class="input input-bordered input-lg w-full pl-11 focus:input-primary"
                      placeholder="you@example.com"
                    />
                  </div>
                  @if (form.controls.email.touched && form.controls.email.errors) {
                    <p role="alert" class="mt-1">
                      <span class="text-error text-sm">
                        @if (form.controls.email.errors['required']) {
                          Email is required
                        } @else if (form.controls.email.errors['email']) {
                          Please enter a valid email
                        }
                      </span>
                    </p>
                  }
                </div>

                <div class="form-control mb-6">
                  <label class="label" for="password">
                    <span class="label-text font-medium">Password</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autocomplete="current-password"
                      formControlName="password"
                      class="input input-bordered input-lg w-full pl-11 focus:input-primary"
                      placeholder="Enter your password"
                    />
                  </div>
                  @if (form.controls.password.touched && form.controls.password.errors) {
                    <p role="alert" class="mt-1">
                      <span class="text-error text-sm">Password is required</span>
                    </p>
                  }
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-full gap-2 text-base shadow-md"
                  [disabled]="loading()"
                >
                  @if (loading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                    Signing in...
                  } @else {
                    Sign In
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                      <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
                    </svg>
                  }
                </button>
              </form>

              <div class="flex flex-col gap-2 text-center text-sm mt-4">
                <a routerLink="/forgot-password" class="link link-hover link-primary">Forgot your password?</a>
                <span class="text-base-content/60">
                  Don't have an account?
                  <a routerLink="/register" class="link link-primary font-medium">Create one</a>
                </span>
              </div>
            </div>
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
