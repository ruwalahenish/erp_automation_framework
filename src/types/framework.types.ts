/**
 * @fileoverview Environment configuration types for multi-environment support.
 * Defines the contract for environment-specific settings used across the framework.
 */

/** Supported environment names */
export type EnvironmentName = 'local' | 'staging' | 'production';

/** Environment-specific configuration */
export interface EnvironmentConfig {
  /** Display name of the environment */
  readonly name: EnvironmentName;
  /** Base URL for the application under test */
  readonly baseUrl: string;
  /** API base URL for backend services */
  readonly apiBaseUrl: string;
  /** Request timeout in milliseconds */
  readonly timeout: number;
  /** Navigation timeout in milliseconds */
  readonly navigationTimeout: number;
  /** Expect/assertion timeout in milliseconds */
  readonly expectTimeout: number;
  /** Number of test retries on failure */
  readonly retries: number;
  /** Number of parallel workers */
  readonly workers: number;
  /** Default timezone ID */
  readonly timezoneId?: string;
}

/** API request configuration */
export interface ApiRequestConfig {
  /** Full request URL */
  readonly url: string;
  /** HTTP method */
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Request headers */
  readonly headers?: Record<string, string>;
  /** Request body payload */
  readonly data?: Record<string, unknown>;
  /** Query parameters */
  readonly params?: Record<string, string | number | boolean>;
  /** Request timeout override in milliseconds */
  readonly timeout?: number;
}

/** API response wrapper */
export interface ApiResponse<T = unknown> {
  /** HTTP status code */
  readonly status: number;
  /** Response body parsed as JSON */
  readonly body: T;
  /** Response headers */
  readonly headers: Record<string, string>;
  /** Response time in milliseconds */
  readonly responseTime: number;
}

/** Authentication credentials */
export interface UserCredentials {
  /** User email or username */
  readonly username: string;
  /** User password */
  readonly password: string;
}

/** Test user data with profile information */
export interface TestUser extends UserCredentials {
  /** User's first name */
  readonly firstName: string;
  /** User's last name */
  readonly lastName: string;
  /** User's email address */
  readonly email: string;
}

/** Generic page metadata for assertions */
export interface PageMetadata {
  /** Expected page title */
  readonly title: string;
  /** Expected URL pattern (string or RegExp) */
  readonly urlPattern: string | RegExp;
  /** Expected heading text */
  readonly heading?: string;
}

/** Screenshot configuration for failure captures */
export interface ScreenshotConfig {
  /** Whether to capture full page screenshot */
  readonly fullPage: boolean;
  /** Screenshot file path */
  readonly path?: string;
  /** Image quality (0-100) for JPEG */
  readonly quality?: number;
}

/** Test result metadata attached to reports */
export interface TestResultMetadata {
  /** Environment where test was executed */
  readonly environment: EnvironmentName;
  /** Browser used for the test */
  readonly browser: string;
  /** Timestamp of test execution */
  readonly timestamp: string;
  /** Test duration in milliseconds */
  readonly duration: number;
}
