/**
 * @fileoverview Minimal base class for Page Object Model implementations.
 * Exposes the Playwright Page instance directly following official Playwright best practices.
 */

import { type Page, expect } from '@playwright/test';
import type { PageMetadata } from '../types';

/**
 * Abstract base class for all Page Objects in the framework.
 */
export abstract class BasePage {
  /** Playwright Page instance exposed directly to subclasses and tests */
  readonly page: Page;

  /** Metadata describing the page for navigation and assertions */
  abstract readonly pageMetadata: PageMetadata;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the page using its defined URL pattern.
   *
   * @param path - Optional path parameter if urlPattern is dynamic
   */
  async navigateTo(path?: string): Promise<void> {
    const url =
      path ??
      (typeof this.pageMetadata.urlPattern === 'string' ? this.pageMetadata.urlPattern : '');

    if (!url) {
      throw new Error(
        `[${this.constructor.name}] Cannot navigate: urlPattern is a RegExp and no path was provided.`,
      );
    }

    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Verifies that the page URL and optional title match expected metadata.
   */
  async verifyPageLoaded(): Promise<void> {
    const { urlPattern, title } = this.pageMetadata;

    await expect(this.page).toHaveURL(urlPattern);

    if (title) {
      await expect(this.page).toHaveTitle(new RegExp(title, 'i'));
    }
  }
}
