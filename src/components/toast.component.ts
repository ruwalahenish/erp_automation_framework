/**
 * @fileoverview Component Object Model for toast notification popups.
 */

import { type Locator, type Page, expect } from '@playwright/test';

export class ToastComponent {
  readonly root: Locator;

  constructor(
    protected readonly page: Page,
    locator?: Locator,
  ) {
    this.root = locator ?? page.locator('[role="alert"], .toast, .notification-toast').first();
  }

  async expectSuccess(message?: string | RegExp): Promise<void> {
    await expect(this.root).toBeVisible();
    if (message) {
      await expect(this.root).toContainText(message);
    }
  }

  async expectError(message?: string | RegExp): Promise<void> {
    await expect(this.root).toBeVisible();
    if (message) {
      await expect(this.root).toContainText(message);
    }
  }
}
