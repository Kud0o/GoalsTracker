/**
 * Goal detail page showing full goal information with actions.
 * Displays goal metadata, tags, status, and provides complete/edit/delete actions.
 * Includes a DaisyUI modal for delete confirmation.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Goal, GoalStatus, TimelineType } from '../../../core/models/goal.model';
import { GoalCompletionResult } from '../../../core/models/points.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/**
 * Renders the full detail view of a single goal including
 * completion action, edit/delete controls, and point breakdown for completed goals.
 */
@Component({
  selector: 'app-goal-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto max-w-4xl p-4">
      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (goal()) {
        <!-- Back link -->
        <a routerLink="/goals" class="btn btn-ghost btn-sm gap-1 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to Goals
        </a>

        <!-- Overdue Banner -->
        @if (goal()!.status === GoalStatus.Overdue) {
          <div class="alert bg-error/10 border border-error/30 mb-6 relative overflow-hidden">
            <div class="absolute inset-0 bg-error/5 animate-pulse"></div>
            <div class="relative flex items-center gap-3">
              <div class="rounded-full bg-error/20 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <p class="font-bold text-error">This goal is overdue!</p>
                <p class="text-sm text-error/70">The target date has passed. Consider updating the timeline or completing it now.</p>
              </div>
            </div>
          </div>
        }

        <!-- Full-width Header Card -->
        <div class="rounded-2xl overflow-hidden mb-8 relative" [class]="getHeaderGradientClass()">
          <!-- Decorative circles -->
          <div class="absolute inset-0 overflow-hidden opacity-10">
            <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full border-[20px] border-current"></div>
            <div class="absolute -bottom-5 -left-5 w-24 h-24 rounded-full border-[12px] border-current"></div>
          </div>
          <div class="relative p-8 text-primary-content">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{{ goal()!.title }}</h1>
                @if (goal()!.description) {
                  <p class="mt-3 text-lg opacity-85 max-w-2xl">{{ goal()!.description }}</p>
                }
              </div>
              <span class="badge badge-lg text-sm font-bold px-4 py-3 shrink-0 border-0" [class]="getHeaderStatusClass()">
                {{ getStatusLabel(goal()!.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Goal Image -->
        @if (goal()!.imageUrl) {
          <div class="card bg-base-100 shadow-sm mb-6 overflow-hidden">
            <figure>
              <img [src]="goal()!.imageUrl" [alt]="goal()!.title" class="w-full max-h-80 object-cover" />
            </figure>
          </div>
        }

        <!-- Metadata Grid -->
        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body p-6">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <!-- Timeline Type -->
              <div class="flex items-start gap-3">
                <div class="rounded-lg bg-base-200 p-2.5 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <p class="text-[11px] font-medium uppercase tracking-wider text-base-content/40">Timeline</p>
                  <p class="font-semibold">
                    <span class="badge badge-sm" [class]="getTimelineBadgeClass(goal()!.timelineType)">{{ getTimelineLabel(goal()!.timelineType) }}</span>
                  </p>
                </div>
              </div>
              <!-- Category -->
              <div class="flex items-start gap-3">
                <div class="rounded-lg bg-base-200 p-2.5 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                </div>
                <div>
                  <p class="text-[11px] font-medium uppercase tracking-wider text-base-content/40">Category</p>
                  @if (goal()!.category) {
                    <p class="font-semibold flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full inline-block" [style.background-color]="goal()!.category!.colorHex"></span>
                      {{ goal()!.category!.name }}
                    </p>
                  } @else {
                    <p class="text-base-content/40 text-sm">None</p>
                  }
                </div>
              </div>
              <!-- Target Date -->
              <div class="flex items-start gap-3">
                <div class="rounded-lg bg-base-200 p-2.5 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <p class="text-[11px] font-medium uppercase tracking-wider text-base-content/40">Target Date</p>
                  <p class="font-semibold text-sm">{{ goal()!.targetDate | date:'longDate' }}</p>
                </div>
              </div>
              <!-- Created -->
              <div class="flex items-start gap-3">
                <div class="rounded-lg bg-base-200 p-2.5 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <p class="text-[11px] font-medium uppercase tracking-wider text-base-content/40">Created</p>
                  <p class="font-semibold text-sm">{{ goal()!.createdAt | date:'longDate' }}</p>
                </div>
              </div>
              <!-- Assigned By (shown when admin-assigned) -->
              @if (goal()!.isAdminAssigned) {
                <div class="flex items-start gap-3">
                  <div class="rounded-lg bg-warning/10 p-2.5 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-[11px] font-medium uppercase tracking-wider text-base-content/40">Assigned By</p>
                    <p class="font-semibold text-sm flex items-center gap-1.5">
                      <span class="badge badge-warning badge-sm">Admin</span>
                      {{ goal()!.assignedByAdminName || 'Administrator' }}
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Tags -->
        @if (goal()!.tags.length > 0) {
          <div class="card bg-base-100 shadow-sm mb-6">
            <div class="card-body p-6">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                Tags
              </h3>
              <div class="flex flex-wrap gap-2">
                @for (tag of goal()!.tags; track tag.id) {
                  <span class="badge badge-outline py-3 px-4 text-sm">{{ tag.name }}</span>
                }
              </div>
            </div>
          </div>
        }

        <!-- Completed Celebration -->
        @if (goal()!.status === GoalStatus.Completed) {
          <div class="card bg-gradient-to-br from-success/10 to-success/5 border border-success/20 mb-6 relative overflow-hidden">
            <!-- Confetti-like dots -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
              <div class="absolute top-3 left-[10%] w-2 h-2 rounded-full bg-success/30"></div>
              <div class="absolute top-6 left-[25%] w-1.5 h-1.5 rounded-full bg-warning/40"></div>
              <div class="absolute top-4 left-[45%] w-2.5 h-2.5 rounded-full bg-primary/20"></div>
              <div class="absolute top-8 left-[60%] w-1.5 h-1.5 rounded-full bg-accent/30"></div>
              <div class="absolute top-3 left-[75%] w-2 h-2 rounded-full bg-secondary/30"></div>
              <div class="absolute top-7 left-[90%] w-1.5 h-1.5 rounded-full bg-info/40"></div>
              <div class="absolute bottom-4 left-[15%] w-2 h-2 rounded-full bg-warning/20"></div>
              <div class="absolute bottom-6 left-[35%] w-1.5 h-1.5 rounded-full bg-success/30"></div>
              <div class="absolute bottom-3 left-[55%] w-2.5 h-2.5 rounded-full bg-primary/30"></div>
              <div class="absolute bottom-5 left-[80%] w-2 h-2 rounded-full bg-accent/20"></div>
            </div>
            <div class="card-body p-6 relative">
              <div class="flex items-center gap-3 mb-4">
                <div class="rounded-full bg-success/20 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-success" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                </div>
                <div>
                  <h3 class="text-xl font-extrabold text-success">Goal Completed!</h3>
                  <p class="text-sm text-base-content/60">Completed on {{ goal()!.completedAt | date:'longDate' }}</p>
                </div>
              </div>
              @if (goal()!.pointsAwarded) {
                <div class="bg-base-100 rounded-xl p-4 flex items-center justify-center gap-6">
                  <div class="text-center">
                    <p class="text-4xl font-extrabold text-success">+{{ goal()!.pointsAwarded }}</p>
                    <p class="text-xs text-base-content/50 font-medium uppercase tracking-wide mt-1">Points Earned</p>
                  </div>
                  <div class="h-12 w-px bg-base-300"></div>
                  <div class="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-warning mx-auto" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <p class="text-xs text-base-content/50 font-medium uppercase tracking-wide mt-1">Achievement</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Actions - Desktop: side panel style / Mobile: sticky bottom -->
        <div class="hidden sm:block">
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body p-5 flex-row flex-wrap gap-3 justify-end">
              @if (goal()!.status === GoalStatus.Active) {
                <button class="btn btn-success gap-2" [disabled]="completing()" (click)="completeGoal()">
                  @if (completing()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  }
                  Complete Goal
                </button>
                <a [routerLink]="['/goals', goal()!.id, 'edit']" class="btn btn-outline gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Edit
                </a>
                <button class="btn btn-error btn-outline gap-2" (click)="showDeleteModal.set(true)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  Delete
                </button>
              }
              @if (goal()!.status === GoalStatus.Overdue) {
                <a [routerLink]="['/goals', goal()!.id, 'edit']" class="btn btn-outline gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Edit
                </a>
                <button class="btn btn-error btn-outline gap-2" (click)="showDeleteModal.set(true)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  Delete
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Mobile Sticky Bottom Bar -->
        @if (goal()!.status === GoalStatus.Active || goal()!.status === GoalStatus.Overdue) {
          <div class="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-4 sm:hidden z-50 flex gap-3">
            @if (goal()!.status === GoalStatus.Active) {
              <button class="btn btn-success flex-1 gap-1" [disabled]="completing()" (click)="completeGoal()">
                @if (completing()) {
                  <span class="loading loading-spinner loading-sm"></span>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                }
                Complete
              </button>
            }
            <a [routerLink]="['/goals', goal()!.id, 'edit']" class="btn btn-outline flex-1">Edit</a>
            <button class="btn btn-error btn-outline" (click)="showDeleteModal.set(true)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
          <div class="h-20 sm:hidden"></div>
        }

        <!-- Delete Confirmation Modal -->
        @if (showDeleteModal()) {
          <div class="modal modal-open">
            <div class="modal-box border-t-4 border-t-error">
              <div class="flex items-center gap-3 mb-4">
                <div class="rounded-full bg-error/10 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <h3 class="font-bold text-lg text-error">Delete Goal</h3>
              </div>
              <p class="text-base-content/70">Are you sure you want to delete <span class="font-semibold">"{{ goal()!.title }}"</span>? This action cannot be undone.</p>
              <div class="modal-action">
                <button class="btn btn-ghost" (click)="showDeleteModal.set(false)">Cancel</button>
                <button class="btn btn-error gap-2" [disabled]="deleting()" (click)="deleteGoal()">
                  @if (deleting()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  }
                  Delete Forever
                </button>
              </div>
            </div>
            <div class="modal-backdrop" (click)="showDeleteModal.set(false)"></div>
          </div>
        }
      }
    </div>
  `,
})
export class GoalDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);

  readonly GoalStatus = GoalStatus;
  readonly TimelineType = TimelineType;

  readonly loading = signal(true);
  readonly goal = signal<Goal | null>(null);
  readonly completing = signal(false);
  readonly deleting = signal(false);
  readonly showDeleteModal = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/goals');
      return;
    }

    this.api.get<Goal>(`/goals/${id}`).subscribe({
      next: (goal) => {
        this.goal.set(goal);
        this.loading.set(false);
      },
      error: () => {
        this.notify.error('Failed to load goal.');
        this.router.navigateByUrl('/goals');
      },
    });
  }

  /** Completes the goal and shows points earned. */
  completeGoal(): void {
    const g = this.goal();
    if (!g) return;

    this.completing.set(true);
    this.api.post<GoalCompletionResult>(`/goals/${g.id}/complete`, {}).subscribe({
      next: (result) => {
        this.completing.set(false);
        this.goal.set(result.goal);
        this.notify.success(`Goal completed! +${result.pointsEarned.total} points earned!`);
      },
      error: (err) => {
        this.completing.set(false);
        this.notify.error(err.message || 'Failed to complete goal.');
      },
    });
  }

  /** Deletes the goal after confirmation and navigates back. */
  deleteGoal(): void {
    const g = this.goal();
    if (!g) return;

    this.deleting.set(true);
    this.api.delete(`/goals/${g.id}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.notify.success('Goal deleted.');
        this.router.navigateByUrl('/goals');
      },
      error: (err) => {
        this.deleting.set(false);
        this.notify.error(err.message || 'Failed to delete goal.');
      },
    });
  }

  /** Returns the gradient class for the header based on timeline type. */
  getHeaderGradientClass(): string {
    const g = this.goal();
    if (!g) return 'bg-primary';
    switch (g.timelineType) {
      case TimelineType.Weekly: return 'bg-gradient-to-br from-info to-info/70';
      case TimelineType.Monthly: return 'bg-gradient-to-br from-secondary to-secondary/70';
      case TimelineType.Yearly: return 'bg-gradient-to-br from-accent to-accent/70';
      default: return 'bg-gradient-to-br from-primary to-primary/70';
    }
  }

  /** Returns status-specific classes for the header badge. */
  getHeaderStatusClass(): string {
    const g = this.goal();
    if (!g) return '';
    switch (g.status) {
      case GoalStatus.Active: return 'bg-success text-success-content';
      case GoalStatus.Completed: return 'bg-info text-info-content';
      case GoalStatus.Overdue: return 'bg-error text-error-content';
      default: return '';
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
