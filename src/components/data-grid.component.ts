/**
 * @fileoverview Component Object Model for reusable data grid / table components in ERP.
 */

import { type Locator, type Page, expect } from '@playwright/test';

export class DataGridComponent {
  readonly root: Locator;
  readonly headers: Locator;
  readonly rows: Locator;

  constructor(
    protected readonly page: Page,
    locator?: Locator,
  ) {
    this.root = locator ?? page.locator('table, [role="grid"], .data-grid').first();
    this.headers = this.root.locator('th, [role="columnheader"]');
    this.rows = this.root.locator('tbody tr, [role="row"]');
  }

  /**
   * Returns a row matching text content.
   */
  getRowByText(text: string | RegExp): Locator {
    return this.rows.filter({ hasText: text });
  }

  /**
   * Asserts the grid row count.
   */
  async expectRowCount(count: number): Promise<void> {
    await expect(this.rows).toHaveCount(count);
  }
}
