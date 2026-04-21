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
    <div class="container mx-auto max-w-2xl p-4">
      <h1 class="text-3xl font-bold mb-6">Profile</h1>

      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (user()) {
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <!-- Achievement & Member Info -->
            <div class="flex items-center gap-4 mb-6 pb-4 border-b border-base-200">
              <div class="avatar placeholder">
                <div class="bg-primary text-primary-content rounded-full w-16">
                  <span class="text-2xl">{{ user()!.userName.charAt(0).toUpperCase() }}</span>
                </div>
              </div>
              <div>
                <h2 class="text-xl font-semibold">{{ user()!.userName }}</h2>
                <div class="flex items-center gap-2 mt-1">
                  <app-achievement-badge [levelName]="user()!.achievementLevel" size="sm" />
                  <span class="text-sm text-base-content/60">{{ user()!.totalPoints }} points</span>
                </div>
                <p class="text-sm text-base-content/50 mt-1">Member since {{ user()!.memberSince | date:'mediumDate' }}</p>
              </div>
            </div>

            <!-- Edit Form -->
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-control mb-4">
                <label class="label" for="userName">
                  <span class="label-text">Username</span>
                </label>
                <input id="userName" type="text" formControlName="userName" class="input input-bordered w-full" />
                @if (form.controls.userName.touched && form.controls.userName.errors) {
                  <label class="label">
                    <span class="label-text-alt text-error">
                      @if (form.controls.userName.errors['required']) { Username is required }
                      @else if (form.controls.userName.errors['minlength']) { Must be at least 3 characters }
                    </span>
                  </label>
                }
              </div>

              <div class="form-control mb-4">
                <label class="label" for="timezone">
                  <span class="label-text">Timezone</span>
                </label>
                <select id="timezone" formControlName="timezone" class="select select-bordered w-full">
                  <option value="">Select timezone</option>
                  @for (tz of timezones; track tz) {
                    <option [value]="tz">{{ tz }}</option>
                  }
                </select>
              </div>

              <div class="form-control mb-6">
                <label class="label cursor-pointer justify-start gap-4">
                  <span class="label-text">Show me on leaderboard</span>
                  <input type="checkbox" formControlName="isPublicOnLeaderboard" class="toggle toggle-primary" />
                </label>
              </div>

              <div class="card-actions justify-end">
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  @if (saving()) {
                    <span class="loading loading-spinner loading-sm"></span>
                    Saving...
                  } @else {
                    Save Changes
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
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

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly user = signal<User | null>(null);

  /** Reactive form for editable profile fields. */
  readonly form = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    timezone: [''],
    isPublicOnLeaderboard: [false],
  });

  ngOnInit(): void {
    this.api.get<User>('/user/profile').subscribe({
      next: (user) => {
        this.user.set(user);
        this.form.patchValue({
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
    const body = this.form.getRawValue();
    this.api.put<User>('/user/profile', body).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.saving.set(false);
        this.notify.success('Profile updated successfully!');
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err.message || 'Failed to update profile.');
      },
    });
  }
}
