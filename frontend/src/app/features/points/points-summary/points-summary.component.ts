/**
 * Points summary page displaying total points, achievement level progression,
 * streak stats, and weekly/monthly breakdowns with DaisyUI progress bars.
 */

import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { PointsSummary } from '../../../core/models/points.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AchievementBadgeComponent } from '../../../shared/components/achievement-badge/achievement-badge.component';

/**
 * Shows the user's points overview including current level,
 * progress to the next level, streak information, and period breakdowns.
 */
@Component({
  selector: 'app-points-summary',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent, AchievementBadgeComponent],
  template: `
    <div class="container mx-auto max-w-4xl p-4">
      <h1 class="text-3xl font-bold mb-6">Points Summary</h1>

      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (summary()) {
        <!-- Total Points Hero -->
        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body items-center text-center">
            <p class="text-sm text-base-content/60 uppercase tracking-wider">Total Points</p>
            <p class="text-6xl font-bold text-primary">{{ summary()!.totalPoints }}</p>
            <app-achievement-badge [levelName]="summary()!.achievementLevel.name" size="lg" />

            <!-- Progress to Next Level -->
            @if (summary()!.achievementLevel.nextLevel) {
              <div class="w-full max-w-md mt-6">
                <div class="flex justify-between text-sm mb-1">
                  <span>{{ summary()!.achievementLevel.name }}</span>
                  <span>{{ summary()!.achievementLevel.nextLevel!.name }}</span>
                </div>
                <progress
                  class="progress progress-primary w-full"
                  [value]="levelProgress()"
                  max="100"
                ></progress>
                <p class="text-center text-sm text-base-content/60 mt-1">
                  {{ summary()!.totalPoints }} / {{ summary()!.achievementLevel.nextLevel!.minPoints }} points to {{ summary()!.achievementLevel.nextLevel!.name }}
                </p>
              </div>
            } @else {
              <p class="text-sm text-base-content/60 mt-2">You've reached the highest level!</p>
            }
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-title">Current Streak</div>
            <div class="stat-value text-warning">{{ summary()!.currentStreak }} 🔥</div>
            <div class="stat-desc">Consecutive completions</div>
          </div>
          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-title">Best Streak</div>
            <div class="stat-value">{{ summary()!.bestStreak }}</div>
            <div class="stat-desc">Personal record</div>
          </div>
          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-title">This Week</div>
            <div class="stat-value text-success">{{ summary()!.thisWeek }}</div>
            <div class="stat-desc">Points earned</div>
          </div>
          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-title">This Month</div>
            <div class="stat-value text-info">{{ summary()!.thisMonth }}</div>
            <div class="stat-desc">Points earned</div>
          </div>
        </div>

        <!-- Link to History -->
        <div class="text-center">
          <a routerLink="/points/history" class="btn btn-outline btn-primary">View Points History</a>
        </div>
      }
    </div>
  `,
})
export class PointsSummaryComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly summary = signal<PointsSummary | null>(null);

  /** Computed progress percentage toward the next achievement level. */
  readonly levelProgress = computed(() => {
    const s = this.summary();
    if (!s?.achievementLevel.nextLevel) return 100;
    const current = s.totalPoints - s.achievementLevel.minPoints;
    const needed = s.achievementLevel.nextLevel.minPoints - s.achievementLevel.minPoints;
    return needed > 0 ? Math.round((current / needed) * 100) : 100;
  });

  ngOnInit(): void {
    this.api.get<PointsSummary>('/points/summary').subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
