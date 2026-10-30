/**
 * @fileoverview Custom Playwright base fixtures providing shared infrastructure.
 * Provides low-level infrastructure fixtures (API helpers, environment config).
 */

import { test as base } from '@playwright/test';
import { ApiHelper } from '../helpers/api.helper';
import type { EnvironmentConfig } from '../types';
import { envConfig } from '../config';

export interface BaseInfrastructureFixtures {
  /** API helper instance (initialized and automatically cleaned up per test) */
  apiHelper: ApiHelper;
  /** Current environment configuration object */
  environmentConfig: EnvironmentConfig;
}

export const test = base.extend<BaseInfrastructureFixtures>({
  apiHelper: async ({}, use: (apiHelper: ApiHelper) => Promise<void>) => {
    const apiHelper = new ApiHelper();
    await apiHelper.init();
    await use(apiHelper);
    await apiHelper.dispose();
  },

  environmentConfig: async ({}, use: (config: EnvironmentConfig) => Promise<void>) => {
    await use(envConfig);
  },
});

export { expect } from '@playwright/test';
