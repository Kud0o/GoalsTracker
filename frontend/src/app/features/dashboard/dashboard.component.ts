/**
 * Main user dashboard component.
 * Displays a welcome message, stat cards (active goals, weekly completions,
 * streak, total points), a quick-create button, and recent goals list.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Goal, GoalStatus, TimelineType } from '../../core/models/goal.model';
import { PointsSummary } from '../../core/models/points.model';
import { PagedResponse } from '../../core/models/api-response.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { AchievementBadgeComponent } from '../../shared/components/achievement-badge/achievement-badge.component';

/**
 * Dashboard showing an overview of the user's goals and points.
 * Loads recent goals and points summary data on initialization.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSpinnerComponent, EmptyStateComponent, AchievementBadgeComponent],
  template: `
    <div class="container mx-auto max-w-7xl p-4">
      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else {
        <!-- Welcome -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold">Welcome back, {{ userName() }}!</h1>
            <p class="text-base-content/60 mt-1">Here's how your goals are looking.</p>
          </div>
          <button class="btn btn-primary mt-4 sm:mt-0" routerLink="/goals/new">
            + Quick New Goal
          </button>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-title">Active Goals</div>
            <div class="stat-value text-primary">{{ activeGoalCount() }}</div>
            <div class="stat-desc">Currently in progress</div>
          </div>
          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-title">Completed This Week</div>
            <div class="stat-value text-success">{{ pointsSummary()?.thisWeek ?? 0 }}</div>
            <div class="stat-desc">Points earned this week</div>
          </div>
          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-title">Current Streak</div>
            <div class="stat-value text-warning">{{ pointsSummary()?.currentStreak ?? 0 }} 🔥</div>
            <div class="stat-desc">Consecutive completions</div>
          </div>
          <div class="stat bg-base-100 shadow rounded-box">
            <div class="stat-title">Total Points</div>
            <div class="stat-value">{{ pointsSummary()?.totalPoints ?? 0 }}</div>
            <div class="stat-desc">
              @if (pointsSummary()?.achievementLevel) {
                <app-achievement-badge [levelName]="pointsSummary()!.achievementLevel.name" size="sm" />
              }
            </div>
          </div>
        </div>

        <!-- Recent Goals -->
        <h2 class="text-xl font-semibold mb-4">Recent Goals</h2>

        @if (recentGoals().length === 0) {
          <app-empty-state
            title="No goals yet"
            message="Start your journey by creating your first goal!"
            actionLabel="Create Your First Goal"
            (actionClick)="navigateToNewGoal()"
          >
            <span icon class="text-4xl">🎯</span>
          </app-empty-state>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (goal of recentGoals(); track goal.id) {
              <a [routerLink]="['/goals', goal.id]" class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div class="card-body p-4">
                  <h3 class="card-title text-base">{{ goal.title }}</h3>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span class="badge" [class]="getTimelineBadgeClass(goal.timelineType)">
                      {{ getTimelineLabel(goal.timelineType) }}
                    </span>
                    <span class="badge" [class]="getStatusBadgeClass(goal.status)">
                      {{ getStatusLabel(goal.status) }}
                    </span>
                  </div>
                  <p class="text-sm text-base-content/60 mt-1">
                    Target: {{ goal.targetDate | date:'mediumDate' }}
                  </p>
                </div>
              </a>
            }
          </div>
          <div class="text-center mt-6">
            <a routerLink="/goals" class="btn btn-ghost btn-sm">View All Goals →</a>
          </div>
        }
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly recentGoals = signal<Goal[]>([]);
  readonly pointsSummary = signal<PointsSummary | null>(null);
  readonly userName = signal('');

  /** Number of active goals from the recent goals list. */
  readonly activeGoalCount = signal(0);

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.userName.set(user?.userName || 'User');

    forkJoin({
      goals: this.api.get<PagedResponse<Goal>>('/goals', { pageSize: 5, status: GoalStatus.Active }),
      points: this.api.get<PointsSummary>('/points/summary'),
    }).subscribe({
      next: ({ goals, points }) => {
        this.recentGoals.set(goals.items);
        this.activeGoalCount.set(goals.totalCount);
        this.pointsSummary.set(points);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  /** Navigates to the create goal page. */
  navigateToNewGoal(): void {
    this.router.navigateByUrl('/goals/new');
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
