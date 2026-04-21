/**
 * Pagination component using DaisyUI join classes.
 * Displays page numbers with previous/next controls.
 */

import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  /** Current active page (1-based). */
  currentPage = input.required<number>();

  /** Total number of items across all pages. */
  totalCount = input.required<number>();

  /** Number of items per page. */
  pageSize = input.required<number>();

  /** Event emitted when the user navigates to a different page. */
  pageChange = output<number>();

  /** Computed total number of pages. */
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  /** Computed array of page numbers to display. */
  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  /** Navigates to the specified page number. */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
