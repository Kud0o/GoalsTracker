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
import { getIconEmoji } from '../../../shared/utils/icon-map';

/**
 * Shared create/edit form for goals with reactive validation,
 * dynamic category loading, and tag management via badge chips.
 */
@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto max-w-6xl p-4">
      @if (pageLoading()) {
        <app-loading-spinner size="lg" />
      } @else {
        <!-- Header -->
        <div class="mb-6">
          <a routerLink="/goals" class="btn btn-ghost btn-sm gap-1 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Back to Goals
          </a>
          <h1 class="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            @if (isEditMode()) {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit Goal
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              Create New Goal
            }
          </h1>
          <p class="text-base-content/50 text-sm mt-1">{{ isEditMode() ? 'Update your goal details below' : 'Define your goal and set a timeline' }}</p>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <!-- Left: Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="lg:col-span-3">
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-6">
                <!-- Title -->
                <div class="form-control mb-5">
                  <label class="label" for="title">
                    <span class="label-text font-semibold">Title <span class="text-error">*</span></span>
                  </label>
                  <input id="title" type="text" formControlName="title" class="input input-bordered w-full focus:input-primary" placeholder="What do you want to achieve?" />
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
                <div class="form-control mb-5">
                  <label class="label" for="description">
                    <span class="label-text font-semibold">Description</span>
                  </label>
                  <textarea id="description" formControlName="description" class="textarea textarea-bordered w-full h-24 focus:textarea-primary" placeholder="Add more details about your goal..."></textarea>
                </div>

                <!-- Image URL -->
                <div class="form-control mb-5">
                  <label class="label" for="imageUrl">
                    <span class="label-text font-semibold">Image URL (optional)</span>
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                        <path fill-rule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909-4.97-4.969a.75.75 0 00-1.06 0L2.5 11.06zM12.75 7a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clip-rule="evenodd"/>
                      </svg>
                    </span>
                    <input id="imageUrl" type="url" formControlName="imageUrl" class="input input-bordered w-full pl-11 focus:input-primary" placeholder="https://example.com/image.jpg" />
                  </div>
                  @if (form.value.imageUrl) {
                    <div class="mt-2 rounded-lg overflow-hidden border border-base-300">
                      <img [src]="form.value.imageUrl" alt="Goal preview" class="w-full h-40 object-cover" (error)="onImageError($event)" />
                    </div>
                  }
                </div>

                <!-- Timeline Type -->
                <div class="form-control mb-5">
                  <label class="label">
                    <span class="label-text font-semibold">Timeline Type <span class="text-error">*</span></span>
                  </label>
                  <div class="grid grid-cols-3 gap-3">
                    @for (tl of timelineOptions; track tl.value) {
                      <label
                        class="card cursor-pointer border-2 transition-all duration-200 hover:shadow-md relative overflow-hidden"
                        [class]="getTimelineCardClass(tl.value)"
                      >
                        @if (form.controls.timelineType.value === tl.value) {
                          <div class="absolute top-1.5 right-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                          </div>
                        }
                        <div class="card-body items-center p-4">
                          <div class="rounded-full p-2" [class]="tl.bgClass">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" [class]="tl.iconClass" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              @if (tl.value === 1) {
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                              }
                              @if (tl.value === 2) {
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/>
                              }
                              @if (tl.value === 3) {
                                <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><line x1="2" y1="12" x2="22" y2="12"/>
                              }
                            </svg>
                          </div>
                          <span class="block text-sm font-semibold mt-1">{{ tl.label }}</span>
                          <span class="block text-[10px] text-base-content/40">{{ tl.hint }}</span>
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
                <div class="form-control mb-5">
                  <label class="label" for="targetDate">
                    <span class="label-text font-semibold">Target Date <span class="text-error">*</span></span>
                  </label>
                  <div class="relative">
                    <input id="targetDate" type="date" formControlName="targetDate" class="input input-bordered w-full focus:input-primary pl-10" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  @if (form.controls.targetDate.touched && form.controls.targetDate.errors) {
                    <label class="label">
                      <span class="label-text-alt text-error">
                        @if (form.controls.targetDate.errors['required']) { Target date is required }
                      </span>
                    </label>
                  }
                </div>

                <!-- Category -->
                <div class="form-control mb-5">
                  <label class="label" for="categoryId">
                    <span class="label-text font-semibold">Category</span>
                  </label>
                  <select id="categoryId" formControlName="categoryId" class="select select-bordered w-full focus:select-primary">
                    <option [ngValue]="null" value="">No category</option>
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id">{{ getIcon(cat.icon) }} {{ cat.name }}</option>
                    }
                  </select>
                </div>

                <!-- Tags -->
                <div class="form-control mb-6">
                  <label class="label" for="tagInput">
                    <span class="label-text font-semibold">Tags</span>
                  </label>
                  <div class="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                    @for (tag of tags(); track tag) {
                      <span class="badge badge-primary gap-1 py-3 transition-all duration-200 hover:badge-error group">
                        {{ tag }}
                        <button type="button" class="opacity-60 group-hover:opacity-100 transition-opacity" (click)="removeTag(tag)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                        </button>
                      </span>
                    }
                  </div>
                  <div class="relative">
                    <input
                      id="tagInput"
                      type="text"
                      class="input input-bordered w-full focus:input-primary pl-10"
                      placeholder="Type a tag and press Enter"
                      (keydown.enter)="addTag($event)"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                  </div>
                  <label class="label"><span class="label-text-alt text-base-content/40">Press Enter to add each tag</span></label>
                </div>

                <!-- Actions (desktop) -->
                <div class="card-actions justify-end hidden lg:flex">
                  <a routerLink="/goals" class="btn btn-ghost gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                    Cancel
                  </a>
                  <button type="submit" class="btn btn-primary gap-2" [disabled]="saving()">
                    @if (saving()) {
                      <span class="loading loading-spinner loading-sm"></span>
                      Saving...
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                      {{ isEditMode() ? 'Update Goal' : 'Create Goal' }}
                    }
                  </button>
                </div>
              </div>
            </div>

            <!-- Sticky Mobile Save -->
            <div class="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-4 lg:hidden z-50 flex gap-3">
              <a routerLink="/goals" class="btn btn-ghost flex-1 gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                Cancel
              </a>
              <button type="submit" class="btn btn-primary flex-1 gap-2" [disabled]="saving()">
                @if (saving()) {
                  <span class="loading loading-spinner loading-sm"></span>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                }
                {{ isEditMode() ? 'Update' : 'Save Goal' }}
              </button>
            </div>
          </form>

          <!-- Right: Live Preview -->
          <div class="lg:col-span-2">
            <div class="sticky top-4">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Live Preview
              </h3>
              <div class="card bg-base-100 shadow border-t-4 overflow-hidden"
                [class.border-t-info]="form.controls.timelineType.value === 1"
                [class.border-t-secondary]="form.controls.timelineType.value === 2"
                [class.border-t-accent]="form.controls.timelineType.value === 3">
                <div class="card-body p-5">
                  <h3 class="card-title text-base">
                    {{ form.controls.title.value || 'Your goal title' }}
                  </h3>
                  @if (form.controls.description.value) {
                    <p class="text-sm text-base-content/60 line-clamp-3">{{ form.controls.description.value }}</p>
                  } @else {
                    <p class="text-sm text-base-content/30 italic">No description yet</p>
                  }

                  @if (getSelectedCategory()) {
                    <div class="flex items-center gap-1.5 mt-1">
                      <span class="w-2.5 h-2.5 rounded-full inline-block" [style.background-color]="getSelectedCategory()!.colorHex"></span>
                      <span class="text-xs text-base-content/60">{{ getSelectedCategory()!.name }}</span>
                    </div>
                  }

                  <div class="flex flex-wrap gap-1.5 mt-3">
                    <span class="badge badge-sm"
                      [class.badge-info]="form.controls.timelineType.value === 1"
                      [class.badge-secondary]="form.controls.timelineType.value === 2"
                      [class.badge-accent]="form.controls.timelineType.value === 3">
                      {{ getPreviewTimelineLabel() }}
                    </span>
                    <span class="badge badge-success badge-sm">Active</span>
                  </div>

                  @if (tags().length > 0) {
                    <div class="flex flex-wrap gap-1.5 mt-2">
                      @for (tag of tags(); track tag) {
                        <span class="badge badge-ghost badge-sm">{{ tag }}</span>
                      }
                    </div>
                  }

                  <div class="flex items-center gap-1 mt-3 pt-3 border-t border-base-200 text-xs text-base-content/50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {{ form.controls.targetDate.value || 'No date set' }}
                  </div>
                </div>
              </div>

              <!-- Help Tips -->
              <div class="card bg-base-200/50 mt-4">
                <div class="card-body p-4">
                  <h4 class="font-semibold text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-info" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                    Tips
                  </h4>
                  <ul class="text-xs text-base-content/50 space-y-1 mt-2">
                    <li class="flex items-start gap-1.5">
                      <span class="text-success mt-0.5">&#x2022;</span>
                      Weekly goals earn base points on completion
                    </li>
                    <li class="flex items-start gap-1.5">
                      <span class="text-secondary mt-0.5">&#x2022;</span>
                      Monthly goals earn 2x base points
                    </li>
                    <li class="flex items-start gap-1.5">
                      <span class="text-accent mt-0.5">&#x2022;</span>
                      Yearly goals earn 5x base points
                    </li>
                    <li class="flex items-start gap-1.5">
                      <span class="text-warning mt-0.5">&#x2022;</span>
                      Complete early for bonus points!
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- spacer for mobile sticky bar -->
        <div class="h-20 lg:hidden"></div>
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
    { value: TimelineType.Weekly, label: 'Weekly', hint: '7-day sprints', bgClass: 'bg-info/10', iconClass: 'text-info' },
    { value: TimelineType.Monthly, label: 'Monthly', hint: '30-day targets', bgClass: 'bg-secondary/10', iconClass: 'text-secondary' },
    { value: TimelineType.Yearly, label: 'Yearly', hint: 'Long-term vision', bgClass: 'bg-accent/10', iconClass: 'text-accent' },
  ];

  /** Maps icon names to emoji. */
  getIcon = getIconEmoji;

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
    imageUrl: [''],
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

  /** Returns the selected category object for the preview, if any. */
  getSelectedCategory(): CategoryInfo | null {
    const id = this.form.controls.categoryId.value;
    if (!id) return null;
    return this.categories().find(c => c.id === Number(id)) ?? null;
  }

  /** Returns the CSS class for a timeline selection card. */
  getTimelineCardClass(value: number): string {
    if (this.form.controls.timelineType.value === value) {
      return 'border-primary bg-primary/5 ring-2 ring-primary/30';
    }
    return 'border-base-300 bg-base-200';
  }

  /** Returns a label for the preview timeline type. */
  getPreviewTimelineLabel(): string {
    switch (this.form.controls.timelineType.value) {
      case TimelineType.Weekly: return 'Weekly';
      case TimelineType.Monthly: return 'Monthly';
      case TimelineType.Yearly: return 'Yearly';
      default: return 'Weekly';
    }
  }

  /** Submits the form as a create or update request. */
  /** Hides a broken image preview. */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

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
      imageUrl: raw.imageUrl || null,
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
