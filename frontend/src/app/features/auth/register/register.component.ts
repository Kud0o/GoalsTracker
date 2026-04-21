/**
 * Registration page component with reactive form validation.
 * Collects email, username, password (with confirmation), and timezone.
 * On success, navigates to the dashboard.
 */

import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Handles new user registration with form validation including
 * password match cross-field validation and timezone selection.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex justify-center items-center min-h-[70vh] px-4 py-8">
      <div class="card bg-base-100 shadow-xl w-full max-w-md">
        <div class="card-body">
          <h2 class="card-title text-2xl justify-center mb-2">Create Account</h2>
          <p class="text-base-content/60 text-center mb-4">Start tracking your goals and earning points.</p>

          @if (errorMessage()) {
            <div class="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-control mb-3">
              <label class="label" for="email">
                <span class="label-text">Email</span>
              </label>
              <input id="email" type="email" formControlName="email" class="input input-bordered w-full" placeholder="you@example.com" />
              @if (form.controls.email.touched && form.controls.email.errors) {
                <label class="label">
                  <span class="label-text-alt text-error">
                    @if (form.controls.email.errors['required']) { Email is required }
                    @else if (form.controls.email.errors['email']) { Please enter a valid email }
                  </span>
                </label>
              }
            </div>

            <div class="form-control mb-3">
              <label class="label" for="username">
                <span class="label-text">Username</span>
              </label>
              <input id="username" type="text" formControlName="userName" class="input input-bordered w-full" placeholder="Choose a display name" />
              @if (form.controls.userName.touched && form.controls.userName.errors) {
                <label class="label">
                  <span class="label-text-alt text-error">
                    @if (form.controls.userName.errors['required']) { Username is required }
                    @else if (form.controls.userName.errors['minlength']) { Username must be at least 3 characters }
                  </span>
                </label>
              }
            </div>

            <div class="form-control mb-3">
              <label class="label" for="password">
                <span class="label-text">Password</span>
              </label>
              <input id="password" type="password" formControlName="password" class="input input-bordered w-full" placeholder="At least 8 characters" />
              @if (form.controls.password.touched && form.controls.password.errors) {
                <label class="label">
                  <span class="label-text-alt text-error">
                    @if (form.controls.password.errors['required']) { Password is required }
                    @else if (form.controls.password.errors['minlength']) { Password must be at least 8 characters }
                  </span>
                </label>
              }
            </div>

            <div class="form-control mb-3">
              <label class="label" for="confirmPassword">
                <span class="label-text">Confirm Password</span>
              </label>
              <input id="confirmPassword" type="password" formControlName="confirmPassword" class="input input-bordered w-full" placeholder="Re-enter your password" />
              @if (form.controls.confirmPassword.touched && (form.controls.confirmPassword.errors || form.errors?.['passwordMismatch'])) {
                <label class="label">
                  <span class="label-text-alt text-error">
                    @if (form.controls.confirmPassword.errors?.['required']) { Please confirm your password }
                    @else if (form.errors?.['passwordMismatch']) { Passwords do not match }
                  </span>
                </label>
              }
            </div>

            <div class="form-control mb-6">
              <label class="label" for="timezone">
                <span class="label-text">Timezone</span>
              </label>
              <select id="timezone" formControlName="timezone" class="select select-bordered w-full">
                <option value="">Select your timezone</option>
                @for (tz of timezones; track tz) {
                  <option [value]="tz">{{ tz }}</option>
                }
              </select>
            </div>

            <button type="submit" class="btn btn-primary w-full" [disabled]="loading()">
              @if (loading()) {
                <span class="loading loading-spinner loading-sm"></span>
                Creating Account...
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="text-center text-sm mt-4">
            <span class="text-base-content/60">
              Already have an account?
              <a routerLink="/login" class="link link-primary">Sign in</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Common IANA timezone identifiers for the dropdown. */
  readonly timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Anchorage', 'Pacific/Honolulu', 'America/Toronto', 'America/Vancouver',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai',
    'Australia/Sydney', 'Pacific/Auckland', 'America/Sao_Paulo', 'Africa/Cairo',
  ];

  /** Reactive form with cross-field password match validation. */
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    userName: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    timezone: [''],
  }, { validators: [RegisterComponent.passwordMatchValidator] });

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  /** Cross-field validator ensuring password and confirmPassword match. */
  static passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    if (password && confirm && password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /** Submits the registration form to the auth service. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, userName, password, timezone } = this.form.getRawValue();
    this.auth.register(email, userName, password, timezone || undefined).subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Registration failed. Please try again.');
      },
    });
  }
}
