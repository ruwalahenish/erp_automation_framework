/**
 * @fileoverview Login Page Object encapsulating all login page interactions.
 * Uses readonly locator properties and direct Playwright API methods following official best practices.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import type { PageMetadata, UserCredentials } from '../types';

/**
 * Page Object for the Login page.
 */
export class LoginPage extends BasePage {
  readonly pageMetadata: PageMetadata = {
    title: 'Login',
    urlPattern: /\/login$/,
    heading: 'Login',
  };

  // ─── Locators (readonly fields initialized in constructor) ────────────
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('//*[@id="login_email"]');
    this.passwordInput = page.locator('//*[@id="login_password"]');
    this.loginButton = page.locator("//button[normalize-space()='Continue']");
    this.forgotPasswordLink = page.locator("//a[normalize-space()='Forgot password?']");
    this.pageHeading = page.locator('(//h4[contains(.,"Sign In")])[1]');
  }

  // ─── Navigation ───────────────────────────────────────────────────────

  /**
   * Navigates to the login page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
  }

  // ─── Actions ─────────────────────────────────────────────────────────

  /**
   * Performs a complete login flow with the provided credentials.
   */
  async loginWithCredentials(credentials: UserCredentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
  }

  /**
   * Fills only the username field without submitting.
   */
  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * Fills only the password field without submitting.
   */
  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Clicks the "Forgot password" link.
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  // ─── Assertions ──────────────────────────────────────────────────────

  /**
   * Asserts that the login form is displayed and ready for input.
   */
  async expectLoginFormVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}
