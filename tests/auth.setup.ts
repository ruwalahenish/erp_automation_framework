/**
 * @fileoverview Authentication setup for Playwright.
 * Runs once before all tests (via the 'setup' project) to create a reusable
 * authenticated session stored at .auth/user.json.
 */

import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const AUTH_FILE = path.resolve(process.cwd(), '.auth/user.json');

setup('authenticate', async ({ page }) => {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;
  const baseUrl = process.env.BASE_URL || 'https://meera-qc.m.frappe.cloud';

  if (!username || !password) {
    throw new Error(
      '[auth.setup] TEST_USERNAME or TEST_PASSWORD is not set in .env. Cannot authenticate.',
    );
  }

  // Navigate to login page
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });

  // Fill credentials
  await page
    .locator(
      'input[name="usr"], input[id="login_email"], input[placeholder*="Email"], input[placeholder*="Username"]',
    )
    .first()
    .fill(username);

  await page
    .locator('input[name="pwd"], input[id="login_password"], input[type="password"]')
    .first()
    .fill(password);

  // Submit login
  await page
    .locator(
      'button[data-label="Login"], button:has-text("Login"), button:has-text("Sign In"), .btn-login',
    )
    .first()
    .click();

  // Wait for successful redirect to /desk
  await expect(page).toHaveURL(/\/desk/, { timeout: 20000 });

  // Persist authenticated storage state
  await page.context().storageState({ path: AUTH_FILE });

  console.info(`[auth.setup] Auth session saved to: ${AUTH_FILE}`);
});
