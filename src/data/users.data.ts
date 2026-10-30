/**
 * @fileoverview Externalized test user data with typed interfaces.
 * Provides a single test user profile sourced from environment variables.
 */

import type { TestUser } from '../types';

/**
 * The application test user.
 * Credentials are sourced from environment variables with fallback defaults.
 */
export const testUser: TestUser = {
  username: process.env.TEST_USERNAME || 'harshit@webosmotic.com',
  password: process.env.TEST_PASSWORD || 'Harshit@123456',
  firstName: 'harshit',
  lastName: '',
  email: process.env.TEST_USERNAME || 'harshit@webosmotic.com',
};
