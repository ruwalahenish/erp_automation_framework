/**
 * @fileoverview Complete End-to-End test suite connecting Sales Order (Order-to-Cash)
 * and RI Dispatch Planning (Order Fulfillment) modules.
 *
 * Flow:
 *  1. Create, schedule, and submit a Sales Order (SO-XXXX).
 *  2. Capture and persist the generated Sales Order ID.
 *  3. Navigate to RI Dispatch Planning, query delivery schedules, and verify the generated order appears.
 *  4. Assign mandatory shipping address, save Draft (DO-XXXX), and submit the dispatch plan.
 *  5. Verify both records are properly registered in their respective list views.
 */

import { test, expect } from '../src/fixtures';
import { standardSalesOrderData, standardRIDispatchPlanningData } from '../src/data';
import { saveSavedSalesOrder, formatDate, getDateOffset } from '../src/helpers';

test.describe('Sales Order to RI Dispatch Planning E2E Flow @e2e @orderToDispatch', () => {

  test('E2E-SO-DP-001: Create and submit Sales Order, then create and submit RI Dispatch Planning for that order @smoke @critical', async ({
    salesOrderPage,
    riDispatchPlanningPage,
  }) => {
    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 1: Create and Submit Sales Order
    // ══════════════════════════════════════════════════════════════════════════

    // 1. Navigate to Sales Order list and initiate new order
    await salesOrderPage.goto();
    await salesOrderPage.clickAddSalesOrder();

    // 2. Validate default form values
    await salesOrderPage.expectDefaultFormValues();

    // 3. Populate Customer, Delivery Date, and Line Item details
    await salesOrderPage.selectCustomer(standardSalesOrderData.customer);
    await salesOrderPage.selectTodayDeliveryDate();

    const item = standardSalesOrderData.items[0]!;
    await salesOrderPage.fillLineItem(0, item);

    // 4. Validate dynamic totals (Net Total = Total Quantity * Dynamic Item Unit Amount)
    await salesOrderPage.expectTotalQuantity(item.qty);
    await salesOrderPage.expectNetTotal();

    // 5. Save as Draft and capture generated Sales Order document ID
    const orderId = await salesOrderPage.saveDraft();
    expect(orderId).toMatch(/^O\/\d+/);

    // Persist generated order ID for cross-module reference
    saveSavedSalesOrder({
      orderId,
      customer: standardSalesOrderData.customer,
      itemCode: item.itemCode,
      qty: item.qty,
    });

    // 6. Schedule deliveries for line item 0:
    await salesOrderPage.openDeliverySchedule(0);

    const perDayQty = 100;
    const expectedDeliveries = Math.ceil(item.qty / perDayQty);
    await salesOrderPage.enterDeliverySchedulePerDayQty(perDayQty);
    await salesOrderPage.verifyNumberOfDeliveries(expectedDeliveries);

    await salesOrderPage.clickGetDeliverySchedule();
    await salesOrderPage.verifyDeliveryScheduleRows({
      perDayQty,
      expectedCount: expectedDeliveries,
    });

    await salesOrderPage.clickAddSchedule();

    // 7. Submit the Sales Order and assert status transitions to 'To Deliver and Bill'
    await salesOrderPage.submitOrder();

    // 8. Verify the submitted Sales Order is listed in the Sales Order List View
    await salesOrderPage.verifyOrderInList(
      orderId,
      standardSalesOrderData.customer,
      'To Deliver and Bill',
    );

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 2: Create and Submit RI Dispatch Planning for that Sales Order
    // ══════════════════════════════════════════════════════════════════════════

    // 9. Navigate to RI Dispatch Planning list and initiate new dispatch plan
    await riDispatchPlanningPage.goto();
    await riDispatchPlanningPage.clickAddRIDispatchPlanning();

    // 10. Validate default form values (Naming Series, Company, Warehouse)
    await riDispatchPlanningPage.expectDefaultFormValues();

    // 11. Populate Customer filter and set future To Date range to capture all scheduled deliveries
    await riDispatchPlanningPage.selectCustomer(standardSalesOrderData.customer);
    const futureToDate = formatDate(getDateOffset(14), 'short');
    await riDispatchPlanningPage.setToDate(futureToDate);

    // 12. Click Ok to query and populate pending Sales Order delivery schedules
    await riDispatchPlanningPage.clickOk();

    // 13. Verify child table has rows populated
    const rowCount = await riDispatchPlanningPage.getDetailRowsCount();
    expect(rowCount).toBeGreaterThan(0);

    // 14. Verify that THIS SPECIFIC generated Sales Order ID is present in the child grid
    await riDispatchPlanningPage.verifyOrderInDetailTable(orderId);

    // 15. Set mandatory Shipping Address for the order in child rows
    await riDispatchPlanningPage.setShippingAddressForOrder(
      orderId,
      standardRIDispatchPlanningData.shippingAddress,
    );

    // 16. Save as Draft and capture generated Dispatch Planning ID (e.g. DO/1, DO/2)
    const planId = await riDispatchPlanningPage.saveDraft();
    expect(planId).toMatch(/^DO\/\d+/);

    // 17. Submit the RI Dispatch Planning document (docstatus transitions to 1)
    await riDispatchPlanningPage.submitDispatchPlan();

    // 18. Verify the submitted document is listed with 'Submitted' status in RI Dispatch Planning List View
    await riDispatchPlanningPage.verifyPlanInList(planId, 'Submitted');
  });
});
