/**
 * Empty state placeholder component for when no data is available.
 * Displays a centered card with a pulsing icon, title, message, and optional action button.
 */

import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="card bg-base-100 border-2 border-dashed border-base-300 max-w-lg mx-auto">
      <div class="card-body items-center text-center py-12 px-8">
        <div class="empty-icon-wrapper mb-6">
          <ng-content select="[icon]"></ng-content>
        </div>
        <h2 class="text-2xl font-bold text-base-content mb-2">{{ title() }}</h2>
        @if (message()) {
          <p class="text-base text-base-content/60 max-w-sm leading-relaxed">{{ message() }}</p>
        }
        @if (actionLabel()) {
          <div class="card-actions mt-6">
            <button class="btn btn-primary btn-lg gap-2" (click)="onAction()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              {{ actionLabel() }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .empty-icon-wrapper {
      animation: emptyPulse 2.5s ease-in-out infinite;
    }
    .empty-icon-wrapper ::ng-deep > * {
      font-size: 3.5rem;
      display: block;
    }
    @keyframes emptyPulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.08); }
    }
  `],
})
export class EmptyStateComponent {
  /** Title displayed in the empty state card. */
  title = input.required<string>();

  /** Descriptive message displayed below the title. */
  message = input<string>('');

  /** Label for the optional action button. If empty, button is hidden. */
  actionLabel = input<string>('');

  /** Event emitted when the action button is clicked. */
  actionClick = output<void>();

  /** Handles action button click. */
  onAction(): void {
    this.actionClick.emit();
  }
}
