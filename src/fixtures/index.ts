/**
 * @fileoverview Primary barrel export for test fixtures.
 * Re-exports extended test fixture including both infrastructure and page objects.
 */

export { test, expect } from './pages.fixture';
export { test as baseTest } from './base.fixture';
