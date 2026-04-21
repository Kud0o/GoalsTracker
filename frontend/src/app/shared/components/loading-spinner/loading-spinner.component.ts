/**
 * Reusable loading spinner component using DaisyUI loading classes.
 * Displays a centered spinner with configurable size.
 */

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.component.html',
})
export class LoadingSpinnerComponent {
  /** Size of the spinner: 'sm', 'md', or 'lg'. Defaults to 'md'. */
  size = input<'sm' | 'md' | 'lg'>('md');
}
