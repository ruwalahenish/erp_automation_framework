/**
 * @fileoverview Sample test suite verifying login page interactions.
 */

import { test, expect } from '../src/fixtures';
import { testUser } from '../src/data';

test.describe('Login Flow @happyPath', () => {
  // This suite tests the login page itself — it must run without an active session.
  // Clearing storageState overrides the project-level authenticated context.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Should able to login with valid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectLoginFormVisible();
    await loginPage.loginWithCredentials({
      username: testUser.username,
      password: testUser.password,
    });

    // Verify that redirrect to /desk 
    await expect(loginPage.page).toHaveURL(/desk/);
  });
});
