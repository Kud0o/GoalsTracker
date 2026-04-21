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
    <div class="container mx-auto max-w-3xl p-4">
      @if (loading()) {
        <app-loading-spinner size="lg" />
      } @else if (goal()) {
        <!-- Back link -->
        <a routerLink="/goals" class="btn btn-ghost btn-sm mb-4">← Back to Goals</a>

        <!-- Overdue Banner -->
        @if (goal()!.status === GoalStatus.Overdue) {
          <div class="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>This goal is overdue! The target date has passed.</span>
          </div>
        }

        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 class="text-3xl font-bold">{{ goal()!.title }}</h1>
                @if (goal()!.description) {
                  <p class="text-base-content/70 mt-2">{{ goal()!.description }}</p>
                }
              </div>
              <span class="badge badge-lg" [class]="getStatusBadgeClass(goal()!.status)">
                {{ getStatusLabel(goal()!.status) }}
              </span>
            </div>

            <!-- Metadata -->
            <div class="flex flex-wrap gap-3 mt-4">
              <span class="badge" [class]="getTimelineBadgeClass(goal()!.timelineType)">
                {{ getTimelineLabel(goal()!.timelineType) }}
              </span>
              @if (goal()!.category) {
                <span class="badge badge-outline" [style.border-color]="goal()!.category!.colorHex" [style.color]="goal()!.category!.colorHex">
                  {{ goal()!.category!.icon }} {{ goal()!.category!.name }}
                </span>
              }
              @for (tag of goal()!.tags; track tag.id) {
                <span class="badge badge-ghost">{{ tag.name }}</span>
              }
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div>
                <span class="text-sm font-medium text-base-content/60">Target Date</span>
                <p class="text-lg">{{ goal()!.targetDate | date:'longDate' }}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-base-content/60">Created</span>
                <p class="text-lg">{{ goal()!.createdAt | date:'longDate' }}</p>
              </div>
            </div>

            <!-- Completed Info -->
            @if (goal()!.status === GoalStatus.Completed) {
              <div class="alert alert-success mt-6">
                <div>
                  <p class="font-semibold">Goal Completed!</p>
                  <p>Completed on {{ goal()!.completedAt | date:'longDate' }}</p>
                  @if (goal()!.pointsAwarded) {
                    <p class="mt-1">Points awarded: <span class="font-bold">+{{ goal()!.pointsAwarded }}</span></p>
                  }
                </div>
              </div>
            }

            <!-- Actions -->
            <div class="card-actions justify-end mt-6">
              @if (goal()!.status === GoalStatus.Active) {
                <button class="btn btn-success" [disabled]="completing()" (click)="completeGoal()">
                  @if (completing()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Complete Goal
                </button>
                <a [routerLink]="['/goals', goal()!.id, 'edit']" class="btn btn-outline">Edit</a>
                <button class="btn btn-error btn-outline" (click)="showDeleteModal.set(true)">Delete</button>
              }
              @if (goal()!.status === GoalStatus.Overdue) {
                <a [routerLink]="['/goals', goal()!.id, 'edit']" class="btn btn-outline">Edit</a>
                <button class="btn btn-error btn-outline" (click)="showDeleteModal.set(true)">Delete</button>
              }
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        @if (showDeleteModal()) {
          <div class="modal modal-open">
            <div class="modal-box">
              <h3 class="font-bold text-lg">Delete Goal</h3>
              <p class="py-4">Are you sure you want to delete "{{ goal()!.title }}"? This action cannot be undone.</p>
              <div class="modal-action">
                <button class="btn btn-ghost" (click)="showDeleteModal.set(false)">Cancel</button>
                <button class="btn btn-error" [disabled]="deleting()" (click)="deleteGoal()">
                  @if (deleting()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Delete
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
