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
        <!-- Hero Banner -->
        <div class="rounded-2xl bg-gradient-to-r from-primary to-accent p-8 mb-8 text-primary-content relative overflow-hidden">
          <div class="absolute inset-0 opacity-10">
            <svg class="w-full h-full" viewBox="0 0 800 200" fill="none">
              <circle cx="700" cy="50" r="120" fill="currentColor"/>
              <circle cx="650" cy="150" r="80" fill="currentColor"/>
              <circle cx="100" cy="180" r="60" fill="currentColor"/>
            </svg>
          </div>
          <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome back, {{ userName() }}!</h1>
              <p class="mt-1 text-sm font-medium opacity-75">Keep pushing forward, {{ fullName() }}!</p>
              <p class="mt-2 text-lg opacity-90">Here's how your goals are looking.</p>
              <p class="mt-3 text-sm italic opacity-75">"The secret of getting ahead is getting started." -- Mark Twain</p>
            </div>
            <button class="btn btn-lg bg-white/20 backdrop-blur-sm border-white/30 text-primary-content hover:bg-white/30 mt-6 sm:mt-0 gap-2" routerLink="/goals/new">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
              Quick New Goal
            </button>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <!-- Active Goals -->
          <a routerLink="/goals" class="card bg-base-100 shadow border-l-4 border-l-info hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <div class="card-body p-5 flex-row items-center gap-4">
              <div class="rounded-xl bg-info/10 p-3 group-hover:bg-info/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
              </div>
              <div>
                <p class="text-xs font-medium text-base-content/50 uppercase tracking-wide">Active Goals</p>
                <p class="text-3xl font-extrabold text-info">{{ activeGoalCount() }}</p>
                <p class="text-xs text-base-content/50">Currently in progress</p>
              </div>
            </div>
          </a>
          <!-- Completed This Week -->
          <a routerLink="/goals" class="card bg-base-100 shadow border-l-4 border-l-success hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <div class="card-body p-5 flex-row items-center gap-4">
              <div class="rounded-xl bg-success/10 p-3 group-hover:bg-success/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <p class="text-xs font-medium text-base-content/50 uppercase tracking-wide">Completed This Week</p>
                <p class="text-3xl font-extrabold text-success">{{ pointsSummary()?.thisWeek ?? 0 }}</p>
                <p class="text-xs text-base-content/50">Points earned this week</p>
              </div>
            </div>
          </a>
          <!-- Current Streak -->
          <div class="card bg-base-100 shadow border-l-4 border-l-warning hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <div class="card-body p-5 flex-row items-center gap-4">
              <div class="rounded-xl bg-warning/10 p-3 group-hover:bg-warning/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-warning" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-3.866 0-7-2.686-7-6 0-1.665.585-3.312 1.72-4.82.58-.77 1.281-1.5 2.04-2.18.25-.22.63-.1.71.22l.58 2.28c.05.19.24.32.44.3.19-.02.35-.16.38-.36l.54-3.6c.07-.44.54-.68.91-.45 1.96 1.23 3.64 3.12 4.34 5.42.17.55.3 1.1.3 1.69 0 3.314-3.134 6-7 6zm0-2c2.761 0 5-1.79 5-4 0-.35-.08-.71-.22-1.09-.48-1.58-1.59-3-3.03-4.18l-.28 1.87c-.13.87-.98 1.42-1.81 1.2-.62-.16-1.07-.7-1.19-1.34l-.2-.78c-.37.36-.72.76-1.03 1.18C8.42 15.06 8 16.21 8 17c0 2.21 2.239 4 4 4z"/></svg>
              </div>
              <div>
                <p class="text-xs font-medium text-base-content/50 uppercase tracking-wide">Current Streak</p>
                <p class="text-3xl font-extrabold text-warning">{{ pointsSummary()?.currentStreak ?? 0 }}</p>
                <p class="text-xs text-base-content/50">Consecutive completions</p>
              </div>
            </div>
          </div>
          <!-- Total Points -->
          <div class="card bg-base-100 shadow border-l-4 border-l-secondary hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <div class="card-body p-5 flex-row items-center gap-4">
              <div class="rounded-xl bg-secondary/10 p-3 group-hover:bg-secondary/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-secondary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <div>
                <p class="text-xs font-medium text-base-content/50 uppercase tracking-wide">Total Points</p>
                <p class="text-3xl font-extrabold text-secondary">{{ pointsSummary()?.totalPoints ?? 0 }}</p>
                <div class="text-xs text-base-content/50">
                  @if (pointsSummary()?.achievementLevel) {
                    <app-achievement-badge [levelName]="pointsSummary()!.achievementLevel.name" size="sm" />
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Level Progress -->
        @if (pointsSummary()?.achievementLevel?.nextLevel) {
          <div class="card bg-base-100 shadow mb-10">
            <div class="card-body p-6 flex flex-col sm:flex-row items-center gap-6">
              <div class="relative w-24 h-24 shrink-0">
                <svg class="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="8" class="text-base-200"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="8" class="text-primary"
                    [attr.stroke-dasharray]="2 * 3.14159 * 42"
                    [attr.stroke-dashoffset]="2 * 3.14159 * 42 * (1 - getLevelProgress())"
                    stroke-linecap="round"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-lg font-bold text-primary">{{ (getLevelProgress() * 100).toFixed(0) }}%</span>
                </div>
              </div>
              <div class="text-center sm:text-left">
                <h3 class="text-lg font-bold">Level Progress</h3>
                <p class="text-base-content/60">
                  <span class="font-semibold text-primary">{{ pointsSummary()!.achievementLevel.name }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mx-1 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  <span class="font-semibold text-accent">{{ pointsSummary()!.achievementLevel.nextLevel!.name }}</span>
                </p>
                <p class="text-sm text-base-content/50 mt-1">{{ pointsSummary()!.achievementLevel.nextLevel!.pointsNeeded }} points to next level</p>
              </div>
            </div>
          </div>
        }

        <!-- Quick Actions -->
        <div class="mb-10">
          <h2 class="text-xl font-bold mb-1 flex items-center gap-2">
            <span class="w-1 h-6 bg-primary rounded-full inline-block"></span>
            Quick Actions
          </h2>
          <p class="text-base-content/50 text-sm mb-4 ml-3">Jump right in</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <a routerLink="/goals/new" class="card bg-primary/5 border border-primary/20 hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer group">
              <div class="card-body p-5 items-center text-center">
                <div class="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                </div>
                <h3 class="font-bold text-primary">New Goal</h3>
                <p class="text-xs text-base-content/50">Set a new target to achieve</p>
              </div>
            </a>
            <a routerLink="/leaderboard" class="card bg-secondary/5 border border-secondary/20 hover:shadow-lg hover:border-secondary/40 transition-all duration-300 cursor-pointer group">
              <div class="card-body p-5 items-center text-center">
                <div class="rounded-full bg-secondary/10 p-4 group-hover:bg-secondary/20 transition-colors mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <h3 class="font-bold text-secondary">View Leaderboard</h3>
                <p class="text-xs text-base-content/50">See how you rank among peers</p>
              </div>
            </a>
            <a routerLink="/points" class="card bg-accent/5 border border-accent/20 hover:shadow-lg hover:border-accent/40 transition-all duration-300 cursor-pointer group">
              <div class="card-body p-5 items-center text-center">
                <div class="rounded-full bg-accent/10 p-4 group-hover:bg-accent/20 transition-colors mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <h3 class="font-bold text-accent">My Analytics</h3>
                <p class="text-xs text-base-content/50">Track your progress and stats</p>
              </div>
            </a>
          </div>
        </div>

        <!-- Recent Goals -->
        <div class="mb-6">
          <h2 class="text-xl font-bold mb-1 flex items-center gap-2">
            <span class="w-1 h-6 bg-accent rounded-full inline-block"></span>
            Recent Goals
          </h2>
          <p class="text-base-content/50 text-sm mb-4 ml-3">Your latest activity</p>
        </div>

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
          <!-- Timeline-style recent goals -->
          <div class="relative ml-4 border-l-2 border-base-300 pl-8 space-y-6 mb-8">
            @for (goal of recentGoals(); track goal.id) {
              <div class="relative">
                <!-- Timeline dot -->
                <div class="absolute -left-[41px] top-3 w-4 h-4 rounded-full border-2 border-base-100"
                  [class.bg-success]="goal.status === GoalStatus.Active"
                  [class.bg-info]="goal.status === GoalStatus.Completed"
                  [class.bg-error]="goal.status === GoalStatus.Overdue"
                ></div>
                <a [routerLink]="['/goals', goal.id]" class="card bg-base-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer block">
                  <div class="card-body p-4 flex-row items-center gap-4">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-base truncate">{{ goal.title }}</h3>
                      <div class="flex flex-wrap gap-2 mt-1.5">
                        <span class="badge badge-sm" [class]="getTimelineBadgeClass(goal.timelineType)">
                          {{ getTimelineLabel(goal.timelineType) }}
                        </span>
                        <span class="badge badge-sm" [class]="getStatusBadgeClass(goal.status)">
                          {{ getStatusLabel(goal.status) }}
                        </span>
                      </div>
                    </div>
                    <div class="text-right shrink-0">
                      <p class="text-xs text-base-content/50">Target</p>
                      <p class="text-sm font-medium">{{ goal.targetDate | date:'mediumDate' }}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </a>
              </div>
            }
          </div>
          <div class="text-center mt-6">
            <a routerLink="/goals" class="btn btn-outline btn-primary btn-sm gap-1">
              View All Goals
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </a>
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

  readonly GoalStatus = GoalStatus;
  readonly loading = signal(true);
  readonly recentGoals = signal<Goal[]>([]);
  readonly pointsSummary = signal<PointsSummary | null>(null);
  readonly userName = signal('');
  readonly fullName = signal('');

  /** Number of active goals from the recent goals list. */
  readonly activeGoalCount = signal(0);

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.userName.set(user?.firstName || user?.userName || 'User');
    this.fullName.set(user?.firstName || 'User');

    forkJoin({
      goals: this.api.get<PagedResponse<Goal>>('/goals', { pageSize: 5, status: GoalStatus.Active }),
      points: this.api.get<PointsSummary>('/points/summary'),
      profile: this.api.get<{ firstName: string; lastName: string }>('/user/profile'),
    }).subscribe({
      next: ({ goals, points, profile }) => {
        this.recentGoals.set(goals.items);
        this.activeGoalCount.set(goals.totalCount);
        this.pointsSummary.set(points);
        if (profile.firstName || profile.lastName) {
          const full = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
          this.fullName.set(full || 'User');
        }
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

  /** Returns the progress fraction (0-1) towards the next achievement level. */
  getLevelProgress(): number {
    const ps = this.pointsSummary();
    if (!ps?.achievementLevel?.nextLevel) return 1;
    const current = ps.totalPoints - ps.achievementLevel.minPoints;
    const total = ps.achievementLevel.nextLevel.minPoints - ps.achievementLevel.minPoints;
    if (total <= 0) return 1;
    return Math.min(Math.max(current / total, 0), 1);
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
