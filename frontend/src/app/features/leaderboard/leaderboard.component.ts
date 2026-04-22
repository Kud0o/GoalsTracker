/**
 * Leaderboard page displaying a ranked table of users by points.
 * Supports period filtering (all time, this month, this week), highlights
 * the current user's row, and applies special styling to top 3 ranks.
 * Includes a podium section for the top 3 and a client-side username filter.
 */

import { Component, inject, signal, OnInit, computed } from '@angular/core';
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
  /** First name. */
  firstName: string;
  /** Last name. */
  lastName: string;
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
 * podium display for top 3, and current-user highlighting.
 */
@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [LoadingSpinnerComponent, EmptyStateComponent, AchievementBadgeComponent, PaginationComponent],
  template: `
    <div class="container mx-auto max-w-5xl p-4 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold">Leaderboard</h1>
        </div>
        @if (currentUserRank()) {
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <svg class="w-4 h-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-semibold text-primary">Your Rank: #{{ currentUserRank() }}</span>
          </div>
        }
      </div>

      <!-- Period Filter Pills -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          class="btn btn-sm gap-2 rounded-full"
          [class.btn-primary]="period() === 'all'"
          [class.btn-ghost]="period() !== 'all'"
          (click)="setPeriod('all')"
        >
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
          </svg>
          All Time
        </button>
        <button
          class="btn btn-sm gap-2 rounded-full"
          [class.btn-primary]="period() === 'month'"
          [class.btn-ghost]="period() !== 'month'"
          (click)="setPeriod('month')"
        >
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
          This Month
        </button>
        <button
          class="btn btn-sm gap-2 rounded-full"
          [class.btn-primary]="period() === 'week'"
          [class.btn-ghost]="period() !== 'week'"
          (click)="setPeriod('week')"
        >
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
          </svg>
          This Week
        </button>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- Search -->
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            class="input input-sm input-bordered pl-9 w-44 rounded-full"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (filteredEntries().length === 0 && entries().length === 0) {
        <app-empty-state
          title="No rankings yet"
          message="Be the first to complete goals and claim the top spot!"
        >
          <span icon class="text-4xl">🏆</span>
        </app-empty-state>
      } @else {
        <!-- Podium Section (top 3) -->
        @if (currentPage() === 1 && !searchQuery() && podiumEntries().length > 0) {
          <div class="flex items-end justify-center gap-3 sm:gap-4 mb-8 pt-4">
            <!-- 2nd Place -->
            @if (podiumEntries().length >= 2) {
              <div class="podium-card podium-silver flex flex-col items-center p-4 sm:p-5 rounded-2xl w-28 sm:w-36 shadow-lg border border-base-200">
                <div class="text-2xl mb-2">🥈</div>
                <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-inner mb-2">
                  {{ podiumEntries()[1].userName.charAt(0).toUpperCase() }}
                </div>
                <p class="font-semibold text-sm sm:text-base text-center truncate w-full" [title]="podiumEntries()[1].firstName + ' ' + podiumEntries()[1].lastName">{{ podiumEntries()[1].firstName }} {{ podiumEntries()[1].lastName }}</p>
                <p class="text-lg sm:text-xl font-bold text-base-content mt-1">{{ podiumEntries()[1].totalPoints }}</p>
                <div class="mt-1">
                  <app-achievement-badge [levelName]="podiumEntries()[1].achievementLevel" size="sm" />
                </div>
              </div>
            }

            <!-- 1st Place -->
            @if (podiumEntries().length >= 1) {
              <div class="podium-card podium-gold flex flex-col items-center p-4 sm:p-6 rounded-2xl w-32 sm:w-40 shadow-xl border border-yellow-300/30 -mt-4">
                <div class="text-3xl mb-2">🥇</div>
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-inner mb-2 ring-2 ring-yellow-300/50 ring-offset-2 ring-offset-base-100">
                  {{ podiumEntries()[0].userName.charAt(0).toUpperCase() }}
                </div>
                <p class="font-bold text-base sm:text-lg text-center truncate w-full" [title]="podiumEntries()[0].firstName + ' ' + podiumEntries()[0].lastName">{{ podiumEntries()[0].firstName }} {{ podiumEntries()[0].lastName }}</p>
                <p class="text-xl sm:text-2xl font-extrabold text-base-content mt-1">{{ podiumEntries()[0].totalPoints }}</p>
                <div class="mt-1">
                  <app-achievement-badge [levelName]="podiumEntries()[0].achievementLevel" size="sm" />
                </div>
              </div>
            }

            <!-- 3rd Place -->
            @if (podiumEntries().length >= 3) {
              <div class="podium-card podium-bronze flex flex-col items-center p-4 sm:p-5 rounded-2xl w-28 sm:w-36 shadow-lg border border-base-200">
                <div class="text-2xl mb-2">🥉</div>
                <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-inner mb-2">
                  {{ podiumEntries()[2].userName.charAt(0).toUpperCase() }}
                </div>
                <p class="font-semibold text-sm sm:text-base text-center truncate w-full" [title]="podiumEntries()[2].firstName + ' ' + podiumEntries()[2].lastName">{{ podiumEntries()[2].firstName }} {{ podiumEntries()[2].lastName }}</p>
                <p class="text-lg sm:text-xl font-bold text-base-content mt-1">{{ podiumEntries()[2].totalPoints }}</p>
                <div class="mt-1">
                  <app-achievement-badge [levelName]="podiumEntries()[2].achievementLevel" size="sm" />
                </div>
              </div>
            }
          </div>
        }

        <!-- Leaderboard Table -->
        @if (filteredEntries().length === 0) {
          <div class="text-center py-8 text-base-content/50">
            <p class="text-lg">No users match your search.</p>
          </div>
        } @else {
          <div class="card bg-base-100 shadow-md overflow-hidden border border-base-200">
            <div class="overflow-x-auto">
              <table class="table w-full">
                <thead>
                  <tr class="bg-base-200/50">
                    <th scope="col" class="w-16 text-center">#</th>
                    <th scope="col">User</th>
                    <th scope="col" class="text-right">Points</th>
                    <th scope="col" class="text-right hidden sm:table-cell">Goals</th>
                    <th scope="col" class="text-right hidden sm:table-cell">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  @for (entry of filteredEntries(); track entry.userId; let idx = $index) {
                    <tr
                      [class]="getRowClasses(entry, idx)"
                    >
                      <td class="text-center">
                        @if (entry.rank === 1) {
                          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400/15 text-lg" title="1st Place">🥇</span>
                        } @else if (entry.rank === 2) {
                          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-300/15 text-lg" title="2nd Place">🥈</span>
                        } @else if (entry.rank === 3) {
                          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600/15 text-lg" title="3rd Place">🥉</span>
                        } @else {
                          <span class="text-base-content/50 font-mono">{{ entry.rank }}</span>
                        }
                      </td>
                      <td>
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                            {{ entry.userName.charAt(0).toUpperCase() }}
                          </div>
                          <div class="min-w-0">
                            <div class="flex items-center gap-2">
                              <span class="truncate font-medium">{{ entry.firstName }} {{ entry.lastName }}</span>
                              @if (entry.userId === currentUserId()) {
                                <span class="text-xs text-primary font-medium">(you)</span>
                              }
                              <app-achievement-badge [levelName]="entry.achievementLevel" size="sm" />
                            </div>
                            <span class="text-xs text-base-content/50">&#64;{{ entry.userName }}</span>
                          </div>
                        </div>
                      </td>
                      <td class="text-right font-mono font-bold">{{ entry.totalPoints }}</td>
                      <td class="text-right hidden sm:table-cell text-base-content/70">{{ entry.goalsCompleted }}</td>
                      <td class="text-right hidden sm:table-cell">
                        <span class="inline-flex items-center gap-1 text-base-content/70">
                          {{ entry.currentStreak }}
                          @if (entry.currentStreak > 0) {
                            <svg class="w-4 h-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.07 2.25-5.65 3.5-7 .28-.3.75-.11.75.3 0 1.25.75 2.7 1.75 3.7.1.1.26.02.26-.12C9.26 9.4 11 6 13.5 4c.26-.21.64-.05.66.27.2 2.73 1.84 5.23 3.84 7.23 1 1 2 2.5 2 4.5 0 4.42-4.03 7-8 7z"/>
                            </svg>
                          }
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <app-pagination
            [currentPage]="currentPage()"
            [totalCount]="totalCount()"
            [pageSize]="pageSize"
            (pageChange)="onPageChange($event)"
          />
        }
      }
    </div>
  `,
  styles: [`
    .podium-gold {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.15));
    }
    .podium-silver {
      background: linear-gradient(135deg, rgba(209, 213, 219, 0.1), rgba(156, 163, 175, 0.15));
    }
    .podium-bronze {
      background: linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(180, 83, 9, 0.12));
    }
    .podium-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .podium-card:hover {
      transform: translateY(-4px);
    }
    :host ::ng-deep tr.current-user-row {
      background-color: oklch(var(--p) / 0.07);
      border-left: 4px solid oklch(var(--p));
      box-shadow: inset 0 0 12px oklch(var(--p) / 0.05);
    }
    :host ::ng-deep tr.current-user-row:hover {
      background-color: oklch(var(--p) / 0.12);
    }
    :host ::ng-deep tr.row-alt {
      background-color: oklch(var(--bc) / 0.02);
    }
    :host ::ng-deep tr:hover {
      background-color: oklch(var(--bc) / 0.05);
    }
  `],
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

  /** Search query for filtering usernames client-side. */
  readonly searchQuery = signal('');

  /** Top 3 entries for the podium display. Hidden when fewer than 3 users or all have 0 points. */
  readonly podiumEntries = computed(() => {
    const top3 = this.entries().filter(e => e.rank <= 3).sort((a, b) => a.rank - b.rank);
    const hasActivity = top3.some(e => e.totalPoints > 0);
    return (top3.length >= 3 && hasActivity) ? top3 : [];
  });

  /** Entries filtered by the search query. */
  readonly filteredEntries = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.entries();
    return this.entries().filter(e => e.userName.toLowerCase().includes(q));
  });

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

  /** Handles search input changes - updates the signal to trigger computed re-evaluation. */
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  /** Returns CSS classes for a leaderboard row based on rank, current user, and index. */
  getRowClasses(entry: LeaderboardEntry, idx: number): string {
    const classes: string[] = ['transition-colors', 'duration-150'];
    const isCurrentUser = entry.userId === this.currentUserId();
    if (isCurrentUser) {
      classes.push('current-user-row');
    }
    if (entry.rank <= 3) {
      classes.push('font-semibold');
    }
    if (idx % 2 === 1 && !isCurrentUser) {
      classes.push('row-alt');
    }
    return classes.join(' ');
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
