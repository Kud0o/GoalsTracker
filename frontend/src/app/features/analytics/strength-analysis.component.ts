/**
 * Strength analysis page displaying category completion insights.
 * Shows category breakdowns via animated horizontal bars, top strengths and improvement
 * areas as cards, and trend direction with a heatmap-style weekly visualization.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

/** Category breakdown as returned by the backend CategoryBreakdownDto. */
interface ApiCategoryBreakdown {
  categoryId: number;
  categoryName: string;
  totalGoals: number;
  completedGoals: number;
  overdueGoals: number;
  /** Decimal 0.0-1.0. */
  completionRate: number;
  isStrength: boolean;
}

/** Weekly rate as returned by the backend WeeklyRateDto. */
interface ApiWeeklyRate {
  weekStart: string;
  rate: number;
}

/** Trend as returned by the backend TrendDto. */
interface ApiTrend {
  direction: string;
  weeklyCompletionRates: ApiWeeklyRate[];
}

/** Full analytics response matching backend StrengthAnalysisDto. */
interface ApiStrengthAnalysis {
  hasEnoughData: boolean;
  categoryBreakdown: ApiCategoryBreakdown[] | null;
  topStrengths: string[] | null;
  improvementAreas: string[] | null;
  trend: ApiTrend | null;
  message: string | null;
  goalsCompleted: number;
  goalsNeeded: number;
}

/** Category info from /categories endpoint. */
interface CategoryLookup {
  id: number;
  name: string;
  colorHex: string;
  icon: string;
  sortOrder: number;
}

/** View-model for category breakdown with color resolved. */
interface CategoryBreakdownVM {
  categoryName: string;
  colorHex: string;
  completedGoals: number;
  totalGoals: number;
  /** Percentage 0-100. */
  completionPct: number;
}

/** View-model for weekly rate display. */
interface WeeklyRateVM {
  label: string;
  /** Percentage 0-100. */
  ratePct: number;
}

/** Processed view-model for the template. */
interface StrengthAnalysisVM {
  hasEnoughData: boolean;
  goalsNeeded: number;
  categories: CategoryBreakdownVM[];
  topStrengths: string[];
  improvementAreas: string[];
  trendDirection: 'improving' | 'stable' | 'declining';
  weeklyRates: WeeklyRateVM[];
}

/**
 * Renders goal completion analytics with animated category bars,
 * strength/improvement cards, and trend visualization.
 */
@Component({
  selector: 'app-strength-analysis',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto max-w-5xl p-4 space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <svg class="w-5 h-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold">Analytics</h1>
      </div>

      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (data() && !data()!.hasEnoughData) {
        <!-- Not Enough Data -->
        <div class="card bg-base-100 shadow-lg border border-base-200 max-w-lg mx-auto overflow-hidden">
          <div class="card-body items-center text-center py-12 px-8">
            <!-- Progress illustration -->
            <div class="relative mb-6">
              <div class="w-24 h-24 rounded-full border-4 border-base-300 flex items-center justify-center">
                <svg class="w-12 h-12 text-primary unlock-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-md">
                {{ data()!.goalsNeeded }}
              </div>
            </div>
            <h2 class="text-2xl font-bold text-base-content mb-2">Unlock Your Insights</h2>
            <p class="text-base text-base-content/60 max-w-sm leading-relaxed">
              Complete <span class="font-bold text-primary text-lg">{{ data()!.goalsNeeded }}</span> more
              {{ data()!.goalsNeeded === 1 ? 'goal' : 'goals' }} to unlock personalized strength analysis and completion trends.
            </p>
            <div class="w-full max-w-xs mt-6">
              <div class="h-3 rounded-full bg-base-200 overflow-hidden">
                <div class="unlock-progress h-full rounded-full bg-gradient-to-r from-primary to-secondary"></div>
              </div>
              <p class="text-xs text-base-content/50 mt-2">Keep going, you're almost there!</p>
            </div>
          </div>
        </div>
      } @else if (data()) {
        <!-- Category Breakdown -->
        <div class="card bg-base-100 shadow-md border border-base-200">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-6">
              <svg class="w-5 h-5 text-base-content/70" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
              </svg>
              <h2 class="text-xl font-bold">Category Breakdown</h2>
            </div>
            <div class="space-y-5">
              @for (cat of data()!.categories; track cat.categoryName) {
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full flex-shrink-0" [style.background-color]="cat.colorHex"></span>
                      <span class="font-semibold text-sm">{{ cat.categoryName }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm">
                      <span class="text-base-content/50">{{ cat.completedGoals }}/{{ cat.totalGoals }}</span>
                      <span class="font-bold min-w-[3rem] text-right" [style.color]="cat.colorHex">{{ cat.completionPct }}%</span>
                    </div>
                  </div>
                  <div class="h-3 rounded-full bg-base-200 overflow-hidden">
                    <div
                      class="category-bar h-full rounded-full"
                      [style.width.%]="cat.completionPct"
                      [style.background]="'linear-gradient(90deg, ' + cat.colorHex + 'cc, ' + cat.colorHex + ')'"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Strengths and Improvements Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Top Strengths -->
          <div class="card bg-base-100 shadow-md border border-base-200">
            <div class="card-body">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-5 h-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <h2 class="text-xl font-bold">Top Strengths</h2>
              </div>
              @if (data()!.topStrengths.length === 0) {
                <p class="text-base-content/50 py-4 text-center">Complete more goals to reveal your strengths.</p>
              } @else {
                <div class="flex flex-wrap gap-2">
                  @for (s of data()!.topStrengths; track s) {
                    <span class="sparkle-badge inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-semibold border border-success/20">
                      <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      {{ s }}
                    </span>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Improvement Areas -->
          <div class="card bg-base-100 shadow-md border border-base-200">
            <div class="card-body">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-5 h-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"/>
                </svg>
                <h2 class="text-xl font-bold">Improvement Areas</h2>
              </div>
              @if (data()!.improvementAreas.length === 0) {
                <p class="text-base-content/50 py-4 text-center">Looking great! No major areas to improve.</p>
              } @else {
                <div class="flex flex-wrap gap-2">
                  @for (area of data()!.improvementAreas; track area) {
                    <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-warning/10 text-warning text-sm font-semibold border border-warning/20">
                      <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"/>
                      </svg>
                      {{ area }}
                    </span>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Trend Section -->
        <div class="card bg-base-100 shadow-md border border-base-200">
          <div class="card-body">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-base-content/70" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
                </svg>
                <h2 class="text-xl font-bold">Trend</h2>
              </div>

              <!-- Trend direction badge -->
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                [class]="getTrendBadgeContainerClass(data()!.trendDirection)">
                @if (data()!.trendDirection === 'improving') {
                  <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
                  </svg>
                } @else if (data()!.trendDirection === 'stable') {
                  <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                } @else {
                  <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd"/>
                  </svg>
                }
                {{ getTrendLabel(data()!.trendDirection) }}
              </div>
            </div>

            <!-- Weekly heatmap circles -->
            @if (data()!.weeklyRates.length > 0) {
              <div class="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                @for (week of data()!.weeklyRates; track week.label) {
                  <div class="flex flex-col items-center gap-2">
                    <div
                      class="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md transition-transform hover:scale-110"
                      [style.background]="getHeatmapColor(week.ratePct)"
                      [title]="week.label + ': ' + week.ratePct + '%'"
                    >
                      {{ week.ratePct }}%
                    </div>
                    <span class="text-xs text-base-content/50 font-medium">{{ week.label }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .category-bar {
      animation: barGrow 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      transform-origin: left;
    }
    @keyframes barGrow {
      from { width: 0 !important; }
    }
    .unlock-icon {
      animation: lockBounce 2s ease-in-out infinite;
    }
    @keyframes lockBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .unlock-progress {
      animation: progressGrow 1.5s ease-out forwards;
      width: 60%;
    }
    @keyframes progressGrow {
      from { width: 0; }
    }
    .sparkle-badge {
      animation: sparkle 2s ease-in-out infinite;
    }
    @keyframes sparkle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; transform: scale(1.02); }
    }
  `],
})
export class StrengthAnalysisComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly data = signal<StrengthAnalysisVM | null>(null);

  ngOnInit(): void {
    forkJoin({
      analysis: this.api.get<ApiStrengthAnalysis>('/analytics/strengths'),
      categories: this.api.get<CategoryLookup[]>('/categories'),
    }).subscribe({
      next: ({ analysis, categories }) => {
        const colorMap = new Map(categories.map(c => [c.name, c.colorHex]));

        const vm: StrengthAnalysisVM = {
          hasEnoughData: analysis.hasEnoughData,
          goalsNeeded: analysis.goalsNeeded,
          categories: (analysis.categoryBreakdown ?? []).map(cb => ({
            categoryName: cb.categoryName,
            colorHex: colorMap.get(cb.categoryName) ?? '#6366F1',
            completedGoals: cb.completedGoals,
            totalGoals: cb.totalGoals,
            completionPct: Math.round(cb.completionRate * 100),
          })),
          topStrengths: analysis.topStrengths ?? [],
          improvementAreas: analysis.improvementAreas ?? [],
          trendDirection: (analysis.trend?.direction as 'improving' | 'stable' | 'declining') ?? 'stable',
          weeklyRates: (analysis.trend?.weeklyCompletionRates ?? []).map((w, i) => ({
            label: 'W' + (i + 1),
            ratePct: Math.round(w.rate * 100),
          })),
        };

        this.data.set(vm);
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

  /** Returns container classes for the large trend badge. */
  getTrendBadgeContainerClass(direction: string): string {
    switch (direction) {
      case 'improving': return 'bg-success/15 text-success';
      case 'stable': return 'bg-warning/15 text-warning';
      case 'declining': return 'bg-error/15 text-error';
      default: return 'bg-base-200 text-base-content/60';
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

  /** Returns a heatmap-style background color based on the rate value. */
  getHeatmapColor(rate: number): string {
    if (rate >= 70) return 'linear-gradient(135deg, #22c55e, #16a34a)';
    if (rate >= 40) return 'linear-gradient(135deg, #eab308, #ca8a04)';
    return 'linear-gradient(135deg, #ef4444, #dc2626)';
  }
}
