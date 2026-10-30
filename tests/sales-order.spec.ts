/**
 * @fileoverview End-to-end test suite for Sales Order (Order-to-Cash) flow.
 */

import { test, expect } from '../src/fixtures';
import { standardSalesOrderData } from '../src/data';
import { saveSavedSalesOrder } from '../src/helpers';

test.describe('Sales Order Flow @salesOrder', () => {

  test('SO-E2E-001: Create and submit standard single-item Sales Order and verify in list view @smoke @critical', async ({
    salesOrderPage,
  }) => {
    // 1. Navigate to Sales Order list and initiate new order
    await salesOrderPage.goto();
    await salesOrderPage.clickAddSalesOrder();

    // 2. Validate default form values
    await salesOrderPage.expectDefaultFormValues();

    // 3. Populate Customer, Fill delivery date and Line Item details
    await salesOrderPage.selectCustomer(standardSalesOrderData.customer);

    await salesOrderPage.selectTodayDeliveryDate();

    const item = standardSalesOrderData.items[0]!;

    await salesOrderPage.fillLineItem(0, item);

    // 4. Validate dynamic totals (Net Total = Total Quantity * Dynamic Item Unit Amount)
    await salesOrderPage.expectTotalQuantity(item.qty);
    await salesOrderPage.expectNetTotal();

    // 5. Save as Draft and capture generated document ID
    const orderId = await salesOrderPage.saveDraft();
    expect(orderId).toMatch(/^O\/\d+/);

    // Store and save the generated Sales Order ID for downstream processing
    saveSavedSalesOrder({
      orderId,
      customer: standardSalesOrderData.customer,
      itemCode: item.itemCode,
      qty: item.qty,
    });

    // 6. Schedule deliveries for line item 0:
    // - Click Schedule button to open Delivery Schedule modal
    await salesOrderPage.openDeliverySchedule(0);

    // - Enter per day qty (100) and verify auto-counted number of deliveries (500 / 100 = 5)
    const perDayQty = 100;
    const expectedDeliveries = Math.ceil(item.qty / perDayQty);
    await salesOrderPage.enterDeliverySchedulePerDayQty(perDayQty);
    await salesOrderPage.verifyNumberOfDeliveries(expectedDeliveries);

    // - Click Get Delivery Schedule and verify auto-calculated schedule rows
    await salesOrderPage.clickGetDeliverySchedule();
    await salesOrderPage.verifyDeliveryScheduleRows({
      perDayQty,
      expectedCount: expectedDeliveries,
    });

    // - Click Add Schedule button
    await salesOrderPage.clickAddSchedule();

    // 7. Submit the Sales Order and assert status transitions to 'To Deliver and Bill'
    await salesOrderPage.submitOrder();

    // 8. Verify the submitted document is listed with correct status in List View
    await salesOrderPage.verifyOrderInList(
      orderId,
      standardSalesOrderData.customer,
      'To Deliver and Bill',
    );
  });
});
