/**
 * Pure pipe that transforms an ISO date string into a human-readable relative format.
 * Examples: "just now", "5 minutes ago", "2 hours ago", "3 days ago", "in 2 weeks".
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate',
  standalone: true,
  pure: true,
})
export class RelativeDatePipe implements PipeTransform {
  /**
   * Transforms a date string into a relative time description.
   * @param value - ISO 8601 date string to transform.
   * @returns Human-readable relative date string.
   */
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const absDiffMs = Math.abs(diffMs);
    const isFuture = diffMs < 0;

    const seconds = Math.floor(absDiffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let relative: string;

    if (seconds < 60) {
      relative = 'just now';
      return relative;
    } else if (minutes < 60) {
      relative = minutes === 1 ? '1 minute' : `${minutes} minutes`;
    } else if (hours < 24) {
      relative = hours === 1 ? '1 hour' : `${hours} hours`;
    } else if (days < 7) {
      relative = days === 1 ? '1 day' : `${days} days`;
    } else if (weeks < 5) {
      relative = weeks === 1 ? '1 week' : `${weeks} weeks`;
    } else if (months < 12) {
      relative = months === 1 ? '1 month' : `${months} months`;
    } else {
      relative = years === 1 ? '1 year' : `${years} years`;
    }

    return isFuture ? `in ${relative}` : `${relative} ago`;
  }
}
