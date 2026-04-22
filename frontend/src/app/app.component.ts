/**
 * Root application component for GoalsTracker.
 * Renders the navbar, router outlet, and notification toast container.
 */

import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  /** Application title. */
  title = 'GoalsTracker';

  /** Auth service to conditionally show navbar. */
  protected readonly auth = inject(AuthService);

  /** Notification service for displaying toast messages. */
  protected readonly notifications = inject(NotificationService);
}
