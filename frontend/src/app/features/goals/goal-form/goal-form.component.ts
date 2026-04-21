/**
 * Goal form component for creating and editing goals.
 * Detects create vs edit mode from the route, loads existing goal data for edits,
 * and supports category selection, tag input, and timeline type radio cards.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Goal, CategoryInfo, TimelineType } from '../../../core/models/goal.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/**
 * Shared create/edit form for goals with reactive validation,
 * dynamic category loading, and tag management via badge chips.
 */
@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto max-w-2xl p-4">
      @if (pageLoading()) {
        <app-loading-spinner size="lg" />
      } @else {
        <h1 class="text-3xl font-bold mb-6">{{ isEditMode() ? 'Edit Goal' : 'Create New Goal' }}</h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <!-- Title -->
            <div class="form-control mb-4">
              <label class="label" for="title">
                <span class="label-text">Title *</span>
              </label>
              <input id="title" type="text" formControlName="title" class="input input-bordered w-full" placeholder="What do you want to achieve?" />
              @if (form.controls.title.touched && form.controls.title.errors) {
                <label class="label">
                  <span class="label-text-alt text-error">
                    @if (form.controls.title.errors['required']) { Title is required }
                    @else if (form.controls.title.errors['maxlength']) { Title must be 200 characters or less }
                  </span>
                </label>
              }
            </div>

            <!-- Description -->
            <div class="form-control mb-4">
              <label class="label" for="description">
                <span class="label-text">Description</span>
              </label>
              <textarea id="description" formControlName="description" class="textarea textarea-bordered w-full h-24" placeholder="Add more details about your goal..."></textarea>
            </div>

            <!-- Timeline Type -->
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">Timeline Type *</span>
              </label>
              <div class="grid grid-cols-3 gap-3">
                @for (tl of timelineOptions; track tl.value) {
                  <label
                    class="card bg-base-200 cursor-pointer border-2 transition-colors"
                    [class.border-primary]="form.controls.timelineType.value === tl.value"
                    [class.border-transparent]="form.controls.timelineType.value !== tl.value"
                  >
                    <div class="card-body items-center p-3">
                      <span class="text-2xl">{{ tl.icon }}</span>
                      <span class="text-sm font-medium">{{ tl.label }}</span>
                      <input type="radio" formControlName="timelineType" [value]="tl.value" class="hidden" />
                    </div>
                  </label>
                }
              </div>
              @if (form.controls.timelineType.touched && form.controls.timelineType.errors) {
                <label class="label">
                  <span class="label-text-alt text-error">Please select a timeline type</span>
                </label>
              }
            </div>

            <!-- Target Date -->
            <div class="form-control mb-4">
              <label class="label" for="targetDate">
                <span class="label-text">Target Date *</span>
              </label>
              <input id="targetDate" type="date" formControlName="targetDate" class="input input-bordered w-full" />
              @if (form.controls.targetDate.touched && form.controls.targetDate.errors) {
                <label class="label">
                  <span class="label-text-alt text-error">
                    @if (form.controls.targetDate.errors['required']) { Target date is required }
                  </span>
                </label>
              }
            </div>

            <!-- Category -->
            <div class="form-control mb-4">
              <label class="label" for="categoryId">
                <span class="label-text">Category</span>
              </label>
              <select id="categoryId" formControlName="categoryId" class="select select-bordered w-full">
                <option [ngValue]="null" value="">No category</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
                }
              </select>
            </div>

            <!-- Tags -->
            <div class="form-control mb-6">
              <label class="label" for="tagInput">
                <span class="label-text">Tags</span>
              </label>
              <div class="flex flex-wrap gap-2 mb-2">
                @for (tag of tags(); track tag) {
                  <span class="badge badge-primary gap-1">
                    {{ tag }}
                    <button type="button" class="btn btn-ghost btn-xs p-0" (click)="removeTag(tag)">x</button>
                  </span>
                }
              </div>
              <input
                id="tagInput"
                type="text"
                class="input input-bordered w-full"
                placeholder="Type a tag and press Enter"
                (keydown.enter)="addTag($event)"
              />
            </div>

            <!-- Actions -->
            <div class="card-actions justify-end">
              <a routerLink="/goals" class="btn btn-ghost">Cancel</a>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                @if (saving()) {
                  <span class="loading loading-spinner loading-sm"></span>
                  Saving...
                } @else {
                  {{ isEditMode() ? 'Update Goal' : 'Create Goal' }}
                }
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
})
export class GoalFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);

  /** Timeline type radio card options. */
  readonly timelineOptions = [
    { value: TimelineType.Weekly, label: 'Weekly', icon: '📅' },
    { value: TimelineType.Monthly, label: 'Monthly', icon: '🗓️' },
    { value: TimelineType.Yearly, label: 'Yearly', icon: '🎆' },
  ];

  readonly isEditMode = signal(false);
  readonly pageLoading = signal(true);
  readonly saving = signal(false);
  readonly categories = signal<CategoryInfo[]>([]);
  readonly tags = signal<string[]>([]);

  /** The ID of the goal being edited, if in edit mode. */
  private goalId: number | null = null;

  /** Reactive form for goal data. */
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    timelineType: [TimelineType.Weekly as number, [Validators.required]],
    targetDate: ['', [Validators.required]],
    categoryId: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.goalId = Number(idParam);
    }

    // Load categories
    this.api.get<CategoryInfo[]>('/categories').subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => { /* categories are optional */ },
    });

    if (this.isEditMode() && this.goalId) {
      this.api.get<Goal>(`/goals/${this.goalId}`).subscribe({
        next: (goal) => {
          this.form.patchValue({
            title: goal.title,
            description: goal.description || '',
            timelineType: goal.timelineType,
            targetDate: goal.targetDate.substring(0, 10),
            categoryId: goal.category ? String(goal.category.id) : '',
          });
          this.tags.set(goal.tags.map((t) => t.name));
          this.pageLoading.set(false);
        },
        error: () => {
          this.notify.error('Failed to load goal.');
          this.router.navigateByUrl('/goals');
        },
      });
    } else {
      this.pageLoading.set(false);
    }
  }

  /** Adds a tag from the tag input on Enter keypress. */
  addTag(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value && !this.tags().includes(value)) {
      this.tags.update((t) => [...t, value]);
    }
    input.value = '';
  }

  /** Removes a tag by name. */
  removeTag(tag: string): void {
    this.tags.update((t) => t.filter((item) => item !== tag));
  }

  /** Submits the form as a create or update request. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const body = {
      title: raw.title,
      description: raw.description || null,
      timelineType: raw.timelineType,
      targetDate: raw.targetDate,
      categoryId: raw.categoryId ? Number(raw.categoryId) : null,
      tags: this.tags(),
    };

    const request$ = this.isEditMode()
      ? this.api.put<Goal>(`/goals/${this.goalId}`, body)
      : this.api.post<Goal>('/goals', body);

    request$.subscribe({
      next: (goal) => {
        this.saving.set(false);
        this.notify.success(this.isEditMode() ? 'Goal updated successfully!' : 'Goal created successfully!');
        this.router.navigate(['/goals', goal.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err.message || 'Failed to save goal.');
      },
    });
  }
}
