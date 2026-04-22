/**
 * Achievement badge component that displays a user's achievement level.
 * Renders a colored badge with gradient background, glow effect, and shine animation.
 * Different tiers have distinct visual styles.
 */

import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-achievement-badge',
  standalone: true,
  template: `
    <span
      class="achievement-badge inline-flex items-center gap-1.5 rounded-full font-semibold text-white cursor-default select-none"
      [class]="sizeClass()"
      [style.background]="tierGradient()"
      [style.box-shadow]="tierGlow()"
    >
      <svg [attr.width]="iconSize()" [attr.height]="iconSize()" viewBox="0 0 20 20" fill="currentColor" class="shrink-0">
        <path fill-rule="evenodd" d="M10 1l2.39 4.843 5.345.776-3.868 3.77.913 5.323L10 13.347l-4.78 2.365.913-5.323-3.868-3.77 5.345-.776L10 1z" clip-rule="evenodd"/>
      </svg>
      {{ levelName() }}
    </span>
  `,
  styles: [`
    .achievement-badge {
      position: relative;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .achievement-badge::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 60%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      transition: left 0.5s ease;
    }
    .achievement-badge:hover::before {
      left: 120%;
    }
    .achievement-badge:hover {
      transform: scale(1.05);
    }
    .badge-size-sm {
      padding: 2px 10px;
      font-size: 0.75rem;
      line-height: 1.25rem;
    }
    .badge-size-md {
      padding: 4px 14px;
      font-size: 0.85rem;
      line-height: 1.35rem;
    }
    .badge-size-lg {
      padding: 6px 18px;
      font-size: 1rem;
      line-height: 1.5rem;
    }
  `],
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
    const map = { sm: 'badge-size-sm', md: 'badge-size-md', lg: 'badge-size-lg' };
    return map[this.size()];
  });

  /** Returns the icon size in pixels based on badge size. */
  iconSize = computed(() => {
    const map = { sm: 12, md: 14, lg: 16 };
    return map[this.size()];
  });

  /** Detect tier from levelName and return a gradient. */
  tierGradient = computed(() => {
    const name = this.levelName().toLowerCase();
    if (name.includes('diamond')) {
      return 'linear-gradient(135deg, #7dd3fc, #38bdf8, #0ea5e9, #7dd3fc)';
    }
    if (name.includes('platinum')) {
      return 'linear-gradient(135deg, #94a3b8, #cbd5e1, #64748b, #94a3b8)';
    }
    if (name.includes('gold')) {
      return 'linear-gradient(135deg, #f59e0b, #fbbf24, #d97706, #f59e0b)';
    }
    if (name.includes('silver')) {
      return 'linear-gradient(135deg, #9ca3af, #d1d5db, #6b7280, #9ca3af)';
    }
    if (name.includes('bronze')) {
      return 'linear-gradient(135deg, #b45309, #d97706, #92400e, #b45309)';
    }
    // fallback uses the colorHex prop
    return `linear-gradient(135deg, ${this.colorHex()}, ${this.colorHex()}dd, ${this.colorHex()})`;
  });

  /** Matching glow effect for each tier. */
  tierGlow = computed(() => {
    const name = this.levelName().toLowerCase();
    if (name.includes('diamond')) {
      return '0 0 12px rgba(56, 189, 248, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)';
    }
    if (name.includes('platinum')) {
      return '0 0 12px rgba(148, 163, 184, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)';
    }
    if (name.includes('gold')) {
      return '0 0 12px rgba(245, 158, 11, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)';
    }
    if (name.includes('silver')) {
      return '0 0 12px rgba(156, 163, 175, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
    }
    if (name.includes('bronze')) {
      return '0 0 12px rgba(180, 83, 9, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
    }
    return `0 0 10px ${this.colorHex()}66, inset 0 1px 0 rgba(255,255,255,0.2)`;
  });
}
