/**
 * @fileoverview API helper for making HTTP requests during test setup/teardown.
 * Provides a typed wrapper around Playwright's APIRequestContext for bypassing UI
 * when seeding data, creating test resources, or verifying backend state.
 */

import { type APIRequestContext, request } from '@playwright/test';
import type { ApiRequestConfig, ApiResponse } from '../types';
import { envConfig } from '../config';

/**
 * API client wrapper for test setup and teardown operations.
 * Enables tests to bypass the UI for data seeding and verification.
 *
 * @example
 * ```typescript
 * const api = new ApiHelper();
 * await api.init();
 * const response = await api.get<UserData>('/users/1');
 * await api.dispose();
 * ```
 */
export class ApiHelper {
  private context: APIRequestContext | null = null;
  private authToken: string | null = null;

  /**
   * Initializes the API request context with base URL and default headers.
   *
   * @param baseUrl - Optional base URL override for the API
   */
  async init(baseUrl?: string): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    this.context = await request.newContext({
      baseURL: baseUrl ?? envConfig.apiBaseUrl,
      extraHTTPHeaders: headers,
    });
  }

  /**
   * Disposes the API request context and releases resources.
   * Must be called after all API operations are complete.
   */
  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }

  /**
   * Sets the authentication token for subsequent requests.
   *
   * @param token - Bearer token for authentication
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Returns the active API request context.
   * Throws a descriptive error if `init()` has not been called.
   *
   * @returns The active APIRequestContext
   * @throws Error if the context has not been initialized
   */
  private getContext(): APIRequestContext {
    if (!this.context) {
      throw new Error(
        '[ApiHelper] API context not initialized. Call init() before making requests.',
      );
    }
    return this.context;
  }

  /**
   * Sends a generic HTTP request using the provided configuration.
   *
   * @typeParam T - Expected response body type
   * @param config - Request configuration including URL, method, headers, and body
   * @returns Typed API response with status, body, headers, and timing
   */
  async sendRequest<T = unknown>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const ctx = this.getContext();
    const startTime = Date.now();

    const response = await ctx.fetch(config.url, {
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params,
      timeout: config.timeout,
    });

    const responseTime = Date.now() - startTime;
    let body: T;

    try {
      body = (await response.json()) as T;
    } catch {
      body = (await response.text()) as unknown as T;
    }

    const headers: Record<string, string> = {};
    for (const { name, value } of response.headersArray()) {
      headers[name] = value;
    }

    return {
      status: response.status(),
      body,
      headers,
      responseTime,
    };
  }

  /**
   * Sends a GET request to the specified endpoint.
   *
   * @typeParam T - Expected response body type
   * @param endpoint - API endpoint path (appended to base URL)
   * @param params - Optional query parameters
   * @returns Typed API response
   */
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<ApiResponse<T>> {
    return this.sendRequest<T>({
      url: endpoint,
      method: 'GET',
      params,
    });
  }

  /**
   * Sends a POST request to the specified endpoint.
   *
   * @typeParam T - Expected response body type
   * @param endpoint - API endpoint path
   * @param data - Request body payload
   * @returns Typed API response
   */
  async post<T = unknown>(
    endpoint: string,
    data: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    return this.sendRequest<T>({
      url: endpoint,
      method: 'POST',
      data,
    });
  }

  /**
   * Sends a PUT request to the specified endpoint.
   *
   * @typeParam T - Expected response body type
   * @param endpoint - API endpoint path
   * @param data - Request body payload
   * @returns Typed API response
   */
  async put<T = unknown>(endpoint: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.sendRequest<T>({
      url: endpoint,
      method: 'PUT',
      data,
    });
  }

  /**
   * Sends a PATCH request to the specified endpoint.
   *
   * @typeParam T - Expected response body type
   * @param endpoint - API endpoint path
   * @param data - Partial request body payload
   * @returns Typed API response
   */
  async patch<T = unknown>(
    endpoint: string,
    data: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    return this.sendRequest<T>({
      url: endpoint,
      method: 'PATCH',
      data,
    });
  }

  /**
   * Sends a DELETE request to the specified endpoint.
   *
   * @typeParam T - Expected response body type
   * @param endpoint - API endpoint path
   * @returns Typed API response
   */
  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.sendRequest<T>({
      url: endpoint,
      method: 'DELETE',
    });
  }

  /**
   * Authenticates with the API and stores the auth token for subsequent requests.
   * Re-initializes the context with the new auth token in headers.
   *
   * @param username - Authentication username
   * @param password - Authentication password
   * @param loginEndpoint - API login endpoint path
   * @returns The authentication token
   */
  async authenticate(
    username: string,
    password: string,
    loginEndpoint = '/auth/login',
  ): Promise<string> {
    const response = await this.post<{ token: string }>(loginEndpoint, {
      username,
      password,
    });

    if (response.status !== 200 || !response.body.token) {
      throw new Error(
        `[ApiHelper] Authentication failed with status ${response.status}: ${JSON.stringify(response.body)}`,
      );
    }

    this.authToken = response.body.token;

    // Re-initialize context with auth token in headers
    await this.dispose();
    await this.init();

    return this.authToken;
  }
}
