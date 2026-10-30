/**
 * @fileoverview Test suite for Opening Packing flow.
 */

import { test, expect } from '../src/fixtures';

test.describe('Opening Packing Flow @openingPacking', () => {

  test('OP-E2E-001: Create standard Opening Packing with one packing entry and verify transaction', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter cops, gross wt & tare weight
    await openingPackingPage.enterCops(6);
    await openingPackingPage.enterGrossWt(25);
    await openingPackingPage.enterTareWt(5);

    // 3) Validate Net Wt calculation while still in form (before adding to table)
    await openingPackingPage.expectNetWt(20);

    // 4) Add the item row (Enter triggers the add action)
    await openingPackingPage.page.keyboard.press('Enter');

    // When the add action fires, a print-view tab opens — close it and return to the form
    await openingPackingPage.closePrintViewTab();

    // 5 & 6) verify that added value visible in the below table and perfectly coming
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 6,
      grossWt: 25,
      tareWt: 5,
      netWt: 20
    });

    // 7) go back and check that record visible in the opening packing list
    await openingPackingPage.goto(); // navigating back to list view
    await openingPackingPage.verifyRecordInList('1565-Z', 20);
  });

  test('OP-E2E-002: Create Opening Packing using decimal weights and verify Net Weight calculation', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter cops, gross wt & tare weight
    await openingPackingPage.enterCops(6);
    await openingPackingPage.enterGrossWt(36);
    await openingPackingPage.enterTareWt(3.25);

    // 3) Validate Net Wt calculation while still in form (before adding to table)
    await openingPackingPage.expectNetWt(32.750);

    // 4) Add the item row (Enter triggers the add action)
    await openingPackingPage.page.keyboard.press('Enter');

    // When the add action fires, a print-view tab opens — close it and return to the form
    await openingPackingPage.closePrintViewTab();

    // 5 & 6) verify that added value visible in the below table and perfectly coming
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 6,
      grossWt: 36,
      tareWt: 3.25,
      netWt: 32.750
    });

    // 7) go back and check that record visible in the opening packing list
    await openingPackingPage.goto(); // navigating back to list view
    await openingPackingPage.verifyRecordInList('1565-Z', 32.750);
  });

  test('OP-E2E-003: Create Opening Packing with multiple packing entries and verify all entries', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // Define multiple entries to add
    const entries = [
      { cops: 6, grossWt: 25, tareWt: 5, netWt: 20 },
      { cops: 5, grossWt: 30, tareWt: 2.50, netWt: 27.50 },
      { cops: 4, grossWt: 25.50, tareWt: 2, netWt: 23.50 }
    ];

    const generatedRecords: { batchNo: string, finishItem: string, netWt: number }[] = [];

    for (const entry of entries) {
      // 2) Enter cops, gross wt & tare weight
      await openingPackingPage.enterCops(entry.cops);
      await openingPackingPage.enterGrossWt(entry.grossWt);
      await openingPackingPage.enterTareWt(entry.tareWt);
      // Note: no Enter here — enterTareWt's Tab moves focus to the Add button;
      // clickAddItem() below adds the item explicitly.

      // 3) Calculate and validate calculation
      await openingPackingPage.expectNetWt(entry.netWt);

      // 4) Click on the add button
      await openingPackingPage.clickAddItem();

      // When you click on the add button then redirect to new tab with printview which tab should be close and come back to the opening packing form
      await openingPackingPage.closePrintViewTab();

      // 5 & 6) verify that added value visible in the below table and perfectly coming
      await openingPackingPage.verifyItemInTable({
        finishItem: '1565-Z',
        cops: entry.cops,
        grossWt: entry.grossWt,
        tareWt: entry.tareWt,
        netWt: entry.netWt
      });

      generatedRecords.push({
        batchNo: openingPackingPage.lastExpectedBatchNo,
        finishItem: '1565-Z',
        netWt: entry.netWt
      });
    }

    // 7) go back and check that records visible in the opening packing list
    await openingPackingPage.goto(); // navigating back to list view

    // The list view is usually sorted descending by creation date (newest first), 
    // so we reverse the array to match rows
    await openingPackingPage.verifyMultipleRecordsInList(generatedRecords.reverse());
  });

  test('OP-E2E-004: Create Opening Packing containing different Finish Items', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');

    // Define multiple entries to add with different finish items
    const entries = [
      { finishItem: '1565-Z', cops: 6, grossWt: 25, tareWt: 5, netWt: 20 },
      { finishItem: '1830-S', cops: 5, grossWt: 30, tareWt: 2.50, netWt: 27.50 },
      { finishItem: '2951-250/1', cops: 4, grossWt: 25.50, tareWt: 2, netWt: 23.50 }
    ];

    const generatedRecords: { batchNo: string, finishItem: string, netWt: number }[] = [];

    for (const entry of entries) {
      // 2) Enter Finish Item, cops, gross wt & tare weight for this specific entry
      await openingPackingPage.enterFinishItem(entry.finishItem);
      await openingPackingPage.enterCops(entry.cops);
      await openingPackingPage.enterGrossWt(entry.grossWt);
      await openingPackingPage.enterTareWt(entry.tareWt);

      // 3) Calculate and validate calculation
      await openingPackingPage.expectNetWt(entry.netWt);

      // 4) Click on the add button
      await openingPackingPage.clickAddItem();

      // When you click on the add button then redirect to new tab with printview which tab should be close and come back to the opening packing form
      await openingPackingPage.closePrintViewTab();

      // 5 & 6) verify that added value visible in the below table and perfectly coming
      await openingPackingPage.verifyItemInTable({
        finishItem: entry.finishItem,
        cops: entry.cops,
        grossWt: entry.grossWt,
        tareWt: entry.tareWt,
        netWt: entry.netWt
      });

      generatedRecords.push({
        batchNo: openingPackingPage.lastExpectedBatchNo,
        finishItem: entry.finishItem,
        netWt: entry.netWt
      });
    }

    // 7) go back and check that records visible in the opening packing list
    await openingPackingPage.goto(); // navigating back to list view

    // The list view is usually sorted descending by creation date (newest first), 
    // so we reverse the array to match rows
    await openingPackingPage.verifyMultipleRecordsInList(generatedRecords.reverse());
  });

  test('OP-E2E-005: Prevent Opening Packing when Tare Weight is greater than Gross Weight', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter cops, gross wt & tare weight (Tare Weight > Gross Weight)
    await openingPackingPage.enterCops(6);
    await openingPackingPage.enterGrossWt(10);
    await openingPackingPage.enterTareWt(15); // Intentionally greater than Gross Weight

    // 3) Click on the add button to trigger the validation
    await openingPackingPage.clickAddItem();

    // 4) Verify that the error message is visible preventing the action
    await expect(openingPackingPage.errorModal).toBeVisible({ timeout: 5000 });
    await expect(openingPackingPage.errorMsg).toContainText('Net Weight must be greater than 0.');
  });

  test('OP-E2E-006: Prevent Opening Packing creation when required packing data is incomplete', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Omit cops to make data incomplete, but enter gross wt & tare weight
    await openingPackingPage.enterGrossWt(25);
    await openingPackingPage.enterTareWt(5);

    // 3) Click on the add button to trigger the validation
    await openingPackingPage.clickAddItem();

    // 4) Verify that the error modal is visible preventing the action
    await expect(openingPackingPage.errorModal).toBeVisible({ timeout: 5000 });

    // 5) Verify the specific error message
    await expect(openingPackingPage.errorMsg).toContainText('cops must be greater than 0.');
  });

  test('OP-E2E-007: Create Opening Packing using boundary weight values', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter boundary weight values where Gross Wt = Tare Wt
    await openingPackingPage.enterCops(1);
    await openingPackingPage.enterGrossWt(10);
    await openingPackingPage.enterTareWt(10);

    // 3) Validate the calculated Net Wt is 0
    await openingPackingPage.expectNetWt(0);

    // 4) Click on the add button to trigger the validation
    await openingPackingPage.clickAddItem();

    // 5) Verify that the error message is visible preventing the action
    await expect(openingPackingPage.errorModal).toBeVisible({ timeout: 5000 });

    // 6) Verify the specific error message
    await expect(openingPackingPage.errorMsg).toContainText('Net Weight must be greater than 0.');
  });

  // OP-E2E-008: Same as OP-E2E-001

  test('OP-E2E-009: Verify Net Wt calculation with small decimal values', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter small decimal weight values
    await openingPackingPage.enterCops(1);
    await openingPackingPage.enterGrossWt(0.3);
    await openingPackingPage.enterTareWt(0.1);

    // 3) Validate the calculated Net Wt
    await openingPackingPage.expectNetWt(0.2);

    // 4) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 5) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 1,
      grossWt: 0.3,
      tareWt: 0.1,
      netWt: 0.2
    });

    // 6) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 0.2);
  });

  test('OP-E2E-010: Verify Net Wt calculation with decimal values that are prone to floating-point precision issues', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter weight values that might cause floating-point precision issues
    await openingPackingPage.enterCops(1);
    await openingPackingPage.enterGrossWt(1.1);
    await openingPackingPage.enterTareWt(0.1);

    // 3) Validate the calculated Net Wt
    await openingPackingPage.expectNetWt(1);

    // 4) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 5) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 1,
      grossWt: 1.1,
      tareWt: 0.1,
      netWt: 1
    });

    // 6) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 1);
  });

  // OP-E2E-011: Same as OP-E2E-010

  test('OP-E2E-012: Verify Net Wt calculation with multiple decimal places', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter weight values with multiple decimal places
    await openingPackingPage.enterCops(3);
    await openingPackingPage.enterGrossWt(25.125);
    await openingPackingPage.enterTareWt(5.125);

    // 3) Validate the calculated Net Wt
    await openingPackingPage.expectNetWt(20);

    // 4) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 5) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 3,
      grossWt: 25.125,
      tareWt: 5.125,
      netWt: 20
    });

    // 6) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 20);
  });

  test('OP-E2E-013: Verify Net Wt calculation with multiple decimal places producing decimal result', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter weight values with multiple decimal places producing a decimal result
    await openingPackingPage.enterCops(3);
    await openingPackingPage.enterGrossWt(25.375);
    await openingPackingPage.enterTareWt(5.125);

    // 3) Validate the calculated Net Wt
    await openingPackingPage.expectNetWt(20.25);

    // 4) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 5) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 3,
      grossWt: 25.375,
      tareWt: 5.125,
      netWt: 20.25
    });

    // 6) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 20.25);
  });

  test('OP-E2E-014: Verify Net Wt calculation when Gross and Tare are very close', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter weight values when Gross and Tare are very close
    await openingPackingPage.enterCops(1);
    await openingPackingPage.enterGrossWt(10.01);
    await openingPackingPage.enterTareWt(10.00);

    // 3) Validate the calculated Net Wt
    await openingPackingPage.expectNetWt(0.01);

    // 4) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 5) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 1,
      grossWt: 10.01,
      tareWt: 10.00,
      netWt: 0.01
    });

    // 6) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 0.01);
  });

  test('OP-E2E-015: Verify Net Wt recalculates when Gross Wt is changed', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter initial weight values
    await openingPackingPage.enterCops(1);
    await openingPackingPage.enterGrossWt(25);
    await openingPackingPage.enterTareWt(5);

    // 3) Validate the initial calculated Net Wt
    await openingPackingPage.expectNetWt(20);

    // 4) Change Gross Wt to a new value to trigger recalculation
    await openingPackingPage.enterGrossWt(30);

    // 5) Validate the recalculated Net Wt
    await openingPackingPage.expectNetWt(25);

    // 6) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 7) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 1,
      grossWt: 30,
      tareWt: 5,
      netWt: 25
    });

    // 8) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 25);
  });

  test('OP-E2E-016: Verify Net Wt recalculates when Tare Wt is changed', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter initial weight values
    await openingPackingPage.enterCops(1);
    await openingPackingPage.enterGrossWt(25);
    await openingPackingPage.enterTareWt(5);

    // 3) Validate the initial calculated Net Wt
    await openingPackingPage.expectNetWt(20);

    // 4) Change Tare Wt to a new value to trigger recalculation
    await openingPackingPage.enterTareWt(7);

    // 5) Validate the recalculated Net Wt
    await openingPackingPage.expectNetWt(18);

    // 6) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 7) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 1,
      grossWt: 25,
      tareWt: 7,
      netWt: 18
    });

    // 8) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 18);
  });

  test('OP-E2E-017: Verify Net Wt remains accurate after multiple Gross/Tare changes', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter initial weight values
    await openingPackingPage.enterCops(1);
    await openingPackingPage.enterGrossWt(25);
    await openingPackingPage.enterTareWt(5);

    // 3) Validate the initial calculated Net Wt (25 - 5 = 20)
    await openingPackingPage.expectNetWt(20);

    // 4) Change Gross Wt (30 - 5 = 25)
    await openingPackingPage.enterGrossWt(30);
    await openingPackingPage.expectNetWt(25);

    // 5) Change Tare Wt to 7 (30 - 7 = 23)
    await openingPackingPage.enterTareWt(7);
    await openingPackingPage.expectNetWt(23);

    // 6) Change Tare Wt again to 2.5 (30 - 2.5 = 27.5)
    await openingPackingPage.enterTareWt(2.5);
    await openingPackingPage.expectNetWt(27.5);

    // 7) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 8) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 1,
      grossWt: 30,
      tareWt: 2.5,
      netWt: 27.5
    });

    // 9) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 27.5);
  });

  test('OP-E2E-018: Verify Net Wt calculation independently for multiple packing rows', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    const entries = [
      { cops: 1, grossWt: 25, tareWt: 5, expectedNetWt: 20 },
      { cops: 1, grossWt: 36, tareWt: 3.25, expectedNetWt: 32.75 },
      { cops: 1, grossWt: 10.1, tareWt: 0.1, expectedNetWt: 10 },
      { cops: 1, grossWt: 0.3, tareWt: 0.1, expectedNetWt: 0.2 }
    ];

    const generatedRecords: { batchNo: string, finishItem: string, netWt: number }[] = [];

    for (const entry of entries) {
      await openingPackingPage.enterCops(entry.cops);
      await openingPackingPage.enterGrossWt(entry.grossWt);
      await openingPackingPage.enterTareWt(entry.tareWt);

      await openingPackingPage.expectNetWt(entry.expectedNetWt);

      await openingPackingPage.clickAddItem();
      await openingPackingPage.closePrintViewTab();

      await openingPackingPage.verifyItemInTable({
        finishItem: '1565-Z',
        cops: entry.cops,
        grossWt: entry.grossWt,
        tareWt: entry.tareWt,
        netWt: entry.expectedNetWt
      });

      generatedRecords.push({
        batchNo: openingPackingPage.lastExpectedBatchNo,
        finishItem: '1565-Z',
        netWt: entry.expectedNetWt
      });
    }

    // Go back and check that records are visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyMultipleRecordsInList(generatedRecords.reverse());
  });

  test('OP-E2E-019: Verify Net Wt after clearing and re-entering weight values', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter initial weight values
    await openingPackingPage.enterCops(1);
    await openingPackingPage.enterGrossWt(25);
    await openingPackingPage.enterTareWt(5);

    // 3) Validate the initial calculated Net Wt
    await openingPackingPage.expectNetWt(20);

    // 4) Re-enter weight values (simulating clear and re-enter)
    await openingPackingPage.enterGrossWt(36);
    await openingPackingPage.enterTareWt(3.25);

    // 5) Validate the recalculated Net Wt
    await openingPackingPage.expectNetWt(32.75);

    // 6) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 7) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 1,
      grossWt: 36,
      tareWt: 3.25,
      netWt: 32.75
    });

    // 8) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 32.75);
  });

  test('OP-E2E-020: Verify calculation when changing from integer to decimal values', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter initial integer weight values
    await openingPackingPage.enterCops(1);
    await openingPackingPage.enterGrossWt(25);
    await openingPackingPage.enterTareWt(5);

    // 3) Validate the initial calculated Net Wt
    await openingPackingPage.expectNetWt(20);

    // 4) Change to decimal weight values
    await openingPackingPage.enterGrossWt(10.1);
    await openingPackingPage.enterTareWt(0.1);

    // 5) Validate the recalculated Net Wt
    await openingPackingPage.expectNetWt(10);

    // 6) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 7) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 1,
      grossWt: 10.1,
      tareWt: 0.1,
      netWt: 10
    });

    // 8) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 10);
  });

  test('OP-E2E-021: Verify calculation when changing from decimal to integer values', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    // 2) Enter initial decimal weight values
    await openingPackingPage.enterCops(1);
    await openingPackingPage.enterGrossWt(10.1);
    await openingPackingPage.enterTareWt(0.1);

    // 3) Validate the initial calculated Net Wt
    await openingPackingPage.expectNetWt(10);

    // 4) Change to integer weight values
    await openingPackingPage.enterGrossWt(25);
    await openingPackingPage.enterTareWt(5);

    // 5) Validate the recalculated Net Wt
    await openingPackingPage.expectNetWt(20);

    // 6) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 7) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 1,
      grossWt: 25,
      tareWt: 5,
      netWt: 20
    });

    // 8) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 20);
  });

  test('OP-E2E-022: Verify Net Wt after rapidly changing Gross and Tare values', async ({ openingPackingPage }) => {
    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    await openingPackingPage.enterCops(1);

    // 2) First pair of weights
    await openingPackingPage.enterGrossWt(25);
    await openingPackingPage.enterTareWt(5);
    await openingPackingPage.expectNetWt(20);

    // 3) Rapidly change to second pair
    await openingPackingPage.enterGrossWt(30);
    await openingPackingPage.enterTareWt(3);
    await openingPackingPage.expectNetWt(27);

    // 4) Rapidly change to third pair
    await openingPackingPage.enterGrossWt(36);
    await openingPackingPage.enterTareWt(3.25);
    await openingPackingPage.expectNetWt(32.75);

    // 5) Click on the add button and handle the new tab
    await openingPackingPage.clickAddItem();
    await openingPackingPage.closePrintViewTab();

    // 6) Verify that the item is visible in the inner table
    await openingPackingPage.verifyItemInTable({
      finishItem: '1565-Z',
      cops: 1,
      grossWt: 36,
      tareWt: 3.25,
      netWt: 32.75
    });

    // 7) Go back and check that record is visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyRecordInList('1565-Z', 32.75);
  });

  test('OP-E2E-023: Create one Opening Packing transaction containing 50 entries with varied integer and decimal weights, then verify the Net Wt calculation for every entry before and after saving.', async ({ openingPackingPage }) => {
    test.setTimeout(300000); // 5 minutes timeout for 50 entries

    await openingPackingPage.goto();
    await openingPackingPage.clickAddOpeningPacking();

    // 1) Enter or select all required header fields
    await openingPackingPage.enterCompany('Meera Metyarns Private Limited');
    await openingPackingPage.enterChecker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterPacker('GAJANAN SANTOSH NIWALKAR');
    await openingPackingPage.enterFinishWarehouse('Finished Goods - MMPL');
    await openingPackingPage.enterFinishItem('1565-Z');

    const generatedRecords: { batchNo: string, finishItem: string, netWt: number }[] = [];

    // Create 50 entries with mixed int and float values
    for (let i = 0; i < 50; i++) {
      const isDecimal = i % 2 !== 0;
      // Provide some variance to avoid overlapping exactly
      const grossWt = isDecimal ? 20.5 + (i * 0.1) : 20 + i;
      const tareWt = isDecimal ? 2.25 : 2;
      // Using Math.round to avoid float precision issues like 18.250000000000004
      const expectedNetWt = Math.round((grossWt - tareWt) * 1000) / 1000;

      await openingPackingPage.enterCops(1);
      await openingPackingPage.enterGrossWt(grossWt);
      await openingPackingPage.enterTareWt(tareWt);

      // Instantly add item using keyboard event (Enter) without waiting for calculation in input field
      await openingPackingPage.pressAddItem();
      await openingPackingPage.closePrintViewTab();

      // Give the server and UI extra time to settle and avoid rate limiting
      await openingPackingPage.page.waitForTimeout(1500);

      // Verify it was correctly recorded into the child table
      await openingPackingPage.verifyItemInTable({
        finishItem: '1565-Z',
        cops: 1,
        grossWt: grossWt,
        tareWt: tareWt,
        netWt: expectedNetWt
      });

      generatedRecords.push({
        batchNo: openingPackingPage.lastExpectedBatchNo,
        finishItem: '1565-Z',
        netWt: expectedNetWt
      });
    }

    // Go back and check that records are visible in the list view
    await openingPackingPage.goto();
    await openingPackingPage.verifyMultipleRecordsInList(generatedRecords.reverse());
  });

});
