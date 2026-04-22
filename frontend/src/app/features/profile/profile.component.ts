/**
 * Profile page component for viewing and editing user settings.
 * Displays editable username, timezone select, leaderboard opt-in toggle,
 * member-since date, and achievement level with badge.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { AchievementBadgeComponent } from '../../shared/components/achievement-badge/achievement-badge.component';

/**
 * Loads the user profile from the API and presents an editable form
 * with username, timezone, and leaderboard visibility toggle.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, LoadingSpinnerComponent, AchievementBadgeComponent],
  template: `
    <div class="container mx-auto max-w-2xl p-4 space-y-6">
      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (user()) {
        <!-- Profile Header -->
        <div class="profile-header relative overflow-hidden rounded-2xl shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90"></div>
          <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"></div>
          <div class="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10"></div>

          <div class="relative z-10 p-8 flex flex-col sm:flex-row items-center gap-6 text-white">
            <!-- Avatar -->
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center leading-none text-4xl sm:text-5xl font-bold text-primary ring-4 ring-white/30 shadow-lg flex-shrink-0">
              <span>{{ user()!.userName.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="text-center sm:text-left flex-1">
              <h1 class="text-2xl sm:text-3xl font-bold mb-1">{{ user()!.userName }}</h1>
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <app-achievement-badge [levelName]="getLevelName()" size="md" />
                <span class="text-sm opacity-80">{{ user()!.totalPoints }} points</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1.5 text-sm opacity-70">
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                <span>Member since {{ user()!.memberSince | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-3">
          <div class="card bg-base-100 shadow-md border border-base-200">
            <div class="card-body items-center text-center p-4">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <svg class="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <p class="text-2xl font-bold text-base-content">{{ user()!.totalPoints }}</p>
              <p class="text-xs text-base-content/50 uppercase tracking-wider">Total Points</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-md border border-base-200">
            <div class="card-body items-center text-center p-4">
              <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mb-1">
                <svg class="w-5 h-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p class="text-2xl font-bold text-base-content">{{ getLevelName() }}</p>
              <p class="text-xs text-base-content/50 uppercase tracking-wider">Current Level</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-md border border-base-200">
            <div class="card-body items-center text-center p-4">
              <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center mb-1">
                <svg class="w-5 h-5 text-info" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-7a1 1 0 10-2 0v3a1 1 0 002 0V9zm-1-3a1 1 0 100 2 1 1 0 000-2z"/>
                </svg>
              </div>
              <p class="text-2xl font-bold text-base-content">{{ user()!.email.split('@')[0] }}</p>
              <p class="text-xs text-base-content/50 uppercase tracking-wider">Account</p>
            </div>
          </div>
        </div>

        <!-- Edit Form Card -->
        <div class="card bg-base-100 shadow-md border border-base-200">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-6">
              <svg class="w-5 h-5 text-base-content/70" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              <h2 class="text-xl font-bold">Edit Profile</h2>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <!-- First Name & Last Name -->
              <div class="grid grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label" for="firstName">
                    <span class="label-text font-medium">First Name</span>
                  </label>
                  <input id="firstName" type="text" formControlName="firstName"
                    class="input input-bordered w-full" placeholder="First name" />
                  @if (form.controls.firstName.touched && form.controls.firstName.errors) {
                    <label class="label">
                      <span class="label-text-alt text-error">
                        @if (form.controls.firstName.errors['required']) { First name is required }
                        @else if (form.controls.firstName.errors['maxlength']) { Max 50 characters }
                      </span>
                    </label>
                  }
                </div>
                <div class="form-control">
                  <label class="label" for="lastName">
                    <span class="label-text font-medium">Last Name</span>
                  </label>
                  <input id="lastName" type="text" formControlName="lastName"
                    class="input input-bordered w-full" placeholder="Last name" />
                  @if (form.controls.lastName.touched && form.controls.lastName.errors) {
                    <label class="label">
                      <span class="label-text-alt text-error">
                        @if (form.controls.lastName.errors['required']) { Last name is required }
                        @else if (form.controls.lastName.errors['maxlength']) { Max 50 characters }
                      </span>
                    </label>
                  }
                </div>
              </div>

              <!-- Username -->
              <div class="form-control">
                <label class="label" for="userName">
                  <span class="label-text font-medium">Username</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg class="w-5 h-5 text-base-content/30" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                  </span>
                  <input id="userName" type="text" formControlName="userName"
                    class="input input-bordered w-full pl-10" placeholder="Enter username" />
                </div>
                @if (form.controls.userName.touched && form.controls.userName.errors) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @if (form.controls.userName.errors['required']) { Username is required }
                      @else if (form.controls.userName.errors['minlength']) { Must be at least 3 characters }
                    </span>
                  </label>
                }
              </div>

              <!-- Timezone -->
              <div class="form-control">
                <label class="label" for="timezone">
                  <span class="label-text font-medium">Timezone</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-base-content/30" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                    </svg>
                  </span>
                  <select id="timezone" formControlName="timezone"
                    class="select select-bordered w-full pl-10">
                    <option value="">Select timezone</option>
                    @for (tz of timezones; track tz) {
                      <option [value]="tz">{{ tz }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Leaderboard Toggle -->
              <div class="form-control">
                <div class="flex items-center justify-between p-4 bg-base-200/50 rounded-xl">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium">Show on Leaderboard</p>
                      <p class="text-xs text-base-content/50">Let others see your rank and achievements</p>
                    </div>
                  </div>
                  <input type="checkbox" formControlName="isPublicOnLeaderboard" class="toggle toggle-primary toggle-lg" />
                </div>
              </div>

              <!-- Save Button -->
              <div class="flex justify-end pt-2">
                <button type="submit" class="btn btn-primary btn-lg gap-2 min-w-[160px]" [disabled]="saving()">
                  @if (saving()) {
                    <span class="loading loading-spinner loading-sm"></span>
                    Saving...
                  } @else if (saved()) {
                    <svg class="w-5 h-5 save-check" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    Saved!
                  } @else {
                    <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                      <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"/>
                    </svg>
                    Save Changes
                  }
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="card border-2 border-error/30 bg-base-100 shadow-md">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <h3 class="text-lg font-bold text-error">Danger Zone</h3>
            </div>
            <p class="text-sm text-base-content/60 mb-4">
              Once you delete your account, there is no going back. All your goals, points, and achievements will be permanently removed.
            </p>
            <div class="flex justify-end">
              <button class="btn btn-outline btn-error btn-sm gap-2">
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .save-check {
      animation: checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes checkPop {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }
  `],
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);

  /** Common IANA timezone identifiers. */
  readonly timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Anchorage', 'Pacific/Honolulu', 'America/Toronto', 'America/Vancouver',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai',
    'Australia/Sydney', 'Pacific/Auckland', 'America/Sao_Paulo', 'Africa/Cairo',
  ];

  /** Extracts the level name whether achievementLevel is a string or object. */
  getLevelName(): string {
    const level = this.user()?.achievementLevel;
    if (!level) return 'Bronze';
    return typeof level === 'string' ? level : level.name;
  }

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly user = signal<User | null>(null);

  /** Reactive form for editable profile fields. */
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    userName: ['', [Validators.required, Validators.minLength(3)]],
    timezone: [''],
    isPublicOnLeaderboard: [false],
  });

  ngOnInit(): void {
    this.api.get<User>('/user/profile').subscribe({
      next: (user) => {
        this.user.set(user);
        this.form.patchValue({
          firstName: (user as any).firstName ?? '',
          lastName: (user as any).lastName ?? '',
          userName: user.userName,
          timezone: user.timezone,
          isPublicOnLeaderboard: user.isPublicOnLeaderboard,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Failed to load profile.');
      },
    });
  }

  /** Saves the updated profile to the API. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saved.set(false);
    const body = this.form.getRawValue();
    this.api.put<any>('/user/profile', body).subscribe({
      next: () => {
        // Update the local user signal with the form values
        const current = this.user();
        if (current) {
          this.user.set({
            ...current,
            userName: body.userName || current.userName,
            timezone: body.timezone || current.timezone,
            isPublicOnLeaderboard: body.isPublicOnLeaderboard,
          });
        }
        this.saving.set(false);
        this.saved.set(true);
        this.notify.success('Profile updated successfully!');
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err.message || 'Failed to update profile.');
      },
    });
  }
}
