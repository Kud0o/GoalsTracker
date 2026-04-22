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
    <div class="min-h-[85vh] flex">
      <!-- Right side form comes first in DOM for mobile, flex order adjusts on desktop -->
      <div class="flex-1 flex justify-center items-center px-4 py-8 bg-base-200/30 order-1 lg:order-2">
        <div class="w-full max-w-md">
          <!-- Mobile header -->
          <div class="lg:hidden text-center mb-6">
            <div class="flex justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-secondary">
                <path d="M5 3h14v2h2v6h-2.05a6.5 6.5 0 01-5.45 5.91V19h3v2H7.5v-2h3v-2.09A6.5 6.5 0 015.05 11H3V5h2V3zm2 2v4.5a4.5 4.5 0 109 0V5H7zM5 7v2h.05A6.52 6.52 0 015 7zm14 0c0 .69-.02 1.36-.05 2H19V7z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-base-content">Join GoalsTracker</h1>
          </div>

          <div class="card bg-base-100 shadow-xl border border-base-300">
            <div class="card-body p-8">
              <h2 class="card-title text-2xl justify-center mb-1">Create Account</h2>
              <!-- Gradient accent line -->
              <div class="w-12 h-1 bg-gradient-to-r from-secondary to-primary rounded-full mx-auto mb-2"></div>
              <p class="text-base-content/60 text-center mb-4">Start tracking your goals and earning points.</p>

              <!-- Step indicators (decorative) -->
              <div class="flex items-center justify-center gap-2 mb-6">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
                  <span class="text-xs font-medium text-base-content/70">Account Details</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-base-content/30">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
                </svg>
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-base-300 text-base-content/40 flex items-center justify-center text-xs font-bold">2</div>
                  <span class="text-xs font-medium text-base-content/40">Preferences</span>
                </div>
              </div>

              @if (errorMessage()) {
                <div class="alert alert-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <div class="form-control">
                    <label class="label" for="firstName">
                      <span class="label-text font-medium">First Name</span>
                    </label>
                    <input id="firstName" type="text" formControlName="firstName" class="input input-bordered input-lg w-full focus:input-primary" placeholder="First name" />
                    @if (form.controls.firstName.touched && form.controls.firstName.errors) {
                      <p role="alert" class="mt-1">
                        <span class="text-error text-sm">
                          @if (form.controls.firstName.errors['required']) { First name is required }
                          @else if (form.controls.firstName.errors['maxlength']) { Max 50 characters }
                        </span>
                      </p>
                    }
                  </div>
                  <div class="form-control">
                    <label class="label" for="lastName">
                      <span class="label-text font-medium">Last Name</span>
                    </label>
                    <input id="lastName" type="text" formControlName="lastName" class="input input-bordered input-lg w-full focus:input-primary" placeholder="Last name" />
                    @if (form.controls.lastName.touched && form.controls.lastName.errors) {
                      <p role="alert" class="mt-1">
                        <span class="text-error text-sm">
                          @if (form.controls.lastName.errors['required']) { Last name is required }
                          @else if (form.controls.lastName.errors['maxlength']) { Max 50 characters }
                        </span>
                      </p>
                    }
                  </div>
                </div>

                <div class="form-control mb-3">
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
                    <input id="email" type="email" formControlName="email" class="input input-bordered input-lg w-full pl-11 focus:input-primary" placeholder="you@example.com" />
                  </div>
                  @if (form.controls.email.touched && form.controls.email.errors) {
                    <p role="alert" class="mt-1">
                      <span class="text-error text-sm">
                        @if (form.controls.email.errors['required']) { Email is required }
                        @else if (form.controls.email.errors['email']) { Please enter a valid email }
                      </span>
                    </p>
                  }
                </div>

                <div class="form-control mb-3">
                  <label class="label" for="username">
                    <span class="label-text font-medium">Username</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                      </svg>
                    </span>
                    <input id="username" type="text" formControlName="userName" class="input input-bordered input-lg w-full pl-11 focus:input-primary" placeholder="Choose a display name" />
                  </div>
                  @if (form.controls.userName.touched && form.controls.userName.errors) {
                    <p role="alert" class="mt-1">
                      <span class="text-error text-sm">
                        @if (form.controls.userName.errors['required']) { Username is required }
                        @else if (form.controls.userName.errors['minlength']) { Username must be at least 3 characters }
                      </span>
                    </p>
                  }
                </div>

                <div class="form-control mb-1">
                  <label class="label" for="password">
                    <span class="label-text font-medium">Password</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                      </svg>
                    </span>
                    <input id="password" type="password" formControlName="password" class="input input-bordered input-lg w-full pl-11 focus:input-primary" placeholder="At least 8 characters" />
                  </div>
                  @if (form.controls.password.touched && form.controls.password.errors) {
                    <p role="alert" class="mt-1">
                      <span class="text-error text-sm">
                        @if (form.controls.password.errors['required']) { Password is required }
                        @else if (form.controls.password.errors['minlength']) { Password must be at least 8 characters }
                      </span>
                    </p>
                  }
                </div>

                <!-- Password strength indicator -->
                <div class="flex gap-1 mb-3 px-1">
                  <div class="h-1 flex-1 rounded-full transition-all duration-300"
                       [class]="passwordLength() > 0 ? 'bg-error' : 'bg-base-300'"></div>
                  <div class="h-1 flex-1 rounded-full transition-all duration-300"
                       [class]="passwordLength() >= 4 ? 'bg-warning' : 'bg-base-300'"></div>
                  <div class="h-1 flex-1 rounded-full transition-all duration-300"
                       [class]="passwordLength() >= 8 ? 'bg-info' : 'bg-base-300'"></div>
                  <div class="h-1 flex-1 rounded-full transition-all duration-300"
                       [class]="passwordLength() >= 12 ? 'bg-success' : 'bg-base-300'"></div>
                </div>

                <div class="form-control mb-3">
                  <label class="label" for="confirmPassword">
                    <span class="label-text font-medium">Confirm Password</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </span>
                    <input id="confirmPassword" type="password" formControlName="confirmPassword" class="input input-bordered input-lg w-full pl-11 focus:input-primary" placeholder="Re-enter your password" />
                  </div>
                  @if (form.controls.confirmPassword.touched && (form.controls.confirmPassword.errors || form.errors?.['passwordMismatch'])) {
                    <p role="alert" class="mt-1">
                      <span class="text-error text-sm">
                        @if (form.controls.confirmPassword.errors?.['required']) { Please confirm your password }
                        @else if (form.errors?.['passwordMismatch']) { Passwords do not match }
                      </span>
                    </p>
                  }
                </div>

                <div class="form-control mb-6">
                  <label class="label" for="timezone">
                    <span class="label-text font-medium">Timezone</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/>
                      </svg>
                    </span>
                    <select id="timezone" formControlName="timezone" class="select select-bordered select-lg w-full pl-11 focus:select-primary">
                      <option value="">Select your timezone</option>
                      @for (tz of timezones; track tz) {
                        <option [value]="tz">{{ tz }}</option>
                      }
                    </select>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-full gap-2 text-base shadow-md" [disabled]="loading()">
                  @if (loading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                    Creating Account...
                  } @else {
                    Create Account
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                      <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
                    </svg>
                  }
                </button>
              </form>

              <div class="text-center text-sm mt-4">
                <span class="text-base-content/60">
                  Already have an account?
                  <a routerLink="/login" class="link link-primary font-medium">Sign in</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Left decorative panel - hidden on mobile -->
      <div class="hidden lg:flex lg:w-5/12 bg-gradient-to-bl from-secondary via-secondary/90 to-primary relative overflow-hidden order-2 lg:order-1">
        <div class="absolute inset-0 opacity-10">
          <!-- Decorative shapes -->
          <div class="absolute top-16 right-12 w-36 h-36 rounded-full border-4 border-white/30"></div>
          <div class="absolute top-48 left-14 w-20 h-20 rounded-full bg-white/10"></div>
          <div class="absolute bottom-40 right-20 w-28 h-28 rotate-12 border-4 border-white/20 rounded-lg"></div>
          <div class="absolute bottom-16 left-8 w-44 h-44 rounded-full border-2 border-white/20"></div>
          <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full border border-white/10"></div>
        </div>
        <div class="relative z-10 flex flex-col justify-center px-12 text-white">
          <!-- Rocket icon -->
          <div class="mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 text-yellow-300 drop-shadow-lg">
              <path d="M9.315 7.584C12.195 3.883 16.615 1.5 21.5 1.5c.39 0 .694.26.742.639C22.788 6.73 20.864 11.328 17.416 14.186l.348 3.482a.75.75 0 01-.387.72l-3.75 1.875a.75.75 0 01-1.035-.378l-1.358-3.017-3.017-1.358a.75.75 0 01-.378-1.035l1.875-3.75a.75.75 0 01.72-.387l3.482.348C16.07 8.974 13.628 7.078 9.315 7.584zM16 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M5.22 14.78a.75.75 0 011.06 0l2.94 2.94a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.14-.094l-2.69-3.59a.75.75 0 01.08-.97l2-2z"/>
            </svg>
          </div>
          <h1 class="text-4xl font-bold mb-4 leading-tight">Begin your<br/>journey today</h1>
          <p class="text-white/80 text-lg mb-8 leading-relaxed">Join thousands of achievers who track their goals, build habits, and celebrate progress every day.</p>
          <div class="space-y-3">
            <div class="flex items-center gap-3 text-white/80">
              <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span>Set and track unlimited goals</span>
            </div>
            <div class="flex items-center gap-3 text-white/80">
              <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span>Earn points for achievements</span>
            </div>
            <div class="flex items-center gap-3 text-white/80">
              <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span>Powerful analytics and insights</span>
            </div>
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
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    userName: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    timezone: [''],
  }, { validators: [RegisterComponent.passwordMatchValidator] });

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  /** Reactive password length for the strength indicator. Updated via valueChanges. */
  readonly passwordLength = signal(0);

  constructor() {
    this.form.controls.password.valueChanges.subscribe(val => {
      this.passwordLength.set(val?.length ?? 0);
    });
  }

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

    const { firstName, lastName, email, userName, password, timezone } = this.form.getRawValue();
    this.auth.register(email, userName, password, timezone || undefined, firstName, lastName).subscribe({
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
