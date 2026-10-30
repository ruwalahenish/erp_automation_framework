/**
 * @fileoverview Component Object Model for navigation sidebar.
 */

import { type Locator, type Page, expect } from '@playwright/test';

export class SidebarComponent {
  readonly root: Locator;
  readonly navLinks: Locator;

  constructor(
    protected readonly page: Page,
    locator?: Locator,
  ) {
    this.root = locator ?? page.locator('aside, [role="navigation"], .sidebar').first();
    this.navLinks = this.root.getByRole('link');
  }

  async navigateTo(linkName: string | RegExp): Promise<void> {
    const link = this.root.getByRole('link', { name: linkName });
    await link.click();
  }

  async expectVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }
}
