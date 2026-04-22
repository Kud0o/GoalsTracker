/**
 * Admin users management component.
 * Displays a searchable, paginated table of all users with statistics,
 * allowing navigation to individual user goals and goal assignment.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { PagedResponse } from '../../../core/models/api-response.model';
import { AdminUser } from '../../../core/models/admin.model';

/**
 * Renders a data table of all users with search functionality,
 * completion rate progress bars, achievement badges, and navigation
 * to user goal details and goal assignment.
 */
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7 text-primary">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zm-4.07 11c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            Users
          </h1>
          <p class="text-base-content/50 text-sm mt-1">Manage users and view their goal statistics</p>
        </div>
        <a routerLink="/admin/assign" class="btn btn-primary gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Assign Goal
        </a>
      </div>

      <!-- Search -->
      <div class="card bg-base-100 shadow-sm mb-6">
        <div class="card-body p-4">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              class="input input-bordered w-full pl-10 focus:input-primary"
              placeholder="Search users by name or email..."
              [value]="searchQuery()"
              (input)="onSearch($event)"
            />
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (filteredUsers().length === 0) {
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body items-center text-center py-16">
            <div class="text-6xl mb-4">👥</div>
            <h3 class="text-lg font-semibold">No users found</h3>
            <p class="text-base-content/50 text-sm">
              @if (searchQuery()) {
                No users match your search. Try a different query.
              } @else {
                No users have registered yet.
              }
            </p>
          </div>
        </div>
      } @else {
        <!-- Stats summary -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div class="bg-base-100 rounded-xl p-4 shadow-sm border-l-4 border-l-primary">
            <p class="text-2xl font-extrabold text-primary">{{ allUsers().length }}</p>
            <p class="text-xs text-base-content/50 font-medium uppercase tracking-wide">Total Users</p>
          </div>
          <div class="bg-base-100 rounded-xl p-4 shadow-sm border-l-4 border-l-success">
            <p class="text-2xl font-extrabold text-success">{{ getTotalGoals() }}</p>
            <p class="text-xs text-base-content/50 font-medium uppercase tracking-wide">Total Goals</p>
          </div>
          <div class="bg-base-100 rounded-xl p-4 shadow-sm border-l-4 border-l-info">
            <p class="text-2xl font-extrabold text-info">{{ getTotalCompleted() }}</p>
            <p class="text-xs text-base-content/50 font-medium uppercase tracking-wide">Completed</p>
          </div>
          <div class="bg-base-100 rounded-xl p-4 shadow-sm border-l-4 border-l-warning">
            <p class="text-2xl font-extrabold text-warning">{{ getTotalAdminAssigned() }}</p>
            <p class="text-xs text-base-content/50 font-medium uppercase tracking-wide">Admin Assigned</p>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card bg-base-100 shadow-sm overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr class="bg-base-200/50">
                <th>User</th>
                <th class="hidden sm:table-cell">Goals</th>
                <th class="hidden md:table-cell">Completion</th>
                <th class="hidden sm:table-cell">Points</th>
                <th class="hidden lg:table-cell">Level</th>
                <th class="hidden lg:table-cell">Admin Goals</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (user of paginatedUsers(); track user.userId) {
                <tr class="hover:bg-base-200/50 cursor-pointer transition-colors duration-150" (click)="viewUserGoals(user)">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="avatar placeholder">
                        <div class="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center"
                          [class]="user.isAdmin ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content'">
                          {{ user.userName.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                      <div class="min-w-0">
                        <div class="font-semibold text-sm flex items-center gap-1.5">
                          <span class="truncate">{{ user.firstName }} {{ user.lastName }}</span>
                          @if (user.isAdmin) {
                            <span class="badge badge-primary badge-xs">Admin</span>
                          }
                        </div>
                        <div class="text-xs text-base-content/50 truncate">&#64;{{ user.userName }} &middot; {{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="hidden sm:table-cell">
                    <span class="font-semibold">{{ user.totalGoals }}</span>
                    <span class="text-xs text-base-content/40 ml-1">({{ user.completedGoals }} done)</span>
                  </td>
                  <td class="hidden md:table-cell">
                    <div class="flex items-center gap-2">
                      <progress class="progress progress-success w-16 h-2" [value]="user.completionRate" max="100"></progress>
                      <span class="text-xs font-medium">{{ user.completionRate | number:'1.0-0' }}%</span>
                    </div>
                  </td>
                  <td class="hidden sm:table-cell">
                    <span class="badge badge-warning badge-sm gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      {{ user.totalPoints }}
                    </span>
                  </td>
                  <td class="hidden lg:table-cell">
                    <span class="badge badge-ghost badge-sm">{{ user.achievementLevel }}</span>
                  </td>
                  <td class="hidden lg:table-cell">
                    @if (user.adminAssignedGoals > 0) {
                      <span class="badge badge-info badge-sm">{{ user.adminAssignedGoals }}</span>
                    } @else {
                      <span class="text-base-content/30 text-xs">--</span>
                    }
                  </td>
                  <td>
                    <button class="btn btn-ghost btn-xs gap-1" (click)="viewUserGoals(user); $event.stopPropagation()">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex justify-center mt-6">
            <div class="join">
              <button class="join-item btn btn-sm" [disabled]="currentPage() <= 1" (click)="goToPage(currentPage() - 1)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              @for (page of pageNumbers(); track page) {
                <button class="join-item btn btn-sm" [class.btn-active]="page === currentPage()" (click)="goToPage(page)">
                  {{ page }}
                </button>
              }
              <button class="join-item btn btn-sm" [disabled]="currentPage() >= totalPages()" (click)="goToPage(currentPage() + 1)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly pageSize = 15;
  readonly loading = signal(true);
  readonly allUsers = signal<AdminUser[]>([]);
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);

  /** Computed filtered user list based on search query. */
  readonly filteredUsers = signal<AdminUser[]>([]);

  /** Total number of pages based on filtered results. */
  readonly totalPages = signal(1);

  /** Current page of users to display. */
  readonly paginatedUsers = signal<AdminUser[]>([]);

  /** Page number buttons to render. */
  readonly pageNumbers = signal<number[]>([]);

  ngOnInit(): void {
    this.loadUsers();
  }

  /** Handles search input and re-filters. */
  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.applyFilter();
  }

  /** Navigates to the user goals detail page. */
  viewUserGoals(user: AdminUser): void {
    this.router.navigate(['/admin/users', user.userId, 'goals']);
  }

  /** Navigates to a specific page. */
  goToPage(page: number): void {
    this.currentPage.set(page);
    this.applyPagination();
  }

  /** Returns total goal count across all users. */
  getTotalGoals(): number {
    return this.allUsers().reduce((sum, u) => sum + u.totalGoals, 0);
  }

  /** Returns total completed goal count across all users. */
  getTotalCompleted(): number {
    return this.allUsers().reduce((sum, u) => sum + u.completedGoals, 0);
  }

  /** Returns total admin-assigned goal count across all users. */
  getTotalAdminAssigned(): number {
    return this.allUsers().reduce((sum, u) => sum + u.adminAssignedGoals, 0);
  }

  /** Loads users from the admin API endpoint. */
  private loadUsers(): void {
    this.loading.set(true);
    this.api.get<PagedResponse<AdminUser>>('/admin/users', {
      search: this.searchQuery() || '',
      page: 1,
      pageSize: 200,
    }).subscribe({
      next: (response) => {
        this.allUsers.set(response.items);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => {
        this.allUsers.set([]);
        this.loading.set(false);
      },
    });
  }

  /** Applies the search filter to the user list. */
  private applyFilter(): void {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.allUsers();
    if (query) {
      filtered = filtered.filter(
        (u) =>
          u.userName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }
    this.filteredUsers.set(filtered);
    this.applyPagination();
  }

  /** Applies pagination to the filtered user list. */
  private applyPagination(): void {
    const filtered = this.filteredUsers();
    const total = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    this.totalPages.set(total);

    const page = Math.min(this.currentPage(), total);
    this.currentPage.set(page);

    const start = (page - 1) * this.pageSize;
    this.paginatedUsers.set(filtered.slice(start, start + this.pageSize));

    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    this.pageNumbers.set(pages);
  }
}
