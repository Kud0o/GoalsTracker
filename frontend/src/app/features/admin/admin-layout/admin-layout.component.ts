/**
 * Admin panel layout component with responsive sidebar navigation.
 * Provides the shell for all admin child routes with a DaisyUI drawer sidebar
 * and a content area rendered via router-outlet.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Renders the admin panel shell: a left sidebar with navigation links
 * (hidden on mobile, accessible via drawer toggle) and a main content area.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="drawer lg:drawer-open">
      <input id="admin-drawer" type="checkbox" class="drawer-toggle" />

      <!-- Main content area -->
      <div class="drawer-content flex flex-col min-h-[calc(100vh-4rem)]">
        <!-- Mobile top bar -->
        <div class="lg:hidden bg-base-100 border-b border-base-300 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <label for="admin-drawer" class="btn btn-ghost btn-sm btn-square">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="font-bold text-lg">Admin Panel</span>
          </div>
        </div>

        <!-- Routed content -->
        <div class="flex-1 p-4 lg:p-6">
          <router-outlet />
        </div>
      </div>

      <!-- Sidebar -->
      <div class="drawer-side z-40">
        <label for="admin-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <aside class="w-64 min-h-full bg-base-100 border-r border-base-300 flex flex-col">
          <!-- Sidebar header -->
          <div class="bg-gradient-to-br from-primary to-secondary p-6">
            <div class="flex items-center gap-3">
              <div class="rounded-xl bg-white/20 p-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 text-white">
                  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <h2 class="text-white font-bold text-lg">Admin Panel</h2>
                <p class="text-white/60 text-xs">Welcome, {{ firstName() }}</p>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 p-4">
            <ul class="menu gap-1">
              <li>
                <a routerLink="/admin/users" routerLinkActive="active bg-primary/10 text-primary font-semibold"
                   class="flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-base-200">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 opacity-70">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zm-4.07 11c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                  Users
                </a>
              </li>
              <li>
                <a routerLink="/admin/categories" routerLinkActive="active bg-primary/10 text-primary font-semibold"
                   class="flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-base-200">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 opacity-70">
                    <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                  </svg>
                  Categories
                </a>
              </li>
              <li>
                <a routerLink="/admin/assign" routerLinkActive="active bg-primary/10 text-primary font-semibold"
                   class="flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-base-200">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 opacity-70">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                  </svg>
                  Assign Goal
                </a>
              </li>
            </ul>
          </nav>

          <!-- Footer -->
          <div class="p-4 border-t border-base-300">
            <a routerLink="/dashboard" class="btn btn-ghost btn-sm w-full justify-start gap-2 text-base-content/60 hover:text-base-content">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
              </svg>
              Back to App
            </a>
          </div>
        </aside>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  private readonly auth = inject(AuthService);

  readonly firstName = signal('Admin');

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.firstName.set(user?.firstName || user?.userName || 'Admin');
  }
}
