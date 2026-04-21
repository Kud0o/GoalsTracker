/**
 * Points history page showing a paginated table of point transactions.
 * Each row displays date, description, associated goal link, points badge,
 * and transaction type label.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { PointTransaction } from '../../../core/models/points.model';
import { PagedResponse } from '../../../core/models/api-response.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

/**
 * Displays the user's point transaction history in a DaisyUI table
 * with pagination and an empty state for new users.
 */
@Component({
  selector: 'app-points-history',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSpinnerComponent, EmptyStateComponent, PaginationComponent],
  template: `
    <div class="container mx-auto max-w-5xl p-4">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Points History</h1>
        <a routerLink="/points" class="btn btn-ghost btn-sm">← Back to Summary</a>
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
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Goal</th>
                <th>Type</th>
                <th class="text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of transactions(); track tx.id) {
                <tr>
                  <td class="whitespace-nowrap">{{ tx.createdAt | date:'shortDate' }}</td>
                  <td>{{ tx.description }}</td>
                  <td>
                    @if (tx.goalId) {
                      <a [routerLink]="['/goals', tx.goalId]" class="link link-primary">{{ tx.goalTitle || 'View Goal' }}</a>
                    } @else {
                      <span class="text-base-content/40">-</span>
                    }
                  </td>
                  <td>
                    <span class="badge badge-sm badge-ghost">{{ getTransactionTypeLabel(tx.transactionType) }}</span>
                  </td>
                  <td class="text-right">
                    <span class="badge badge-sm" [class.badge-success]="tx.points > 0" [class.badge-error]="tx.points < 0">
                      {{ tx.points > 0 ? '+' : '' }}{{ tx.points }}
                    </span>
                  </td>
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
export class PointsHistoryComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly pageSize = 20;
  readonly loading = signal(true);
  readonly transactions = signal<PointTransaction[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);

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
    // Use injected Router would be cleaner, but inline for simplicity
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
