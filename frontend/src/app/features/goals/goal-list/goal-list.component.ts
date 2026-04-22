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
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">My Goals</h1>
          <p class="text-base-content/50 text-sm mt-1">Track, manage, and complete your goals</p>
        </div>
        <button class="btn btn-primary mt-4 sm:mt-0 gap-2" routerLink="/goals/new">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          New Goal
        </button>
      </div>

      <!-- Timeline Pill Tabs -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button class="btn btn-sm rounded-full"
          [class.btn-primary]="activeTab() === 0"
          [class.btn-ghost]="activeTab() !== 0"
          (click)="setTab(0)">
          All
        </button>
        <button class="btn btn-sm rounded-full gap-1"
          [class.btn-info]="activeTab() === TimelineType.Weekly"
          [class.btn-ghost]="activeTab() !== TimelineType.Weekly"
          (click)="setTab(TimelineType.Weekly)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Weekly
        </button>
        <button class="btn btn-sm rounded-full gap-1"
          [class.btn-secondary]="activeTab() === TimelineType.Monthly"
          [class.btn-ghost]="activeTab() !== TimelineType.Monthly"
          (click)="setTab(TimelineType.Monthly)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          Monthly
        </button>
        <button class="btn btn-sm rounded-full gap-1"
          [class.btn-accent]="activeTab() === TimelineType.Yearly"
          [class.btn-ghost]="activeTab() !== TimelineType.Yearly"
          (click)="setTab(TimelineType.Yearly)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          Yearly
        </button>
      </div>

      <!-- Status Filter Badges -->
      <div class="flex flex-wrap items-center gap-2 mb-6">
        <span class="text-xs font-semibold uppercase tracking-wide text-base-content/50 mr-1">Status:</span>
        <button class="badge cursor-pointer transition-all duration-200"
          [class.badge-neutral]="statusFilter() === 0"
          [class.badge-ghost]="statusFilter() !== 0"
          [class.badge-lg]="statusFilter() === 0"
          (click)="setStatusFilterValue(0)">All</button>
        <button class="badge cursor-pointer transition-all duration-200"
          [class.badge-success]="statusFilter() === GoalStatus.Active"
          [class.badge-ghost]="statusFilter() !== GoalStatus.Active"
          [class.badge-lg]="statusFilter() === GoalStatus.Active"
          (click)="setStatusFilterValue(GoalStatus.Active)">Active</button>
        <button class="badge cursor-pointer transition-all duration-200"
          [class.badge-info]="statusFilter() === GoalStatus.Completed"
          [class.badge-ghost]="statusFilter() !== GoalStatus.Completed"
          [class.badge-lg]="statusFilter() === GoalStatus.Completed"
          (click)="setStatusFilterValue(GoalStatus.Completed)">Completed</button>
        <button class="badge cursor-pointer transition-all duration-200"
          [class.badge-error]="statusFilter() === GoalStatus.Overdue"
          [class.badge-ghost]="statusFilter() !== GoalStatus.Overdue"
          [class.badge-lg]="statusFilter() === GoalStatus.Overdue"
          (click)="setStatusFilterValue(GoalStatus.Overdue)">Overdue</button>
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
        <!-- Summary Bar -->
        <div class="bg-base-200/50 rounded-xl px-4 py-2.5 mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60">
          <span>Showing <span class="font-semibold text-base-content">{{ goals().length }}</span> of <span class="font-semibold text-base-content">{{ totalCount() }}</span> goals</span>
          <span class="hidden sm:inline text-base-content/20">|</span>
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-success inline-block"></span>
            {{ getStatusCount(GoalStatus.Active) }} active
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-info inline-block"></span>
            {{ getStatusCount(GoalStatus.Completed) }} completed
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-error inline-block"></span>
            {{ getStatusCount(GoalStatus.Overdue) }} overdue
          </span>
        </div>

        <!-- Goal Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (goal of goals(); track goal.id) {
            <div class="card bg-base-100 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-t-4 overflow-hidden"
              [class.border-t-info]="goal.timelineType === TimelineType.Weekly"
              [class.border-t-secondary]="goal.timelineType === TimelineType.Monthly"
              [class.border-t-accent]="goal.timelineType === TimelineType.Yearly">
              @if (goal.imageUrl) {
                <figure class="h-32 overflow-hidden">
                  <img [src]="goal.imageUrl" [alt]="goal.title" class="w-full h-full object-cover" />
                </figure>
              }
              <div class="card-body p-5">
                <!-- Title + Category -->
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <a [routerLink]="['/goals', goal.id]" class="card-title text-base link link-hover leading-tight">{{ goal.title }}</a>
                    @if (goal.isAdminAssigned) {
                      <span class="badge badge-sm badge-warning gap-1 ml-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                          <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        Assigned
                      </span>
                    }
                  </div>
                  <span class="badge badge-sm shrink-0" [class]="getStatusBadgeClass(goal.status)">
                    {{ getStatusLabel(goal.status) }}
                  </span>
                </div>

                @if (goal.category) {
                  <div class="flex items-center gap-1.5 mt-1">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" [style.background-color]="goal.category.colorHex"></span>
                    <span class="text-xs text-base-content/60">{{ goal.category.name }}</span>
                  </div>
                }

                @if (goal.description) {
                  <p class="text-sm text-base-content/50 line-clamp-2 mt-1">{{ goal.description }}</p>
                }

                <div class="flex flex-wrap gap-1.5 mt-3">
                  <span class="badge badge-sm" [class]="getTimelineBadgeClass(goal.timelineType)">
                    {{ getTimelineLabel(goal.timelineType) }}
                  </span>
                </div>

                <div class="flex items-center justify-between mt-4 pt-3 border-t border-base-200">
                  <div class="flex items-center gap-1 text-xs text-base-content/50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {{ goal.targetDate | date:'mediumDate' }}
                  </div>
                  @if (goal.status === GoalStatus.Active) {
                    <button
                      class="btn btn-success btn-sm gap-1"
                      [disabled]="completingId() === goal.id"
                      (click)="completeGoal(goal); $event.stopPropagation()"
                    >
                      @if (completingId() === goal.id) {
                        <span class="loading loading-spinner loading-xs"></span>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        Complete
                      }
                    </button>
                  }
                  @if (goal.status === GoalStatus.Completed && goal.pointsAwarded) {
                    <span class="badge badge-success badge-sm gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      +{{ goal.pointsAwarded }} pts
                    </span>
                  }
                </div>
              </div>
              <!-- Progress bar at bottom -->
              @if (goal.status === GoalStatus.Active) {
                <div class="h-1 bg-base-200 w-full">
                  <div class="h-full bg-primary/60 transition-all duration-500" [style.width.%]="getDaysRemainingPercent(goal)"></div>
                </div>
              }
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

  /** Sets the status filter directly from badge buttons. */
  setStatusFilterValue(value: number): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.loadGoals();
  }

  /** Returns count of goals matching a given status in the current page. */
  getStatusCount(status: number): number {
    return this.goals().filter(g => g.status === status).length;
  }

  /** Returns a percentage (0-100) of time remaining for an active goal. */
  getDaysRemainingPercent(goal: Goal): number {
    const now = new Date().getTime();
    const target = new Date(goal.targetDate).getTime();
    const created = new Date(goal.createdAt).getTime();
    const total = target - created;
    if (total <= 0) return 100;
    const elapsed = now - created;
    const percent = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    return percent;
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
