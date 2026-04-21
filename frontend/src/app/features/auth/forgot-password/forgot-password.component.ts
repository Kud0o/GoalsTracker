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
  template: `
    <div class="flex justify-center items-center min-h-[70vh] px-4">
      <div class="card bg-base-100 shadow-xl w-full max-w-md">
        <div class="card-body">
          <h2 class="card-title text-2xl justify-center mb-2">Reset Password</h2>
          <p class="text-base-content/60 text-center mb-4">Enter your email and we'll send you a reset link.</p>

          @if (successMessage()) {
            <div class="alert alert-success mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ successMessage() }}</span>
            </div>
          }

          @if (errorMessage()) {
            <div class="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          @if (!successMessage()) {
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-control mb-6">
                <label class="label" for="email">
                  <span class="label-text">Email Address</span>
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
                      @if (form.controls.email.errors['required']) { Email is required }
                      @else if (form.controls.email.errors['email']) { Please enter a valid email }
                    </span>
                  </label>
                }
              </div>

              <button type="submit" class="btn btn-primary w-full" [disabled]="loading()">
                @if (loading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                  Sending...
                } @else {
                  Send Reset Link
                }
              </button>
            </form>
          }

          <div class="text-center text-sm mt-4">
            <a routerLink="/login" class="link link-primary">Back to Sign In</a>
          </div>
        </div>
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
