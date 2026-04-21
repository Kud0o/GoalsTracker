/**
 * Achievement badge component that displays a user's achievement level.
 * Renders a colored DaisyUI badge with the level name.
 */

import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-achievement-badge',
  standalone: true,
  templateUrl: './achievement-badge.component.html',
})
export class AchievementBadgeComponent {
  /** Name of the achievement level to display. */
  levelName = input.required<string>();

  /** Hex color to use for the badge background. */
  colorHex = input<string>('#6366f1');

  /** Size of the badge: 'sm', 'md', or 'lg'. Defaults to 'md'. */
  size = input<'sm' | 'md' | 'lg'>('md');

  /** Computed CSS class for badge sizing. */
  sizeClass = computed(() => {
    const map = { sm: 'badge-sm', md: 'badge-md', lg: 'badge-lg' };
    return map[this.size()];
  });
}
