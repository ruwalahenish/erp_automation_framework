/**
 * @fileoverview Global teardown executed once after all tests complete.
 * Handles cleanup of temporary files, auth state, and test artifacts.
 */

import type { FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Playwright global teardown function.
 * Runs once after the entire test suite completes.
 *
 * @param _config - Playwright full configuration object
 */
async function globalTeardown(_config: FullConfig): Promise<void> {
  // Clean up auth storage state files
  const authDir = path.resolve(process.cwd(), '.auth');
  if (fs.existsSync(authDir)) {
    const files = await fs.promises.readdir(authDir);
    for (const file of files) {
      const filePath = path.join(authDir, file);
      await fs.promises.unlink(filePath);
    }
  }

  console.info('╔══════════════════════════════════════════════════════╗');
  console.info('║           ✅ TEST SUITE COMPLETED                   ║');
  console.info('║  Auth state cleaned up                              ║');
  console.info('║  Check ./reports/allure/latest for Allure report    ║');
  console.info('╚══════════════════════════════════════════════════════╝');
}

export default globalTeardown;
