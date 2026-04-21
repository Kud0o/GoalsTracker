/**
 * Leaderboard page displaying a ranked table of users by points.
 * Supports period filtering (all time, this month, this week), highlights
 * the current user's row, and applies special styling to top 3 ranks.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PagedResponse } from '../../core/models/api-response.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { AchievementBadgeComponent } from '../../shared/components/achievement-badge/achievement-badge.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

/** Represents a single entry in the leaderboard. */
interface LeaderboardEntry {
  /** Rank position in the leaderboard. */
  rank: number;
  /** User identifier. */
  userId: string;
  /** Display name. */
  userName: string;
  /** Total points for the period. */
  totalPoints: number;
  /** Number of goals completed. */
  goalsCompleted: number;
  /** Current streak count. */
  currentStreak: number;
  /** Achievement level name. */
  achievementLevel: string;
}

/** Response shape for the leaderboard endpoint. */
interface LeaderboardResponse {
  /** Paged list of leaderboard entries. */
  items: LeaderboardEntry[];
  /** Total number of ranked users. */
  totalCount: number;
  /** Current page. */
  page: number;
  /** Page size. */
  pageSize: number;
  /** Current user's rank, if authenticated. */
  currentUserRank?: number;
}

/**
 * Publicly accessible leaderboard with period filter tabs,
 * special rank styling, and current-user highlighting.
 */
@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [LoadingSpinnerComponent, EmptyStateComponent, AchievementBadgeComponent, PaginationComponent],
  template: `
    <div class="container mx-auto max-w-5xl p-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 class="text-3xl font-bold">Leaderboard</h1>
        @if (currentUserRank()) {
          <span class="badge badge-primary badge-lg mt-2 sm:mt-0">Your Rank: #{{ currentUserRank() }}</span>
        }
      </div>

      <!-- Period Filter Tabs -->
      <div class="tabs tabs-boxed mb-6">
        <button class="tab" [class.tab-active]="period() === 'all'" (click)="setPeriod('all')">All Time</button>
        <button class="tab" [class.tab-active]="period() === 'month'" (click)="setPeriod('month')">This Month</button>
        <button class="tab" [class.tab-active]="period() === 'week'" (click)="setPeriod('week')">This Week</button>
      </div>

      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (entries().length === 0) {
        <app-empty-state
          title="No rankings yet"
          message="Be the first to complete goals and claim the top spot!"
        >
          <span icon class="text-4xl">🏆</span>
        </app-empty-state>
      } @else {
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="w-16">#</th>
                <th>User</th>
                <th class="text-right">Points</th>
                <th class="text-right hidden sm:table-cell">Goals</th>
                <th class="text-right hidden sm:table-cell">Streak</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of entries(); track entry.userId) {
                <tr
                  [class]="getRowClass(entry)"
                >
                  <td>
                    @if (entry.rank === 1) {
                      <span class="text-xl" title="1st Place">🥇</span>
                    } @else if (entry.rank === 2) {
                      <span class="text-xl" title="2nd Place">🥈</span>
                    } @else if (entry.rank === 3) {
                      <span class="text-xl" title="3rd Place">🥉</span>
                    } @else {
                      {{ entry.rank }}
                    }
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span>{{ entry.userName }}</span>
                      <app-achievement-badge [levelName]="entry.achievementLevel" size="sm" />
                    </div>
                  </td>
                  <td class="text-right">{{ entry.totalPoints }}</td>
                  <td class="text-right hidden sm:table-cell">{{ entry.goalsCompleted }}</td>
                  <td class="text-right hidden sm:table-cell">{{ entry.currentStreak }} 🔥</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-pagination
          [currentPage]="currentPage()"
          [totalCount]="totalCount()"
          [pageSize]="pageSize"
          (pageChange)="onPageChange($event)"
        />
      }
    </div>
  `,
})
export class LeaderboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly pageSize = 20;
  readonly loading = signal(true);
  readonly entries = signal<LeaderboardEntry[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly period = signal<'all' | 'month' | 'week'>('all');
  readonly currentUserRank = signal<number | null>(null);
  readonly currentUserId = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.currentUserId.set(user?.userId ?? null);
    this.loadLeaderboard();
  }

  /** Sets the period filter and reloads. */
  setPeriod(p: 'all' | 'month' | 'week'): void {
    this.period.set(p);
    this.currentPage.set(1);
    this.loadLeaderboard();
  }

  /** Handles page change from pagination. */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadLeaderboard();
  }

  /** Returns CSS classes for a leaderboard row based on rank and current user. */
  getRowClass(entry: LeaderboardEntry): string {
    const classes: string[] = [];
    if (entry.userId === this.currentUserId()) {
      classes.push('bg-primary/10');
    }
    if (entry.rank <= 3) {
      classes.push('font-semibold');
    }
    return classes.join(' ');
  }

  /** Loads the leaderboard from the API. */
  private loadLeaderboard(): void {
    this.loading.set(true);
    this.api.get<LeaderboardResponse>('/leaderboard', {
      period: this.period(),
      page: this.currentPage(),
      pageSize: this.pageSize,
    }).subscribe({
      next: (res) => {
        this.entries.set(res.items);
        this.totalCount.set(res.totalCount);
        this.currentUserRank.set(res.currentUserRank ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
