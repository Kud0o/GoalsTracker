/**
 * Forgot password page component.
 * Provides an email input to request a password reset link.
 * Shows a success message after submission and links back to login.
 */

import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

/**
 * Collects the user's email and sends a password reset request.
 * Displays a success alert once the reset link has been sent.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  styles: [`
    @keyframes checkmark-draw {
      0% { stroke-dashoffset: 48; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes circle-fill {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .checkmark-animated circle {
      animation: circle-fill 0.4s ease-out forwards;
    }
    .checkmark-animated path {
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: checkmark-draw 0.4s ease-out 0.3s forwards;
    }
  `],
  template: `
    <div class="flex justify-center items-center min-h-[80vh] px-4 py-8 bg-base-200/30">
      <div class="w-full max-w-md">
        @if (successMessage()) {
          <!-- Success state with animated checkmark -->
          <div class="card bg-base-100 shadow-xl border border-success/30">
            <div class="card-body p-8 items-center text-center">
              <!-- Animated checkmark -->
              <div class="mb-4">
                <svg class="checkmark-animated w-20 h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="25" fill="none" stroke="oklch(var(--su))" stroke-width="2" opacity="0.2"/>
                  <circle cx="26" cy="26" r="25" fill="oklch(var(--su)/0.1)"/>
                  <path fill="none" stroke="oklch(var(--su))" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>

              <h2 class="text-2xl font-bold text-success mb-2">Check Your Email</h2>
              <div class="w-12 h-1 bg-gradient-to-r from-success to-success/50 rounded-full mx-auto mb-3"></div>
              <p class="text-base-content/70 mb-6 leading-relaxed">{{ successMessage() }}</p>

              <div class="bg-success/5 rounded-xl p-4 w-full mb-6">
                <div class="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-success mt-0.5 shrink-0">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/>
                  </svg>
                  <p class="text-sm text-base-content/60">Didn't receive the email? Check your spam folder or try again in a few minutes.</p>
                </div>
              </div>

              <a routerLink="/login" class="btn btn-primary btn-lg w-full gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
                </svg>
                Back to Sign In
              </a>
            </div>
          </div>
        } @else {
          <!-- Request form state -->
          <div class="card bg-base-100 shadow-xl border border-base-300">
            <div class="card-body p-8 items-center">
              <!-- Large envelope icon -->
              <div class="mb-4">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-primary">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                  </svg>
                </div>
              </div>

              <h2 class="text-2xl font-bold text-center mb-1">Forgot Password?</h2>
              <!-- Gradient accent line -->
              <div class="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mb-2"></div>
              <p class="text-base-content/60 text-center mb-6 max-w-xs leading-relaxed">No worries! Enter your email address and we'll send you a link to reset your password.</p>

              @if (errorMessage()) {
                <div class="alert alert-error mb-4 w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="w-full">
                <div class="form-control mb-6">
                  <label class="label" for="email">
                    <span class="label-text font-medium">Email Address</span>
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
                      type="email"
                      formControlName="email"
                      class="input input-bordered input-lg w-full pl-11 focus:input-primary"
                      placeholder="you@example.com"
                    />
                  </div>
                  @if (form.controls.email.touched && form.controls.email.errors) {
                    <label class="label">
                      <span class="label-text-alt text-error">
                        @if (form.controls.email.errors['required']) { Email is required }
                        @else if (form.controls.email.errors['email']) { Please enter a valid email }
                      </span>
                    </label>
                  }
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-full gap-2 text-base shadow-md" [disabled]="loading()">
                  @if (loading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                    Sending...
                  } @else {
                    Send Reset Link
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z"/>
                    </svg>
                  }
                </button>
              </form>

              <div class="divider text-base-content/40 text-xs w-full">OR</div>

              <div class="flex flex-col gap-2 text-center text-sm">
                <a routerLink="/login" class="link link-hover link-primary flex items-center justify-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                    <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
                  </svg>
                  Back to Sign In
                </a>
                <span class="text-base-content/60">
                  Don't have an account?
                  <a routerLink="/register" class="link link-primary font-medium">Create one</a>
                </span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  /** Reactive form with a single email field. */
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  /** Sends the password reset request to the API. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email } = this.form.getRawValue();
    this.api.post('/auth/forgot-password', { email }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Password reset link has been sent to your email. Please check your inbox.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Failed to send reset link. Please try again.');
      },
    });
  }
}
