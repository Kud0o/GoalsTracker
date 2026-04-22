/**
 * Admin goal assignment component with two-section layout.
 * Left section contains the goal form, right section shows a searchable
 * user selection list with checkboxes. Supports pre-selecting a user via query param.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PagedResponse } from '../../../core/models/api-response.model';
import { CategoryInfo, TimelineType } from '../../../core/models/goal.model';
import { AdminUser, AdminAssignGoal, AdminBatchResult } from '../../../core/models/admin.model';
import { getIconEmoji } from '../../../shared/utils/icon-map';

/**
 * Two-panel form for creating a goal and assigning it to one or more users.
 * The left panel captures goal details; the right panel provides a searchable
 * user selection list with select-all controls.
 */
@Component({
  selector: 'app-admin-assign-goal',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <a routerLink="/admin/users" class="btn btn-ghost btn-sm gap-1 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to Users
        </a>
        <h1 class="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7 text-primary">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Assign Goal to Users
        </h1>
        <p class="text-base-content/50 text-sm mt-1">Create a goal and assign it to one or more users</p>
      </div>

      @if (showResult()) {
        <!-- Success Result -->
        <div class="card bg-gradient-to-br from-success/10 to-success/5 border border-success/20 mb-6">
          <div class="card-body p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="rounded-full bg-success/20 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-success" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-extrabold text-success">Goals Assigned Successfully!</h3>
                <p class="text-sm text-base-content/60">{{ batchResult()?.goalsCreated }} goals created</p>
              </div>
            </div>

            <div class="space-y-2">
              @for (g of batchResult()?.goals || []; track g.goalId) {
                <div class="bg-base-100 rounded-lg p-3 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="avatar placeholder">
                      <div class="w-8 h-8 rounded-full bg-base-300 text-base-content font-bold text-xs flex items-center justify-center">
                        {{ g.userName.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div>
                      <p class="font-medium text-sm">{{ g.userName }}</p>
                      <p class="text-xs text-base-content/50">{{ g.title }}</p>
                    </div>
                  </div>
                  <a [routerLink]="['/admin/users', g.userId, 'goals']" class="btn btn-ghost btn-xs">View</a>
                </div>
              }
            </div>

            <div class="mt-4 flex gap-3">
              <button class="btn btn-primary gap-2" (click)="resetForm()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                </svg>
                Assign Another
              </button>
              <a routerLink="/admin/users" class="btn btn-ghost">Back to Users</a>
            </div>
          </div>
        </div>
      } @else {
        <!-- Two-Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <!-- Left: Goal Form -->
          <div class="lg:col-span-3">
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-6">
                <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                  Goal Details
                </h2>

                <form [formGroup]="form">
                  <!-- Title -->
                  <div class="form-control mb-4">
                    <label class="label" for="title">
                      <span class="label-text font-semibold">Title <span class="text-error">*</span></span>
                    </label>
                    <input id="title" type="text" formControlName="title"
                      class="input input-bordered w-full focus:input-primary"
                      placeholder="What goal to assign?" />
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
                      <span class="label-text font-semibold">Description</span>
                    </label>
                    <textarea id="description" formControlName="description"
                      class="textarea textarea-bordered w-full h-20 focus:textarea-primary"
                      placeholder="Add more details..."></textarea>
                  </div>

                  <!-- Timeline Type -->
                  <div class="form-control mb-4">
                    <label class="label">
                      <span class="label-text font-semibold">Timeline Type <span class="text-error">*</span></span>
                    </label>
                    <div class="grid grid-cols-3 gap-3">
                      @for (tl of timelineOptions; track tl.value) {
                        <label
                          class="card cursor-pointer border-2 transition-all duration-200 hover:shadow-md relative overflow-hidden"
                          [class]="getTimelineCardClass(tl.value)">
                          @if (form.controls.timelineType.value === tl.value) {
                            <div class="absolute top-1.5 right-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                            </div>
                          }
                          <div class="card-body items-center p-3">
                            <div class="rounded-full p-2" [class]="tl.bgClass">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" [class]="tl.iconClass" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                @if (tl.value === 1) {
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                }
                                @if (tl.value === 2) {
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/>
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
                  </div>

                  <!-- Category -->
                  <div class="form-control mb-4">
                    <label class="label" for="categoryId">
                      <span class="label-text font-semibold">Category</span>
                    </label>
                    <select id="categoryId" formControlName="categoryId" class="select select-bordered w-full focus:select-primary">
                      <option value="">No category</option>
                      @for (cat of categories(); track cat.id) {
                        <option [value]="cat.id">{{ getIcon(cat.icon) }} {{ cat.name }}</option>
                      }
                    </select>
                  </div>

                  <!-- Target Date -->
                  <div class="form-control mb-4">
                    <label class="label" for="targetDate">
                      <span class="label-text font-semibold">Target Date <span class="text-error">*</span></span>
                    </label>
                    <div class="relative">
                      <input id="targetDate" type="date" formControlName="targetDate"
                        class="input input-bordered w-full focus:input-primary pl-10" />
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    @if (form.controls.targetDate.touched && form.controls.targetDate.errors) {
                      <label class="label">
                        <span class="label-text-alt text-error">Target date is required</span>
                      </label>
                    }
                  </div>

                  <!-- Image URL -->
                  <div class="form-control mb-4">
                    <label class="label" for="imageUrl">
                      <span class="label-text font-semibold">Image URL (optional)</span>
                    </label>
                    <input id="imageUrl" type="url" formControlName="imageUrl"
                      class="input input-bordered w-full focus:input-primary"
                      placeholder="https://example.com/image.jpg" />
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Right: User Selection -->
          <div class="lg:col-span-2">
            <div class="sticky top-4">
              <div class="card bg-base-100 shadow-sm">
                <div class="card-body p-6">
                  <h2 class="text-lg font-bold mb-1 flex items-center justify-between">
                    <span class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zm-4.07 11c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                      Select Users
                    </span>
                    @if (selectedUserIds().length > 0) {
                      <span class="badge badge-primary badge-sm">{{ selectedUserIds().length }} selected</span>
                    }
                  </h2>

                  <!-- User Search -->
                  <div class="relative mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" class="input input-bordered input-sm w-full pl-9"
                      placeholder="Search users..."
                      [value]="userSearch()"
                      (input)="onUserSearch($event)" />
                  </div>

                  <!-- Select All / Deselect All -->
                  <div class="flex gap-2 mb-3">
                    <button type="button" class="btn btn-ghost btn-xs" (click)="selectAll()">Select All</button>
                    <button type="button" class="btn btn-ghost btn-xs" (click)="deselectAll()">Deselect All</button>
                  </div>

                  <!-- User List -->
                  <div class="max-h-96 overflow-y-auto space-y-1 pr-1">
                    @if (usersLoading()) {
                      <div class="flex justify-center py-8">
                        <span class="loading loading-spinner loading-md text-primary"></span>
                      </div>
                    } @else {
                      @for (user of filteredUsers(); track user.userId) {
                        <div
                          [class]="'flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors duration-150 ' + (isSelected(user.userId) ? 'bg-primary/5 ring-1 ring-primary/30' : '')"
                          (click)="toggleUser(user.userId)">
                          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm"
                            [checked]="isSelected(user.userId)"
                            (click)="$event.stopPropagation()"
                            (change)="toggleUser(user.userId)" />
                          <div class="avatar placeholder">
                            <div class="w-8 h-8 rounded-full bg-base-300 text-base-content font-bold text-xs flex items-center justify-center">
                              {{ user.userName.charAt(0).toUpperCase() }}
                            </div>
                          </div>
                          <div class="flex-1 min-w-0">
                            <span class="text-sm font-medium truncate block">{{ user.firstName }} {{ user.lastName }}</span>
                            <span class="text-xs text-base-content/50 truncate block">&#64;{{ user.userName }} &middot; {{ user.email }}</span>
                          </div>
                          <span class="badge badge-warning badge-xs gap-0.5 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            {{ user.totalPoints }}
                          </span>
                        </div>
                      }
                      @if (filteredUsers().length === 0) {
                        <p class="text-center text-sm text-base-content/40 py-4">No users found</p>
                      }
                    }
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <button type="button" class="btn btn-primary w-full mt-4 gap-2"
                [disabled]="saving() || selectedUserIds().length === 0 || form.invalid"
                (click)="onSubmit()">
                @if (saving()) {
                  <span class="loading loading-spinner loading-sm"></span>
                  Assigning...
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Assign to {{ selectedUserIds().length }} User{{ selectedUserIds().length !== 1 ? 's' : '' }}
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminAssignGoalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  /** Timeline type radio card options. */
  readonly timelineOptions = [
    { value: TimelineType.Weekly, label: 'Weekly', hint: '7-day sprints', bgClass: 'bg-info/10', iconClass: 'text-info' },
    { value: TimelineType.Monthly, label: 'Monthly', hint: '30-day targets', bgClass: 'bg-secondary/10', iconClass: 'text-secondary' },
    { value: TimelineType.Yearly, label: 'Yearly', hint: 'Long-term vision', bgClass: 'bg-accent/10', iconClass: 'text-accent' },
  ];

  /** Maps icon names to emoji. */
  getIcon = getIconEmoji;

  readonly usersLoading = signal(true);
  readonly saving = signal(false);
  readonly showResult = signal(false);
  readonly batchResult = signal<AdminBatchResult | null>(null);
  readonly allUsers = signal<AdminUser[]>([]);
  readonly filteredUsers = signal<AdminUser[]>([]);
  readonly selectedUserIds = signal<string[]>([]);
  readonly userSearch = signal('');
  readonly categories = signal<CategoryInfo[]>([]);

  /** Reactive form for goal data. */
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    timelineType: [TimelineType.Weekly as number, [Validators.required]],
    categoryId: [''],
    targetDate: ['', [Validators.required]],
    imageUrl: [''],
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadCategories();

    // Pre-select user from query param
    const preselectedUserId = this.route.snapshot.queryParamMap.get('userId');
    if (preselectedUserId) {
      this.selectedUserIds.set([preselectedUserId]);
    }
  }

  /** Handles user search input. */
  onUserSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.userSearch.set(query);
    this.applyUserFilter();
  }

  /** Checks if a user is currently selected. */
  isSelected(userId: string): boolean {
    return this.selectedUserIds().includes(userId);
  }

  /** Toggles a user's selection state. */
  toggleUser(userId: string): void {
    const current = this.selectedUserIds();
    if (current.includes(userId)) {
      this.selectedUserIds.set(current.filter((id) => id !== userId));
    } else {
      this.selectedUserIds.set([...current, userId]);
    }
  }

  /** Selects all visible users. */
  selectAll(): void {
    const allIds = this.filteredUsers().map((u) => u.userId);
    const current = new Set(this.selectedUserIds());
    allIds.forEach((id) => current.add(id));
    this.selectedUserIds.set([...current]);
  }

  /** Deselects all users. */
  deselectAll(): void {
    this.selectedUserIds.set([]);
  }

  /** Returns the CSS class for a timeline selection card. */
  getTimelineCardClass(value: number): string {
    if (this.form.controls.timelineType.value === value) {
      return 'border-primary bg-primary/5 ring-2 ring-primary/30';
    }
    return 'border-base-300 bg-base-200';
  }

  /** Submits the assignment form. */
  onSubmit(): void {
    if (this.form.invalid || this.selectedUserIds().length === 0) {
      this.form.markAllAsTouched();
      if (this.selectedUserIds().length === 0) {
        this.notify.error('Please select at least one user.');
      }
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const body: AdminAssignGoal = {
      title: raw.title,
      description: raw.description || undefined,
      timelineType: raw.timelineType,
      categoryId: raw.categoryId ? Number(raw.categoryId) : undefined,
      targetDate: raw.targetDate,
      imageUrl: raw.imageUrl || undefined,
      userIds: this.selectedUserIds(),
    };

    this.api.post<AdminBatchResult>('/admin/goals/assign', body).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.batchResult.set(result);
        this.showResult.set(true);
        this.notify.success(`Successfully assigned goal to ${result.goalsCreated} user(s)!`);
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err.message || 'Failed to assign goals.');
      },
    });
  }

  /** Resets the form and result state for another assignment. */
  resetForm(): void {
    this.form.reset({
      title: '',
      description: '',
      timelineType: TimelineType.Weekly,
      categoryId: '',
      targetDate: '',
      imageUrl: '',
    });
    this.selectedUserIds.set([]);
    this.showResult.set(false);
    this.batchResult.set(null);
  }

  /** Loads all users from the admin API. */
  private loadUsers(): void {
    this.usersLoading.set(true);
    this.api.get<PagedResponse<AdminUser>>('/admin/users', { page: 1, pageSize: 200 }).subscribe({
      next: (response) => {
        this.allUsers.set(response.items);
        this.applyUserFilter();
        this.usersLoading.set(false);
      },
      error: () => {
        this.allUsers.set([]);
        this.usersLoading.set(false);
      },
    });
  }

  /** Loads categories for the category dropdown. */
  private loadCategories(): void {
    this.api.get<CategoryInfo[]>('/categories').subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => { /* categories are optional */ },
    });
  }

  /** Applies the search filter to the user list. */
  private applyUserFilter(): void {
    const query = this.userSearch().toLowerCase().trim();
    let filtered = this.allUsers();
    if (query) {
      filtered = filtered.filter(
        (u) =>
          u.userName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }
    this.filteredUsers.set(filtered);
  }
}
