/**
 * Notification service for displaying toast messages.
 * Uses Angular signals to manage a reactive list of notifications
 * that auto-dismiss after a configurable timeout.
 */

import { Injectable, signal } from '@angular/core';

/** Supported notification severity types. */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/** Represents a single notification message. */
export interface NotificationMessage {
  /** Unique identifier for the notification. */
  id: number;
  /** Severity type controlling the visual style. */
  type: NotificationType;
  /** Text content of the notification. */
  text: string;
}

/** Auto-dismiss delay in milliseconds. */
const DISMISS_TIMEOUT = 5000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** Internal counter for generating unique notification IDs. */
  private nextId = 0;

  /** Signal holding the current list of active notifications. */
  readonly messages = signal<NotificationMessage[]>([]);

  /**
   * Displays a success notification.
   * @param msg - Message text to display.
   */
  success(msg: string): void {
    this.addMessage('success', msg);
  }

  /**
   * Displays an error notification.
   * @param msg - Message text to display.
   */
  error(msg: string): void {
    this.addMessage('error', msg);
  }

  /**
   * Displays a warning notification.
   * @param msg - Message text to display.
   */
  warning(msg: string): void {
    this.addMessage('warning', msg);
  }

  /**
   * Displays an informational notification.
   * @param msg - Message text to display.
   */
  info(msg: string): void {
    this.addMessage('info', msg);
  }

  /**
   * Manually dismisses a notification by its ID.
   * @param id - The notification ID to remove.
   */
  dismiss(id: number): void {
    this.messages.update((msgs) => msgs.filter((m) => m.id !== id));
  }

  /**
   * Adds a new notification and schedules its auto-dismissal.
   * @param type - Notification severity type.
   * @param text - Message text.
   */
  private addMessage(type: NotificationType, text: string): void {
    const id = this.nextId++;
    const message: NotificationMessage = { id, type, text };
    this.messages.update((msgs) => [...msgs, message]);
    setTimeout(() => this.dismiss(id), DISMISS_TIMEOUT);
  }
}
