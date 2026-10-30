/**
 * @fileoverview Page Object fixtures extending base infrastructure fixtures.
 * Automatically instantiates page objects with the active Playwright Page instance.
 */

import type { Page } from '@playwright/test';
import { test as baseTest } from './base.fixture';
import { LoginPage, OpeningPackingPage, SalesOrderPage, RIDispatchPlanningPage } from '../pages';

export interface PageFixtures {
  /** Fresh LoginPage instance scoped per test */
  loginPage: LoginPage;
  /** Fresh OpeningPackingPage instance scoped per test */
  openingPackingPage: OpeningPackingPage;
  /** Fresh SalesOrderPage instance scoped per test */
  salesOrderPage: SalesOrderPage;
  /** Fresh RIDispatchPlanningPage instance scoped per test */
  riDispatchPlanningPage: RIDispatchPlanningPage;
}

export const test = baseTest.extend<PageFixtures>({
  loginPage: async ({ page }: { page: Page }, use: (loginPage: LoginPage) => Promise<void>) => {
    await use(new LoginPage(page));
  },
  openingPackingPage: async (
    { page }: { page: Page },
    use: (openingPackingPage: OpeningPackingPage) => Promise<void>,
  ) => {
    await use(new OpeningPackingPage(page));
  },
  salesOrderPage: async (
    { page }: { page: Page },
    use: (salesOrderPage: SalesOrderPage) => Promise<void>,
  ) => {
    await use(new SalesOrderPage(page));
  },
  riDispatchPlanningPage: async (
    { page }: { page: Page },
    use: (riDispatchPlanningPage: RIDispatchPlanningPage) => Promise<void>,
  ) => {
    await use(new RIDispatchPlanningPage(page));
  },
});

export { expect } from '@playwright/test';
