/**
 * Admin view of a specific user's goals with source filtering.
 * Displays goal cards in read-only mode with tabs to filter by
 * admin-assigned or user-created source.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { Goal, GoalStatus, TimelineType } from '../../../core/models/goal.model';
import { AdminUser } from '../../../core/models/admin.model';

/**
 * Renders a read-only view of all goals belonging to a specific user,
 * with filter tabs for All / Admin Assigned / User Created sources.
 */
@Component({
  selector: 'app-admin-user-goals',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Back + Header -->
      <a routerLink="/admin/users" class="btn btn-ghost btn-sm gap-1 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Back to Users
      </a>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else {
        <!-- User Info Header -->
        <div class="card bg-gradient-to-br from-primary to-secondary text-primary-content mb-6 relative overflow-hidden">
          <div class="absolute inset-0 overflow-hidden opacity-10">
            <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full border-[20px] border-current"></div>
            <div class="absolute -bottom-5 -left-5 w-24 h-24 rounded-full border-[12px] border-current"></div>
          </div>
          <div class="card-body p-6 relative">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="avatar placeholder">
                  <div class="w-14 h-14 rounded-full bg-white/20 text-white font-bold text-xl flex items-center justify-center">
                    {{ userName().charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div>
                  <h1 class="text-2xl font-extrabold">{{ userName() }}'s Goals</h1>
                  <p class="text-white/60 text-sm">{{ allGoals().length }} goals total</p>
                </div>
              </div>
              <a [routerLink]="['/admin/assign']" [queryParams]="{ userId: userId() }" class="btn bg-white/20 text-white border-0 hover:bg-white/30 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                </svg>
                Assign New Goal
              </a>
            </div>
          </div>
        </div>

        <!-- Source Filter Tabs -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button class="btn btn-sm rounded-full"
            [class.btn-primary]="sourceFilter() === 'all'"
            [class.btn-ghost]="sourceFilter() !== 'all'"
            (click)="setSourceFilter('all')">
            All ({{ allGoals().length }})
          </button>
          <button class="btn btn-sm rounded-full gap-1"
            [class.btn-warning]="sourceFilter() === 'admin'"
            [class.btn-ghost]="sourceFilter() !== 'admin'"
            (click)="setSourceFilter('admin')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Admin Assigned ({{ getAdminGoalCount() }})
          </button>
          <button class="btn btn-sm rounded-full gap-1"
            [class.btn-info]="sourceFilter() === 'user'"
            [class.btn-ghost]="sourceFilter() !== 'user'"
            (click)="setSourceFilter('user')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            User Created ({{ getUserGoalCount() }})
          </button>
        </div>

        @if (filteredGoals().length === 0) {
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body items-center text-center py-16">
              <div class="text-6xl mb-4">🎯</div>
              <h3 class="text-lg font-semibold">No goals found</h3>
              <p class="text-base-content/50 text-sm">
                @if (sourceFilter() !== 'all') {
                  No goals match the current filter.
                } @else {
                  This user has no goals yet.
                }
              </p>
            </div>
          </div>
        } @else {
          <!-- Goal Cards Grid (read-only) -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (goal of filteredGoals(); track goal.id) {
              <div class="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300 border-t-4 overflow-hidden"
                [class.border-t-info]="goal.timelineType === TimelineType.Weekly"
                [class.border-t-secondary]="goal.timelineType === TimelineType.Monthly"
                [class.border-t-accent]="goal.timelineType === TimelineType.Yearly">
                @if (goal.imageUrl) {
                  <figure class="h-28 overflow-hidden">
                    <img [src]="goal.imageUrl" [alt]="goal.title" class="w-full h-full object-cover" />
                  </figure>
                }
                <div class="card-body p-5">
                  <!-- Title + Status -->
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="card-title text-base leading-tight flex-1 min-w-0">{{ goal.title }}</h3>
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

                  <!-- Badges -->
                  <div class="flex flex-wrap gap-1.5 mt-3">
                    <span class="badge badge-sm" [class]="getTimelineBadgeClass(goal.timelineType)">
                      {{ getTimelineLabel(goal.timelineType) }}
                    </span>
                    @if (goal.isAdminAssigned) {
                      <span class="badge badge-sm badge-warning gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                          <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        Assigned by Admin
                      </span>
                    } @else {
                      <span class="badge badge-sm badge-ghost gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                        </svg>
                        User Created
                      </span>
                    }
                  </div>

                  <!-- Footer -->
                  <div class="flex items-center justify-between mt-4 pt-3 border-t border-base-200">
                    <div class="flex items-center gap-1 text-xs text-base-content/50">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {{ goal.targetDate | date:'mediumDate' }}
                    </div>
                    @if (goal.status === GoalStatus.Completed && goal.pointsAwarded) {
                      <span class="badge badge-success badge-sm gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        +{{ goal.pointsAwarded }} pts
                      </span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class AdminUserGoalsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly GoalStatus = GoalStatus;
  readonly TimelineType = TimelineType;

  readonly loading = signal(true);
  readonly userId = signal('');
  readonly userName = signal('');
  readonly allGoals = signal<Goal[]>([]);
  readonly filteredGoals = signal<Goal[]>([]);
  readonly sourceFilter = signal<'all' | 'admin' | 'user'>('all');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('userId');
    if (!id) {
      this.router.navigate(['/admin/users']);
      return;
    }
    this.userId.set(id);
    this.loadUserGoals();
  }

  /** Sets the source filter and updates the filtered goals list. */
  setSourceFilter(filter: 'all' | 'admin' | 'user'): void {
    this.sourceFilter.set(filter);
    this.applyFilter();
  }

  /** Returns the count of admin-assigned goals. */
  getAdminGoalCount(): number {
    return this.allGoals().filter((g) => g.isAdminAssigned).length;
  }

  /** Returns the count of user-created goals. */
  getUserGoalCount(): number {
    return this.allGoals().filter((g) => !g.isAdminAssigned).length;
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

  /** Loads the user's goals from the admin API endpoint. */
  private loadUserGoals(): void {
    this.loading.set(true);
    this.api.get<{ userName: string; goals: Goal[] }>(`/admin/users/${this.userId()}/goals`).subscribe({
      next: (res) => {
        this.userName.set(res.userName || 'User');
        this.allGoals.set(res.goals || []);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => {
        // Fallback: try loading goals as array directly
        this.api.get<Goal[]>(`/admin/users/${this.userId()}/goals`).subscribe({
          next: (goals) => {
            this.userName.set('User');
            this.allGoals.set(goals);
            this.applyFilter();
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.router.navigate(['/admin/users']);
          },
        });
      },
    });
  }

  /** Applies the source filter to the goals list. */
  private applyFilter(): void {
    const filter = this.sourceFilter();
    let filtered = this.allGoals();
    if (filter === 'admin') {
      filtered = filtered.filter((g) => g.isAdminAssigned);
    } else if (filter === 'user') {
      filtered = filtered.filter((g) => !g.isAdminAssigned);
    }
    this.filteredGoals.set(filtered);
  }
}
