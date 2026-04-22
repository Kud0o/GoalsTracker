/**
 * Admin categories management component.
 * Displays a table of goal categories with inline editing, creation,
 * and deletion with conflict detection (categories in use).
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AdminCategory } from '../../../core/models/admin.model';
import { getIconEmoji, ICON_MAP } from '../../../shared/utils/icon-map';

/**
 * Admin CRUD interface for goal categories with color picker,
 * icon input, sort ordering, and safe deletion with conflict warnings.
 */
@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7 text-primary">
              <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            Categories
          </h1>
          <p class="text-base-content/50 text-sm mt-1">Manage goal categories, colors, and icons</p>
        </div>
        <button class="btn btn-primary gap-2" (click)="startAdd()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Add Category
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else {
        <!-- Add/Edit Form (inline card) -->
        @if (showForm()) {
          <div class="card bg-base-100 shadow-sm mb-6 border-l-4 border-l-primary">
            <div class="card-body p-6">
              <h3 class="font-bold text-lg mb-4">
                {{ editingId() ? 'Edit Category' : 'New Category' }}
              </h3>
              <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Name -->
                <div class="form-control">
                  <label class="label"><span class="label-text font-semibold">Name <span class="text-error">*</span></span></label>
                  <input type="text" formControlName="name" class="input input-bordered w-full focus:input-primary" placeholder="Category name" />
                  @if (categoryForm.controls.name.touched && categoryForm.controls.name.errors) {
                    <label class="label"><span class="label-text-alt text-error">Name is required</span></label>
                  }
                </div>

                <!-- Icon Picker -->
                <div class="form-control sm:col-span-2">
                  <label class="label"><span class="label-text font-semibold">Icon</span></label>
                  <div class="grid grid-cols-10 gap-2 mt-1">
                    @for (entry of iconEntries; track entry[0]) {
                      <button type="button"
                        class="btn btn-sm btn-square text-lg"
                        [class.btn-primary]="categoryForm.value.icon === entry[0]"
                        [class.btn-ghost]="categoryForm.value.icon !== entry[0]"
                        (click)="categoryForm.patchValue({icon: entry[0]})"
                        [title]="entry[0]">
                        {{ entry[1] }}
                      </button>
                    }
                  </div>
                  @if (categoryForm.value.icon) {
                    <label class="label"><span class="label-text-alt text-base-content/40">Selected: {{ categoryForm.value.icon }}</span></label>
                  }
                </div>

                <!-- Color -->
                <div class="form-control">
                  <label class="label"><span class="label-text font-semibold">Color</span></label>
                  <div class="flex items-center gap-3">
                    <input type="color" formControlName="colorHex" class="w-12 h-10 rounded-lg border border-base-300 cursor-pointer" />
                    <input type="text" formControlName="colorHex" class="input input-bordered w-full input-sm focus:input-primary font-mono" />
                  </div>
                </div>

                <!-- Sort Order -->
                <div class="form-control">
                  <label class="label"><span class="label-text font-semibold">Sort Order</span></label>
                  <input type="number" formControlName="sortOrder" class="input input-bordered w-full focus:input-primary" min="0" />
                </div>

                <!-- Actions -->
                <div class="sm:col-span-2 flex justify-end gap-3 mt-2">
                  <button type="button" class="btn btn-ghost" (click)="cancelForm()">Cancel</button>
                  <button type="submit" class="btn btn-primary gap-2" [disabled]="formSaving()">
                    @if (formSaving()) {
                      <span class="loading loading-spinner loading-sm"></span>
                    }
                    {{ editingId() ? 'Update' : 'Create' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        @if (categories().length === 0 && !showForm()) {
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body items-center text-center py-16">
              <div class="text-6xl mb-4">🏷️</div>
              <h3 class="text-lg font-semibold">No categories yet</h3>
              <p class="text-base-content/50 text-sm">Create your first category to organize goals.</p>
              <button class="btn btn-primary mt-4 gap-2" (click)="startAdd()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                </svg>
                Add Category
              </button>
            </div>
          </div>
        } @else if (categories().length > 0) {
          <!-- Categories Table -->
          <div class="card bg-base-100 shadow-sm overflow-x-auto">
            <table class="table">
              <thead>
                <tr class="bg-base-200/50">
                  <th>Color</th>
                  <th>Name</th>
                  <th>Icon</th>
                  <th>Sort Order</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (cat of categories(); track cat.id) {
                  <tr class="hover:bg-base-200/50 transition-colors duration-150">
                    <td>
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full border border-base-300 shadow-sm" [style.background-color]="cat.colorHex"></div>
                        <span class="text-xs font-mono text-base-content/50">{{ cat.colorHex }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="font-semibold">{{ cat.name }}</span>
                    </td>
                    <td>
                      <span class="text-base-content/60">{{ cat.icon ? getIcon(cat.icon) : '--' }}</span>
                    </td>
                    <td>
                      <span class="badge badge-ghost badge-sm">{{ cat.sortOrder }}</span>
                    </td>
                    <td>
                      <div class="flex justify-end gap-2">
                        <button class="btn btn-ghost btn-xs gap-1" (click)="startEdit(cat)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          Edit
                        </button>
                        <button class="btn btn-ghost btn-xs text-error gap-1" (click)="confirmDelete(cat)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
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
              <h3 class="font-bold text-lg text-error">Delete Category</h3>
            </div>

            @if (deleteConflict()) {
              <div class="alert alert-warning mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <span>This category is in use by existing goals and cannot be deleted.</span>
              </div>
            } @else {
              <p class="text-base-content/70">
                Are you sure you want to delete <span class="font-semibold">"{{ deletingCategory()?.name }}"</span>?
                This action cannot be undone.
              </p>
            }

            <div class="modal-action">
              <button class="btn btn-ghost" (click)="cancelDelete()">
                {{ deleteConflict() ? 'Close' : 'Cancel' }}
              </button>
              @if (!deleteConflict()) {
                <button class="btn btn-error gap-2" [disabled]="deleting()" (click)="executeDelete()">
                  @if (deleting()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Delete
                </button>
              }
            </div>
          </div>
          <div class="modal-backdrop" (click)="cancelDelete()"></div>
        </div>
      }
    </div>
  `,
})
export class AdminCategoriesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);

  /** Maps icon names to emoji. */
  getIcon = getIconEmoji;

  /** Entries from the icon map for the picker grid. */
  readonly iconEntries = Object.entries(ICON_MAP);

  readonly loading = signal(true);
  readonly categories = signal<AdminCategory[]>([]);
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly formSaving = signal(false);
  readonly showDeleteModal = signal(false);
  readonly deletingCategory = signal<AdminCategory | null>(null);
  readonly deleting = signal(false);
  readonly deleteConflict = signal(false);

  /** Reactive form for category create/edit. */
  readonly categoryForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    colorHex: ['#6366F1'],
    icon: [''],
    sortOrder: [0],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  /** Opens the inline form for adding a new category. */
  startAdd(): void {
    this.editingId.set(null);
    this.categoryForm.reset({ name: '', colorHex: '#6366F1', icon: '', sortOrder: 0 });
    this.showForm.set(true);
  }

  /** Opens the inline form for editing an existing category. */
  startEdit(cat: AdminCategory): void {
    this.editingId.set(cat.id);
    this.categoryForm.patchValue({
      name: cat.name,
      colorHex: cat.colorHex,
      icon: cat.icon,
      sortOrder: cat.sortOrder,
    });
    this.showForm.set(true);
  }

  /** Hides the inline form. */
  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  /** Saves the category (create or update). */
  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.formSaving.set(true);
    const raw = this.categoryForm.getRawValue();
    const body = {
      name: raw.name,
      colorHex: raw.colorHex,
      icon: raw.icon,
      sortOrder: raw.sortOrder,
    };

    const request$ = this.editingId()
      ? this.api.put<AdminCategory>(`/admin/categories/${this.editingId()}`, body)
      : this.api.post<AdminCategory>('/admin/categories', body);

    request$.subscribe({
      next: () => {
        this.formSaving.set(false);
        this.showForm.set(false);
        this.editingId.set(null);
        this.notify.success(this.editingId() ? 'Category updated!' : 'Category created!');
        this.loadCategories();
      },
      error: (err) => {
        this.formSaving.set(false);
        this.notify.error(err.message || 'Failed to save category.');
      },
    });
  }

  /** Opens the delete confirmation modal. */
  confirmDelete(cat: AdminCategory): void {
    this.deletingCategory.set(cat);
    this.deleteConflict.set(false);
    this.showDeleteModal.set(true);
  }

  /** Cancels the delete confirmation. */
  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.deletingCategory.set(null);
    this.deleteConflict.set(false);
  }

  /** Executes the delete operation. */
  executeDelete(): void {
    const cat = this.deletingCategory();
    if (!cat) return;

    this.deleting.set(true);
    this.api.delete(`/admin/categories/${cat.id}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.deletingCategory.set(null);
        this.notify.success('Category deleted.');
        this.loadCategories();
      },
      error: (err) => {
        this.deleting.set(false);
        if (err.error === 'conflict' || err.message?.includes('in use')) {
          this.deleteConflict.set(true);
        } else {
          this.notify.error(err.message || 'Failed to delete category.');
          this.showDeleteModal.set(false);
        }
      },
    });
  }

  /** Loads categories from the admin API endpoint. */
  private loadCategories(): void {
    this.loading.set(true);
    this.api.get<AdminCategory[]>('/admin/categories').subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
