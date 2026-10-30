/**
 * @fileoverview Playwright configuration with setup project authentication.
 * Configures retries, timeouts, reporters, and storage state at the framework level.
 */

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getEnvironmentConfig } from './src/config';

/** Path to the persisted authenticated session (created by tests/auth.setup.ts) */
const AUTH_FILE = path.resolve(__dirname, '.auth/user.json');

// Load .env file before config is resolved
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envConfig = getEnvironmentConfig();

/**
 * Playwright configuration.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /* ─── Test Discovery ─────────────────────────────────────────────── */
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  /* ─── Execution Settings ─────────────────────────────────────────── */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: envConfig.retries,
  workers: process.env.CI ? 1 : envConfig.workers,
  timeout: envConfig.timeout,

  /* ─── Expect Configuration ───────────────────────────────────────── */
  expect: {
    timeout: envConfig.expectTimeout,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },

  /* ─── Global Setup / Teardown ────────────────────────────────────── */
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  /* ─── Reporters ──────────────────────────────────────────────────── */
  reporter: process.env.CI
    ? [
      ['list'],
      ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ['junit', { outputFile: 'test-results/junit-results.xml' }],
      ['github'],
      ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }],
    ]
    : [
      ['list'],
      ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }],
    ],

  /* ─── Shared Settings ───────────────────────────────────────────── */
  use: {
    baseURL: envConfig.baseUrl,
    navigationTimeout: envConfig.navigationTimeout,

    /* Tracing & Debugging */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Browser Defaults */
    headless: !!process.env.CI,
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO, 10) : 0,
    },
    actionTimeout: 30_000,
    locale: 'en-US',
    timezoneId: envConfig.timezoneId || 'UTC',

    /* Extra HTTP Headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  /* ─── Output Directories ────────────────────────────────────────── */
  outputDir: 'test-results/artifacts',

  /* ─── Browser Projects ──────────────────────────────────────────── */
  projects: [
    /* ── Auth Setup Project ────────────────────────────────────── */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    /* ── Desktop Browsers ──────────────────────────────────────── */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Reuse authenticated session — created once by auth.setup.ts
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },
  ],
});
