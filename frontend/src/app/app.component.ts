/**
 * Root application component for GoalsTracker.
 * Renders the navbar, router outlet, and notification toast container.
 */

import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { NotificationService } from './core/services/notification.service';

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

  /** Notification service for displaying toast messages. */
  protected readonly notifications = inject(NotificationService);
}
