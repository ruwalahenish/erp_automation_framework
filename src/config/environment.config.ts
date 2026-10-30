/**
 * @fileoverview Multi-environment configuration manager.
 * Provides environment-specific settings resolved via environment variables.
 * Supports local, staging, and production environments with sensible defaults.
 */

import type { EnvironmentConfig, EnvironmentName } from '../types';

/** Environment configuration map with defaults for each environment */
const environments: Record<EnvironmentName, EnvironmentConfig> = {
  local: {
    name: 'local',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api',
    timeout: 30_000,
    navigationTimeout: 30_000,
    expectTimeout: 10_000,
    retries: 0,
    workers: 4,
  },
  staging: {
    name: 'staging',
    baseUrl: process.env.BASE_URL || 'https://meera-qc.m.frappe.cloud',
    apiBaseUrl: process.env.API_BASE_URL || 'https://meera-qc.m.frappe.cloud/api/method',
    timeout: 45_000,
    navigationTimeout: 45_000,
    expectTimeout: 15_000,
    retries: 2,
    workers: 2,
  },
  production: {
    name: 'production',
    baseUrl: process.env.BASE_URL || 'https://meera-qc.m.frappe.cloud',
    apiBaseUrl: process.env.API_BASE_URL || 'https://meera-qc.m.frappe.cloud/api/method',
    timeout: 60_000,
    navigationTimeout: 60_000,
    expectTimeout: 20_000,
    retries: 3,
    workers: 1,
  },
};

/**
 * Resolves the current environment name from the `TEST_ENV` environment variable.
 * Falls back to 'local' if the variable is not set or invalid.
 *
 * @returns The resolved environment name
 */
function resolveEnvironmentName(): EnvironmentName {
  const envValue = process.env.TEST_ENV?.toLowerCase();
  const validEnvironments: EnvironmentName[] = ['local', 'staging', 'production'];

  if (envValue && validEnvironments.includes(envValue as EnvironmentName)) {
    return envValue as EnvironmentName;
  }

  if (envValue) {
    console.warn(
      `[Config] Invalid TEST_ENV value "${envValue}". Expected one of: ${validEnvironments.join(', ')}. Falling back to "local".`,
    );
  }

  return 'local';
}

/**
 * Retrieves the environment configuration for the current or specified environment.
 * Environment-specific values can be overridden via environment variables.
 *
 * @param envName - Optional environment name override. Defaults to `TEST_ENV` variable.
 * @returns The resolved environment configuration
 *
 * @example
 * ```typescript
 * const config = getEnvironmentConfig();
 * console.log(config.baseUrl); // http://localhost:3000
 *
 * const stagingConfig = getEnvironmentConfig('staging');
 * console.log(stagingConfig.baseUrl); // https://meera-qc.m.frappe.cloud
 * ```
 */
export function getEnvironmentConfig(envName?: EnvironmentName): EnvironmentConfig {
  const resolvedEnv = envName ?? resolveEnvironmentName();
  const config = environments[resolvedEnv];

  return {
    ...config,
    baseUrl: process.env.BASE_URL || config.baseUrl,
    apiBaseUrl: process.env.API_BASE_URL || config.apiBaseUrl,
    timeout: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT, 10) : config.timeout,
    retries: process.env.RETRIES ? parseInt(process.env.RETRIES, 10) : config.retries,
    workers: process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : config.workers,
    timezoneId: process.env.TIMEZONE || 'UTC',
  };
}

/**
 * Returns the current environment name.
 *
 * @returns The current environment name
 */
export function getCurrentEnvironment(): EnvironmentName {
  return resolveEnvironmentName();
}

/** Pre-resolved config for the current environment (convenience export) */
export const envConfig = getEnvironmentConfig();
