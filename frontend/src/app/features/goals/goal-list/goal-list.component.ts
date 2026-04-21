/**
 * Goal list page with timeline tabs, status filter, pagination, and goal cards.
 * Supports completing goals inline and shows earned points via toast notifications.
 */

import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Goal, GoalStatus, TimelineType, GoalFilter } from '../../../core/models/goal.model';
import { GoalCompletionResult } from '../../../core/models/points.model';
import { PagedResponse } from '../../../core/models/api-response.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

/**
 * Displays a filterable, paginated list of the user's goals.
 * Goals can be filtered by timeline type and status, completed inline,
 * and navigated to for detail/edit views.
 */
@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSpinnerComponent, EmptyStateComponent, PaginationComponent],
  template: `
    <div class="container mx-auto max-w-7xl p-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 class="text-3xl font-bold">My Goals</h1>
        <button class="btn btn-primary mt-4 sm:mt-0" routerLink="/goals/new">+ New Goal</button>
      </div>

      <!-- Timeline Tabs -->
      <div class="tabs tabs-boxed mb-4">
        <button class="tab" [class.tab-active]="activeTab() === 0" (click)="setTab(0)">All</button>
        <button class="tab" [class.tab-active]="activeTab() === TimelineType.Weekly" (click)="setTab(TimelineType.Weekly)">Weekly</button>
        <button class="tab" [class.tab-active]="activeTab() === TimelineType.Monthly" (click)="setTab(TimelineType.Monthly)">Monthly</button>
        <button class="tab" [class.tab-active]="activeTab() === TimelineType.Yearly" (click)="setTab(TimelineType.Yearly)">Yearly</button>
      </div>

      <!-- Status Filter -->
      <div class="flex items-center gap-2 mb-6">
        <span class="text-sm font-medium">Status:</span>
        <select class="select select-bordered select-sm" [value]="statusFilter()" (change)="setStatusFilter($event)">
          <option value="0">All</option>
          <option [value]="GoalStatus.Active">Active</option>
          <option [value]="GoalStatus.Completed">Completed</option>
          <option [value]="GoalStatus.Overdue">Overdue</option>
        </select>
      </div>

      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (goals().length === 0) {
        <app-empty-state
          title="No goals found"
          [message]="emptyMessage()"
          actionLabel="Create a Goal"
          (actionClick)="navigateToNewGoal()"
        >
          <span icon class="text-4xl">🎯</span>
        </app-empty-state>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (goal of goals(); track goal.id) {
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-4">
                <a [routerLink]="['/goals', goal.id]" class="card-title text-base link link-hover">{{ goal.title }}</a>

                @if (goal.description) {
                  <p class="text-sm text-base-content/60 line-clamp-2">{{ goal.description }}</p>
                }

                <div class="flex flex-wrap gap-2 mt-2">
                  <span class="badge" [class]="getTimelineBadgeClass(goal.timelineType)">
                    {{ getTimelineLabel(goal.timelineType) }}
                  </span>
                  <span class="badge" [class]="getStatusBadgeClass(goal.status)">
                    {{ getStatusLabel(goal.status) }}
                  </span>
                  @if (goal.category) {
                    <span class="badge badge-outline" [style.border-color]="goal.category.colorHex" [style.color]="goal.category.colorHex">
                      {{ goal.category.name }}
                    </span>
                  }
                </div>

                <div class="flex items-center justify-between mt-3">
                  <span class="text-xs text-base-content/50">Target: {{ goal.targetDate | date:'mediumDate' }}</span>
                  @if (goal.status === GoalStatus.Active) {
                    <button
                      class="btn btn-success btn-xs"
                      [disabled]="completingId() === goal.id"
                      (click)="completeGoal(goal); $event.stopPropagation()"
                    >
                      @if (completingId() === goal.id) {
                        <span class="loading loading-spinner loading-xs"></span>
                      } @else {
                        Complete
                      }
                    </button>
                  }
                  @if (goal.status === GoalStatus.Completed && goal.pointsAwarded) {
                    <span class="badge badge-success badge-sm">+{{ goal.pointsAwarded }} pts</span>
                  }
                </div>
              </div>
            </div>
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
})
export class GoalListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  readonly TimelineType = TimelineType;
  readonly GoalStatus = GoalStatus;
  readonly pageSize = 12;

  readonly loading = signal(true);
  readonly goals = signal<Goal[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly activeTab = signal(0);
  readonly statusFilter = signal(0);
  readonly completingId = signal<number | null>(null);

  /** Computed empty state message based on active filters. */
  readonly emptyMessage = computed(() => {
    if (this.activeTab() || this.statusFilter()) {
      return 'No goals match the current filters. Try adjusting them or create a new goal.';
    }
    return 'You haven\'t created any goals yet. Start by creating your first one!';
  });

  ngOnInit(): void {
    this.loadGoals();
  }

  /** Sets the timeline tab filter and reloads. */
  setTab(tab: number): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.loadGoals();
  }

  /** Sets the status filter from the select dropdown and reloads. */
  setStatusFilter(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.loadGoals();
  }

  /** Handles page navigation from the pagination component. */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadGoals();
  }

  /** Completes a goal and shows a points toast notification. */
  completeGoal(goal: Goal): void {
    this.completingId.set(goal.id);
    this.api.post<GoalCompletionResult>(`/goals/${goal.id}/complete`, {}).subscribe({
      next: (result) => {
        this.completingId.set(null);
        this.notify.success(`Goal completed! +${result.pointsEarned.total} points earned!`);
        this.loadGoals();
      },
      error: (err) => {
        this.completingId.set(null);
        this.notify.error(err.message || 'Failed to complete goal.');
      },
    });
  }

  /** Navigates to the create goal page. */
  navigateToNewGoal(): void {
    this.router.navigateByUrl('/goals/new');
  }

  /** Loads goals from the API with current filter state. */
  private loadGoals(): void {
    this.loading.set(true);
    const params: Record<string, string | number | boolean> = {
      page: this.currentPage(),
      pageSize: this.pageSize,
    };
    if (this.activeTab()) {
      params['timelineType'] = this.activeTab();
    }
    if (this.statusFilter()) {
      params['status'] = this.statusFilter();
    }
    this.api.get<PagedResponse<Goal>>('/goals', params).subscribe({
      next: (res) => {
        this.goals.set(res.items);
        this.totalCount.set(res.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  /** Returns the DaisyUI badge class for a timeline type. */
  getTimelineBadgeClass(type: number): string {
    switch (type) {
      case TimelineType.Weekly: return 'badge-info';
      case TimelineType.Monthly: return 'badge-secondary';
      case TimelineType.Yearly: return 'badge-accent';
      default: return 'badge-ghost';
    }
  }

  /** Returns a human-readable label for a timeline type. */
  getTimelineLabel(type: number): string {
    switch (type) {
      case TimelineType.Weekly: return 'Weekly';
      case TimelineType.Monthly: return 'Monthly';
      case TimelineType.Yearly: return 'Yearly';
      default: return 'Unknown';
    }
  }

  /** Returns the DaisyUI badge class for a goal status. */
  getStatusBadgeClass(status: number): string {
    switch (status) {
      case GoalStatus.Active: return 'badge-success';
      case GoalStatus.Completed: return 'badge-info';
      case GoalStatus.Overdue: return 'badge-error';
      default: return 'badge-ghost';
    }
  }

  /** Returns a human-readable label for a goal status. */
  getStatusLabel(status: number): string {
    switch (status) {
      case GoalStatus.Active: return 'Active';
      case GoalStatus.Completed: return 'Completed';
      case GoalStatus.Overdue: return 'Overdue';
      default: return 'Unknown';
    }
  }
}
