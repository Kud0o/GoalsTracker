/**
 * Main navigation bar component using DaisyUI navbar and drawer.
 * Displays app title, navigation links, and user controls.
 * Responsive: uses a DaisyUI drawer for mobile navigation.
 */

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  /** Auth service for checking authentication state. */
  protected readonly auth = inject(AuthService);
  /** Router for programmatic navigation. */
  private readonly router = inject(Router);

  /** Logs the user out and redirects to the login page. */
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
