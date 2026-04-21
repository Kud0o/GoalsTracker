/**
 * Empty state placeholder component for when no data is available.
 * Displays a centered card with an icon slot, title, message, and optional action button.
 */

import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
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
