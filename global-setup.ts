/**
 * @fileoverview Global setup executed once before all tests.
 * Handles environment validation, directory setup, and optional connectivity health checks.
 */

import { request, type FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { getCurrentEnvironment, getEnvironmentConfig } from './src/config';

/**
 * Playwright global setup function.
 * Runs once before the entire test suite.
 */
async function globalSetup(_config: FullConfig): Promise<void> {
  const envFile = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  }

  const environment = getCurrentEnvironment();
  const envConfig = getEnvironmentConfig();

  console.info('╔══════════════════════════════════════════════════════╗');
  console.info('║           🚀 ERP TEST FRAMEWORK                     ║');
  console.info('╠══════════════════════════════════════════════════════╣');
  console.info(`║  Environment : ${environment.padEnd(38)}║`);
  console.info(`║  Base URL    : ${envConfig.baseUrl.padEnd(38)}║`);
  console.info(`║  API URL     : ${envConfig.apiBaseUrl.padEnd(38)}║`);
  console.info(`║  Workers     : ${String(envConfig.workers).padEnd(38)}║`);
  console.info(`║  Retries     : ${String(envConfig.retries).padEnd(38)}║`);
  console.info('╚══════════════════════════════════════════════════════╝');

  // Ensure required directories exist
  const dirs = ['test-results', 'test-results/screenshots', '.auth', 'allure-results'];
  for (const dir of dirs) {
    const dirPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Populate Allure Environment Information
  const allureResultsDir = path.resolve(process.cwd(), 'allure-results');
  const envProperties = [
    `Environment=${environment}`,
    `Base.URL=${envConfig.baseUrl}`,
    `API.URL=${envConfig.apiBaseUrl}`,
    `Platform=${process.platform}`,
    `Node.Version=${process.version}`,
    `Workers=${envConfig.workers}`,
    `Retries=${envConfig.retries}`,
  ].join('\n');
  fs.writeFileSync(path.join(allureResultsDir, 'environment.properties'), envProperties);

  // App connectivity check (P1-6)
  try {
    const requestContext = await request.newContext();
    const response = await requestContext.get(envConfig.baseUrl, { timeout: 5000 });
    console.info(`[GlobalSetup] Target server connectivity check: HTTP ${response.status()}`);
    await requestContext.dispose();
  } catch (error) {
    console.warn(
      `[GlobalSetup] Warning: Could not reach Base URL (${envConfig.baseUrl}). Ensure target app is running.`,
    );
  }
}

export default globalSetup;
