/**
 * @fileoverview Component Object Model for reusable modal / dialog windows.
 */

import { type Locator, type Page, expect } from '@playwright/test';

export class ModalComponent {
  readonly root: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly confirmButton: Locator;

  constructor(
    protected readonly page: Page,
    locator?: Locator,
  ) {
    this.root = locator ?? page.locator('[role="dialog"], .modal').first();
    this.title = this.root.locator('[role="heading"], .modal-title, h2, h3').first();
    this.closeButton = this.root.getByRole('button', { name: /close|cancel/i });
    this.confirmButton = this.root.getByRole('button', { name: /save|confirm|ok|submit/i });
  }

  async expectVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async closeModal(): Promise<void> {
    await this.closeButton.click();
    await expect(this.root).toBeHidden();
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }
}
