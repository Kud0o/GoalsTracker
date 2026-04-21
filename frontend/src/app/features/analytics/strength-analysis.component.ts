/**
 * Strength analysis page displaying category completion insights.
 * Shows category breakdowns via progress bars, top strengths and improvement
 * areas as cards, and trend direction badges with radial progress indicators.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

/** Category completion breakdown from the analytics API. */
interface CategoryBreakdown {
  /** Category name. */
  categoryName: string;
  /** Hex color for display. */
  colorHex: string;
  /** Number of completed goals. */
  completed: number;
  /** Total goals in this category. */
  total: number;
  /** Completion rate as a percentage. */
  completionRate: number;
}

/** A strength or improvement area identified by the analysis. */
interface StrengthArea {
  /** Category name. */
  categoryName: string;
  /** Completion rate percentage. */
  completionRate: number;
  /** Suggestion text for improvement areas, or label for strengths. */
  suggestion: string;
}

/** Weekly trend data point. */
interface WeeklyRate {
  /** Week label (e.g., "Week 1"). */
  label: string;
  /** Completion rate for that week. */
  rate: number;
}

/** Full analytics response from the API. */
interface StrengthAnalysisData {
  /** Whether the user has completed enough goals for insights. */
  hasEnoughData: boolean;
  /** Minimum goals still needed if hasEnoughData is false. */
  goalsNeeded: number;
  /** Category completion breakdown. */
  categories: CategoryBreakdown[];
  /** Top strength categories. */
  topStrengths: StrengthArea[];
  /** Areas needing improvement. */
  improvementAreas: StrengthArea[];
  /** Overall trend direction. */
  trendDirection: 'improving' | 'stable' | 'declining';
  /** Weekly completion rates. */
  weeklyRates: WeeklyRate[];
}

/**
 * Renders goal completion analytics with category progress bars,
 * strength/improvement cards, and trend visualization.
 */
@Component({
  selector: 'app-strength-analysis',
  standalone: true,
  imports: [LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="container mx-auto max-w-5xl p-4">
      <h1 class="text-3xl font-bold mb-6">Analytics</h1>

      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (data() && !data()!.hasEnoughData) {
        <app-empty-state
          title="Not enough data yet"
          [message]="'Complete ' + data()!.goalsNeeded + ' more goals to unlock insights.'"
        >
          <span icon class="text-4xl">📊</span>
        </app-empty-state>
      } @else if (data()) {
        <!-- Category Breakdown -->
        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">Category Breakdown</h2>
            <div class="space-y-4">
              @for (cat of data()!.categories; track cat.categoryName) {
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="font-medium">{{ cat.categoryName }}</span>
                    <span class="text-base-content/60">{{ cat.completed }}/{{ cat.total }} completed ({{ cat.completionRate }}%)</span>
                  </div>
                  <progress
                    class="progress w-full"
                    [style.--progress-color]="cat.colorHex"
                    [value]="cat.completionRate"
                    max="100"
                  ></progress>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Strengths and Improvements Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Top Strengths -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title text-xl mb-4">Top Strengths</h2>
              @if (data()!.topStrengths.length === 0) {
                <p class="text-base-content/60">Complete more goals to see your strengths.</p>
              } @else {
                <div class="space-y-3">
                  @for (s of data()!.topStrengths; track s.categoryName) {
                    <div class="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <div>
                        <p class="font-medium">{{ s.categoryName }}</p>
                        <p class="text-sm text-base-content/60">{{ s.completionRate }}% completion rate</p>
                      </div>
                      <span class="badge badge-success">Strong!</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Improvement Areas -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title text-xl mb-4">Improvement Areas</h2>
              @if (data()!.improvementAreas.length === 0) {
                <p class="text-base-content/60">Looking good! No major areas to improve.</p>
              } @else {
                <div class="space-y-3">
                  @for (area of data()!.improvementAreas; track area.categoryName) {
                    <div class="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                      <div>
                        <p class="font-medium">{{ area.categoryName }}</p>
                        <p class="text-sm text-base-content/60">{{ area.completionRate }}% - {{ area.suggestion }}</p>
                      </div>
                      <span class="badge badge-warning">Needs Work</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Trend -->
        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body">
            <div class="flex items-center gap-3 mb-4">
              <h2 class="card-title text-xl">Trend</h2>
              <span class="badge" [class]="getTrendBadgeClass(data()!.trendDirection)">
                {{ getTrendLabel(data()!.trendDirection) }}
              </span>
            </div>

            @if (data()!.weeklyRates.length > 0) {
              <div class="flex items-end justify-center gap-4 flex-wrap">
                @for (week of data()!.weeklyRates; track week.label) {
                  <div class="flex flex-col items-center gap-2">
                    <div class="radial-progress text-primary" [style]="'--value:' + week.rate + '; --size:4rem;'" role="progressbar">
                      {{ week.rate }}%
                    </div>
                    <span class="text-xs text-base-content/60">{{ week.label }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class StrengthAnalysisComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly data = signal<StrengthAnalysisData | null>(null);

  ngOnInit(): void {
    this.api.get<StrengthAnalysisData>('/analytics/strengths').subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  /** Returns the DaisyUI badge class for a trend direction. */
  getTrendBadgeClass(direction: string): string {
    switch (direction) {
      case 'improving': return 'badge-success';
      case 'stable': return 'badge-warning';
      case 'declining': return 'badge-error';
      default: return 'badge-ghost';
    }
  }

  /** Returns a display label for a trend direction. */
  getTrendLabel(direction: string): string {
    switch (direction) {
      case 'improving': return 'Improving';
      case 'stable': return 'Stable';
      case 'declining': return 'Declining';
      default: return 'Unknown';
    }
  }
}
