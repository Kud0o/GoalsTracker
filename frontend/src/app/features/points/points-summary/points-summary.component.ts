/**
 * Points summary page displaying total points, achievement level progression,
 * streak stats, and weekly/monthly breakdowns with DaisyUI progress bars.
 */

import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
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
  imports: [RouterLink, DecimalPipe, LoadingSpinnerComponent, AchievementBadgeComponent],
  template: `
    <div class="container mx-auto max-w-4xl p-4 space-y-6">
      <h1 class="text-3xl font-bold">Points Summary</h1>

      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (summary()) {
        <!-- Total Points Hero -->
        <div class="hero-card relative overflow-hidden rounded-2xl p-8 text-white shadow-xl">
          <!-- Background gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90"></div>
          <!-- Decorative circles -->
          <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"></div>
          <div class="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10"></div>

          <div class="relative z-10 flex flex-col items-center text-center">
            <p class="text-sm uppercase tracking-widest opacity-80 mb-2">Total Points</p>
            <p class="text-7xl font-extrabold tracking-tight drop-shadow-lg mb-3">
              {{ summary()!.totalPoints | number }}
            </p>

            <div class="mb-6">
              <app-achievement-badge [levelName]="summary()!.achievementLevel.name" size="lg" />
            </div>

            <!-- Progress to Next Level -->
            @if (summary()!.achievementLevel.nextLevel) {
              <div class="w-full max-w-md">
                <div class="flex justify-between text-sm mb-2 opacity-90">
                  <span class="font-medium">{{ summary()!.achievementLevel.name }}</span>
                  <span class="font-medium">{{ summary()!.achievementLevel.nextLevel!.name }}</span>
                </div>
                <div class="progress-track relative h-4 w-full rounded-full bg-white/20 overflow-hidden">
                  <div
                    class="progress-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 shadow-inner"
                    [style.width.%]="levelProgress()"
                  ></div>
                  <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                    {{ levelProgress() }}%
                  </span>
                </div>
                <p class="text-center text-sm opacity-80 mt-2">
                  {{ summary()!.achievementLevel.nextLevel!.pointsNeeded }} points to {{ summary()!.achievementLevel.nextLevel!.name }}
                </p>
              </div>
            } @else {
              <div class="flex items-center gap-2 mt-2 opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.967.744L14.146 7.2 17.5 7.512a1 1 0 01.541 1.753l-2.454 2.029.715 3.293a1 1 0 01-1.49 1.084L12 13.766l-2.812 1.905a1 1 0 01-1.49-1.084l.715-3.293L5.96 9.265a1 1 0 01.54-1.753l3.356-.312L11.033 3.744A1 1 0 0112 3z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-medium">You've reached the highest level!</span>
              </div>
            }
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Current Streak -->
          <div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div class="card-body flex-row items-center gap-4 p-5">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-warning/15 flex items-center justify-center">
                <svg class="w-6 h-6 text-warning flame-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.07 2.25-5.65 3.5-7 .28-.3.75-.11.75.3 0 1.25.75 2.7 1.75 3.7.1.1.26.02.26-.12C9.26 9.4 11 6 13.5 4c.26-.21.64-.05.66.27.2 2.73 1.84 5.23 3.84 7.23 1 1 2 2.5 2 4.5 0 4.42-4.03 7-8 7z"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-medium text-base-content/50 uppercase tracking-wider">Current Streak</p>
                <p class="text-3xl font-bold text-warning">{{ summary()!.currentStreak }}</p>
                <p class="text-xs text-base-content/50">consecutive days</p>
              </div>
            </div>
          </div>

          <!-- Best Streak -->
          <div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div class="card-body flex-row items-center gap-4 p-5">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center">
                <svg class="w-6 h-6 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-medium text-base-content/50 uppercase tracking-wider">Best Streak</p>
                <p class="text-3xl font-bold text-secondary">{{ summary()!.bestStreak }}</p>
                <p class="text-xs text-base-content/50">personal record</p>
              </div>
            </div>
          </div>

          <!-- This Week -->
          <div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div class="card-body flex-row items-center gap-4 p-5">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-success/15 flex items-center justify-center">
                <svg class="w-6 h-6 text-success" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-medium text-base-content/50 uppercase tracking-wider">This Week</p>
                <p class="text-3xl font-bold text-success">{{ summary()!.thisWeek }}</p>
                <p class="text-xs text-base-content/50">points earned</p>
              </div>
            </div>
          </div>

          <!-- This Month -->
          <div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div class="card-body flex-row items-center gap-4 p-5">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-info/15 flex items-center justify-center">
                <svg class="w-6 h-6 text-info" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-medium text-base-content/50 uppercase tracking-wider">This Month</p>
                <p class="text-3xl font-bold text-info">{{ summary()!.thisMonth }}</p>
                <p class="text-xs text-base-content/50">points earned</p>
              </div>
            </div>
          </div>
        </div>

        <!-- View History Button -->
        <div class="text-center pt-2">
          <a routerLink="/points/history" class="btn btn-primary btn-lg gap-2 shadow-md hover:shadow-lg transition-shadow">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            View Points History
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .hero-card {
      min-height: 280px;
    }
    .progress-fill {
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .flame-icon {
      animation: flicker 1.5s ease-in-out infinite alternate;
    }
    @keyframes flicker {
      0% { transform: scale(1) rotate(-2deg); opacity: 0.85; }
      50% { transform: scale(1.1) rotate(1deg); opacity: 1; }
      100% { transform: scale(1) rotate(-1deg); opacity: 0.9; }
    }
    .number {
      font-variant-numeric: tabular-nums;
    }
  `],
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
