/**
 * Points history page showing a timeline-style list of point transactions.
 * Each transaction is displayed as a card on a vertical timeline with
 * colored badges for points and transaction types.
 */

import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { PointTransaction } from '../../../core/models/points.model';
import { PagedResponse } from '../../../core/models/api-response.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

/**
 * Displays the user's point transaction history in a timeline layout
 * with pagination and an empty state for new users.
 */
@Component({
  selector: 'app-points-history',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSpinnerComponent, EmptyStateComponent, PaginationComponent],
  template: `
    <div class="container mx-auto max-w-4xl p-4 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold">Points History</h1>
        </div>
        <a routerLink="/points" class="btn btn-ghost btn-sm gap-1">
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
          </svg>
          Back to Summary
        </a>
      </div>

      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (transactions().length === 0) {
        <app-empty-state
          title="No transactions yet"
          message="Complete goals to start earning points! Your transaction history will appear here."
          actionLabel="View Goals"
          (actionClick)="navigateToGoals()"
        >
          <span icon class="text-4xl">💰</span>
        </app-empty-state>
      } @else {
        <!-- Timeline -->
        <div class="timeline-container relative">
          <!-- Vertical line -->
          <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-base-300 -translate-x-1/2"></div>
          <div class="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-base-300"></div>

          @for (group of groupedTransactions(); track group.date; let groupIdx = $index) {
            <!-- Date Separator -->
            <div class="relative flex justify-center mb-6" [class.mt-8]="groupIdx > 0">
              <div class="relative z-10 inline-flex items-center gap-2 bg-base-200 text-base-content/70 text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                {{ group.date | date:'mediumDate' }}
              </div>
            </div>

            @for (tx of group.items; track tx.id; let i = $index) {
              <!-- Timeline Item -->
              <div class="timeline-item relative mb-4 md:mb-6">
                <!-- Mobile layout: always left-aligned -->
                <div class="md:hidden flex gap-4 pl-2">
                  <!-- Dot -->
                  <div class="relative z-10 flex-shrink-0 w-3 h-3 mt-5 rounded-full border-2 border-base-300 bg-base-100 ring-4 ring-base-100"></div>
                  <!-- Card -->
                  <div class="timeline-card flex-1 card bg-base-100 shadow-md border border-base-200 hover:shadow-lg transition-all duration-200">
                    <div class="card-body p-4">
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-base-content">{{ tx.description }}</p>
                          @if (tx.goalId) {
                            <a [routerLink]="['/goals', tx.goalId]" class="link link-primary text-sm mt-0.5 inline-block">{{ tx.goalTitle || 'View Goal' }}</a>
                          }
                          <div class="flex items-center gap-2 mt-2">
                            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              [class]="getTypePillClass(tx.transactionType)">
                              {{ getTransactionTypeLabel(tx.transactionType) }}
                            </span>
                            <span class="text-xs text-base-content/40">{{ tx.createdAt | date:'shortTime' }}</span>
                          </div>
                        </div>
                        <div class="points-badge inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-lg font-bold"
                          [class]="tx.points > 0 ? 'bg-success/15 text-success' : 'bg-error/15 text-error'">
                          {{ tx.points > 0 ? '+' : '' }}{{ tx.points }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Desktop layout: alternating left-right -->
                <div class="hidden md:grid md:grid-cols-2 md:gap-8 items-start">
                  @if (i % 2 === 0) {
                    <!-- Left card -->
                    <div class="timeline-card card bg-base-100 shadow-md border border-base-200 hover:shadow-lg transition-all duration-200">
                      <div class="card-body p-5">
                        <div class="flex items-start justify-between gap-3">
                          <div class="flex-1 min-w-0">
                            <p class="font-medium text-base-content">{{ tx.description }}</p>
                            @if (tx.goalId) {
                              <a [routerLink]="['/goals', tx.goalId]" class="link link-primary text-sm mt-0.5 inline-block">{{ tx.goalTitle || 'View Goal' }}</a>
                            }
                            <div class="flex items-center gap-2 mt-2">
                              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                [class]="getTypePillClass(tx.transactionType)">
                                {{ getTransactionTypeLabel(tx.transactionType) }}
                              </span>
                              <span class="text-xs text-base-content/40">{{ tx.createdAt | date:'shortTime' }}</span>
                            </div>
                          </div>
                          <div class="points-badge inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-lg font-bold"
                            [class]="tx.points > 0 ? 'bg-success/15 text-success' : 'bg-error/15 text-error'">
                            {{ tx.points > 0 ? '+' : '' }}{{ tx.points }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Right side empty with dot -->
                    <div class="relative">
                      <div class="absolute -left-[1.19rem] top-5 z-10 w-3 h-3 rounded-full border-2 border-primary bg-base-100 ring-4 ring-base-100"></div>
                    </div>
                  } @else {
                    <!-- Left side empty with dot -->
                    <div class="relative">
                      <div class="absolute -right-[1.19rem] top-5 z-10 w-3 h-3 rounded-full border-2 border-primary bg-base-100 ring-4 ring-base-100"></div>
                    </div>
                    <!-- Right card -->
                    <div class="timeline-card card bg-base-100 shadow-md border border-base-200 hover:shadow-lg transition-all duration-200">
                      <div class="card-body p-5">
                        <div class="flex items-start justify-between gap-3">
                          <div class="flex-1 min-w-0">
                            <p class="font-medium text-base-content">{{ tx.description }}</p>
                            @if (tx.goalId) {
                              <a [routerLink]="['/goals', tx.goalId]" class="link link-primary text-sm mt-0.5 inline-block">{{ tx.goalTitle || 'View Goal' }}</a>
                            }
                            <div class="flex items-center gap-2 mt-2">
                              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                [class]="getTypePillClass(tx.transactionType)">
                                {{ getTransactionTypeLabel(tx.transactionType) }}
                              </span>
                              <span class="text-xs text-base-content/40">{{ tx.createdAt | date:'shortTime' }}</span>
                            </div>
                          </div>
                          <div class="points-badge inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-lg font-bold"
                            [class]="tx.points > 0 ? 'bg-success/15 text-success' : 'bg-error/15 text-error'">
                            {{ tx.points > 0 ? '+' : '' }}{{ tx.points }}
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          }
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
  styles: [`
    .timeline-card {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .points-badge {
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class PointsHistoryComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly pageSize = 20;
  readonly loading = signal(true);
  readonly transactions = signal<PointTransaction[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);

  /** Group transactions by day for display with date separators. */
  readonly groupedTransactions = computed(() => {
    const txs = this.transactions();
    const groups: { date: string; items: PointTransaction[] }[] = [];
    let currentDate = '';
    for (const tx of txs) {
      const d = tx.createdAt.split('T')[0];
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: tx.createdAt, items: [tx] });
      } else {
        groups[groups.length - 1].items.push(tx);
      }
    }
    return groups;
  });

  ngOnInit(): void {
    this.loadTransactions();
  }

  /** Handles page navigation from the pagination component. */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTransactions();
  }

  /** Navigates to the goals list. */
  navigateToGoals(): void {
    window.location.href = '/goals';
  }

  /** Returns a label for the transaction type enum value. */
  getTransactionTypeLabel(type: number): string {
    switch (type) {
      case 1: return 'Earned';
      case 2: return 'Bonus';
      case 3: return 'Streak';
      case 4: return 'Penalty';
      default: return 'Other';
    }
  }

  /** Returns pill badge classes for each transaction type. */
  getTypePillClass(type: number): string {
    switch (type) {
      case 1: return 'bg-success/15 text-success';
      case 2: return 'bg-info/15 text-info';
      case 3: return 'bg-warning/15 text-warning';
      case 4: return 'bg-error/15 text-error';
      default: return 'bg-base-200 text-base-content/60';
    }
  }

  /** Loads transactions from the API for the current page. */
  private loadTransactions(): void {
    this.loading.set(true);
    this.api.get<PagedResponse<PointTransaction>>('/points/history', {
      page: this.currentPage(),
      pageSize: this.pageSize,
    }).subscribe({
      next: (res) => {
        this.transactions.set(res.items);
        this.totalCount.set(res.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
