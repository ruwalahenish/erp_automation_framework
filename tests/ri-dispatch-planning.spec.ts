/**
 * @fileoverview End-to-end test suite for RI Dispatch Planning module.
 */

import { test, expect } from '../src/fixtures';
import { standardRIDispatchPlanningData } from '../src/data';
import { getSavedSalesOrder, formatDate, getDateOffset } from '../src/helpers';

test.describe('RI Dispatch Planning Flow @dispatchPlanning', () => {

  test('DP-E2E-001: Create and submit standard RI Dispatch Planning and verify in list view @smoke @critical', async ({
    riDispatchPlanningPage,
  }) => {
    // 1. Navigate to RI Dispatch Planning list and initiate new plan
    await riDispatchPlanningPage.goto();
    await riDispatchPlanningPage.clickAddRIDispatchPlanning();

    // 2. Validate default form values (Naming Series, Company, Warehouse)
    await riDispatchPlanningPage.expectDefaultFormValues();

    // 3. Populate Customer filter and set future To Date to capture scheduled deliveries
    await riDispatchPlanningPage.selectCustomer(standardRIDispatchPlanningData.customer);
    const futureToDate = formatDate(getDateOffset(14), 'short');
    await riDispatchPlanningPage.setToDate(futureToDate);

    // 4. Click Ok to query and populate pending Sales Order delivery schedules
    await riDispatchPlanningPage.clickOk();

    // 5. Verify child table has rows populated
    const rowCount = await riDispatchPlanningPage.getDetailRowsCount();
    expect(rowCount).toBeGreaterThan(0);

    // Verify Sales Order in child grid (retrieves either last saved Sales Order or active order pattern)
    const savedOrder = getSavedSalesOrder();
    const orderToVerify = savedOrder?.orderId ?? 'O/';
    await riDispatchPlanningPage.verifyOrderInDetailTable(orderToVerify);

    // 6. Set mandatory Shipping Address for child rows to ensure validation passes
    await riDispatchPlanningPage.setShippingAddressForAllRows(
      standardRIDispatchPlanningData.shippingAddress,
    );

    // 7. Save as Draft and capture generated document ID (e.g. DO/1, DO/2)
    const planId = await riDispatchPlanningPage.saveDraft();
    expect(planId).toMatch(/^DO\/\d+/);

    // 8. Submit the RI Dispatch Planning document (docstatus 1)
    await riDispatchPlanningPage.submitDispatchPlan();

    // 9. Verify the submitted document is listed with 'Submitted' status in List View
    await riDispatchPlanningPage.verifyPlanInList(planId, 'Submitted');
  });
});
