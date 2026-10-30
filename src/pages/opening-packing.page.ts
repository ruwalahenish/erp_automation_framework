/**
 * @fileoverview Opening Packing Page Object encapsulating list view and form page interactions.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import type { PageMetadata } from '../types';

/**
 * Page Object for the Opening Packing feature.
 */
export class OpeningPackingPage extends BasePage {
  readonly pageMetadata: PageMetadata = {
    title: 'Opening Packing',
    urlPattern: /\/desk\/opening-packing/,
    heading: 'Opening Packing',
  };

  // ─── List View Locators ───────────────────────────────────────────────
  readonly addOpeningPackingButton: Locator;

  // ─── Form View Locators ───────────────────────────────────────────────
  readonly seriesInput: Locator;
  readonly companyInput: Locator;
  readonly dateInput: Locator;
  readonly postingTimeInput: Locator;
  readonly checkerInput: Locator;
  readonly packerInput: Locator;
  readonly finishWarehouseInput: Locator;
  readonly tubeColorInput: Locator;
  readonly finishItemInput: Locator;
  readonly copsInput: Locator;
  readonly grossWtInput: Locator;
  readonly tareWtInput: Locator;
  readonly netWtInput: Locator;
  readonly addItemButton: Locator;
  readonly errorModal: Locator;
  readonly errorMsg: Locator;

  constructor(page: Page) {
    super(page);

    // List view locators
    this.addOpeningPackingButton = page.locator("//button[@data-label='Add Opening Packing']")

    // Form view locators
    this.seriesInput = page.locator("//select[@data-fieldname='naming_series']");
    this.companyInput = page.locator("//input[@data-fieldname='company']");
    this.dateInput = page.locator("//input[@data-fieldname='date']");
    this.postingTimeInput = page.locator("//input[@data-fieldname='posting_time']");
    this.checkerInput = page.locator("//input[@data-fieldname='checker']");
    this.packerInput = page.locator("//input[@data-fieldname='packer']");
    this.finishWarehouseInput = page.locator("//input[@data-fieldname='finish_warehouse']");
    this.tubeColorInput = page.locator("//input[@data-fieldname='tube_color']");
    this.finishItemInput = page.locator("//input[@data-fieldname='finish_item']");
    this.copsInput = page.locator("//input[@data-fieldname='cops']");
    this.grossWtInput = page.locator("//input[@data-fieldname='gross_wt']");
    this.tareWtInput = page.locator("//input[@data-fieldname='tare_wt']");
    this.netWtInput = page.locator("//div[@data-fieldname='net_wt']//div[@class='control-value like-disabled-input']");
    this.addItemButton = page.locator("//button[@data-fieldname='add']");
    this.errorModal = page.locator("//div[@class='modal-content']");
    this.errorMsg = page.locator("//div[@class='msgprint']");
  }

  // ─── Navigation ───────────────────────────────────────────────────────

  /**
   * Navigates directly to the Opening Packing list view page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/desk/opening-packing', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Clicks on '+ Add Opening Packing' button to navigate to new form.
   */
  async clickAddOpeningPacking(): Promise<void> {
    await this.addOpeningPackingButton.click();
  }

  // ─── Form Filling Methods ───────────────────────────────────────────────

  /**
   * Enters the gross weight value.
   * NOTE: No Tab here — the Tab belongs to enterTareWt which must blur this
   * field via click() to trigger Frappe's Net Wt calculation.
   */
  async enterGrossWt(grossWt: number): Promise<void> {
    await this.grossWtInput.fill(grossWt.toString());
    await this.grossWtInput.blur();
  }

  /**
   * Enters the tare weight value.
   * fill() focuses the field, blurring Gross Wt so Frappe fires its change
   * event and calculates Net Wt. Tab then moves focus to the Add button.
   */
  async enterTareWt(tareWt: number): Promise<void> {
    await this.tareWtInput.fill(tareWt.toString());
    await this.page.keyboard.press('Tab');
  }

  async selectSeries(series: string): Promise<void> {
    await this.seriesInput.selectOption({ label: series });
  }

  async enterCompany(company: string): Promise<void> {
    await this.companyInput.fill(company);
  }

  async enterChecker(checker: string): Promise<void> {
    await this.checkerInput.fill(checker);
    await this.page.keyboard.press('Tab');
  }

  async enterPacker(packer: string): Promise<void> {
    await this.packerInput.fill(packer);
    await this.page.keyboard.press('Tab');
  }

  async enterFinishWarehouse(warehouse: string): Promise<void> {
    await this.finishWarehouseInput.fill(warehouse);
    await this.page.keyboard.press('Tab');
  }

  async enterTubeColor(color: string): Promise<void> {
    await this.tubeColorInput.fill(color);
    await this.page.keyboard.press('Tab');
  }

  async enterFinishItem(item: string): Promise<void> {
    await this.finishItemInput.fill(item);
    await this.page.keyboard.press('Tab');
  }

  async enterCops(cops: number): Promise<void> {
    await this.copsInput.fill(cops.toString());
    await this.page.keyboard.press('Tab');
  }

  async clickAddItem(): Promise<void> {
    await this.addItemButton.click();
  }

  /**
   * Adds the item using a keyboard event (Enter key) instead of a mouse click.
   */
  async pressAddItem(): Promise<void> {
    await this.addItemButton.press('Enter');
  }

  async closePrintViewTab(): Promise<void> {
    // Poll for up to 15 seconds until a new page is found
    for (let i = 0; i < 30; i++) {
      const pages = this.page.context().pages();
      if (pages.length > 1) {
        const newPage = pages[pages.length - 1];
        try {
          await newPage?.close();
        } catch (e) {
          // ignore error if already closed
        }
        break;
      }
      await this.page.waitForTimeout(500);
    }

    // Ensure focus is back on the main page
    await this.page.bringToFront();

    // Dismiss any Frappe msgprint/dialog modal that may have opened during save.
    // Such modals block pointer events for subsequent iterations of a form loop.
    try {
      const modal = this.page.locator('div.modal.show');
      if (await modal.isVisible({ timeout: 2000 })) {
        await this.page.keyboard.press('Escape');
        await modal.waitFor({ state: 'hidden', timeout: 3000 });
      }
    } catch {
      // No modal present — safe to continue
    }

    // Give the UI a small moment to update the inner table
    await this.page.waitForTimeout(1000);
  }

  // ─── Assertions ──────────────────────────────────────────────────────

  /**
   * Asserts that the list view page elements are visible.
   */
  async expectListViewVisible(): Promise<void> {
    await expect(this.addOpeningPackingButton).toBeVisible();
    await this.clickAddOpeningPacking();
    await expect(this.seriesInput).toBeVisible();
    await expect(this.companyInput).toBeVisible();
    await expect(this.dateInput).toBeVisible();
    await expect(this.postingTimeInput).toBeVisible();
    await expect(this.checkerInput).toBeVisible();
    await expect(this.packerInput).toBeVisible();
    await expect(this.finishWarehouseInput).toBeVisible();
    await expect(this.tubeColorInput).toBeVisible();
    await expect(this.finishItemInput).toBeVisible();
    await expect(this.copsInput).toBeVisible();
    await expect(this.grossWtInput).toBeVisible();
    await expect(this.tareWtInput).toBeVisible();
    await expect(this.netWtInput).toBeVisible();
    await expect(this.addItemButton).toBeVisible();
    await expect(this.seriesInput).toBeVisible();
  }

  /**
   * Checks if the calculated Net Wt matches the expected value.
   * Uses expect.poll() to handle Frappe's async server-side/client-side
   * Net Wt recalculation (Gross Wt - Tare Wt) after field input.
   */
  async expectNetWt(expectedNetWt: number | string): Promise<void> {
    const expectedNum = typeof expectedNetWt === 'number' ? expectedNetWt : parseFloat(expectedNetWt);
    await expect
      .poll(
        async () => {
          const raw = await this.netWtInput.textContent();
          return parseFloat(raw?.trim() || '0');
        },
        { timeout: 10_000, message: `Net Wt did not update to ${expectedNum} within timeout` },
      )
      .toBeCloseTo(expectedNum, 3);
  }

  lastExpectedBatchNo: string = '';

  /**
   * Verifies that the added item is correctly displayed in the table
   */
  async verifyItemInTable(itemData: { batchNo?: string, finishItem: string, cops: number, grossWt: number, tareWt: number, netWt: number }): Promise<void> {
    console.log("[DEBUG] verifyItemInTable called with itemData:", itemData);
    // Identify First row of the table
    const firstRow = this.page.locator('//tbody/tr[1]');

    // From the first row identify the all cells values and compare with expected values

    if (itemData.batchNo) {
      console.log("[DEBUG] verifyItemInTable: Using provided batchNo:", itemData.batchNo);
      this.lastExpectedBatchNo = itemData.batchNo;
      await expect(firstRow.locator('//td[1]')).toHaveText(itemData.batchNo);
    } else {
      console.log("[DEBUG] verifyItemInTable: No batchNo provided, starting dynamic check");
      // Dynamic check: get 2nd row batch no, increment, and expect it in 1st row
      const secondRow = this.page.locator('//tbody/tr[2]');
      if (await secondRow.count() > 0) {
        const previousBatchText = await secondRow.locator('//td[1]').textContent();
        console.log("[DEBUG] verifyItemInTable: previousBatchText from 2nd row:", previousBatchText);
        if (previousBatchText) {
          const match = previousBatchText.trim().match(/^(.*?M-)(\d+)$/);
          if (match) {
            const prefix = match[1] as string;
            const numStr = match[2] as string;
            const incrementedNum = (parseInt(numStr, 10) + 1).toString().padStart(numStr.length, '0');
            const expectedBatchNo = prefix + incrementedNum;
            this.lastExpectedBatchNo = expectedBatchNo;
            console.log(`[DEBUG] verifyItemInTable: computed expectedBatchNo: ${expectedBatchNo}`);
            await expect(firstRow.locator('//td[1]')).toHaveText(expectedBatchNo);
          } else {
            console.log("[DEBUG] verifyItemInTable: Regex did not match previousBatchText");
            this.lastExpectedBatchNo = (await firstRow.locator('//td[1]').textContent())?.trim() || '';
          }
        }
      } else {
        console.log("[DEBUG] verifyItemInTable: second row not found");
        this.lastExpectedBatchNo = (await firstRow.locator('//td[1]').textContent())?.trim() || '';
      }
    }
    //Item Name
    await expect(firstRow.locator('//td[2]')).toHaveText(itemData.finishItem);
    //COPS
    await expect(firstRow.locator('//td[3]')).toHaveText(itemData.cops.toString());
    //GrossWt
    await expect(firstRow.locator('//td[4]')).toHaveText(itemData.grossWt.toString(), { timeout: 30000 });
    //TareWt
    await expect(firstRow.locator('//td[5]')).toHaveText(itemData.tareWt.toString());
    //NetWt
    await expect(firstRow.locator('//td[6]')).toHaveText(itemData.netWt.toString());
  }

  /**
   * Verifies that the record is visible in the list view. We match batch No and net wt  which user enter in the form.
   */
  async verifyRecordInList(finishItem: string, netWt: number): Promise<void> {

    // 1. Wait for the list view of the opening packing to be populated
    const container = this.page.locator('//div[@class=\'result-container\']');
    await expect(container).toBeVisible();
    await expect(container).toHaveCount(1, { timeout: 15000 }); // Expect at least one row, adjust timeout if needed

    // 2. Get the first row (assuming single entry)
    const firstRow = container.locator('(//div[@class=\'list-row-container\'])[2]');

    // 3. Get the batch number from the first row and compare it with the expected one
    const batchNoCell = firstRow.locator('//div[@data-fieldname=\'batch_no\']');
    const expectedBatchNo = this.lastExpectedBatchNo;

    console.log(`[DEBUG] verifyRecordInList: expecting batchNo "${expectedBatchNo}"`);

    // 4. Verify the batch number, item name, and net weight
    await expect(batchNoCell).toHaveText(expectedBatchNo, { timeout: 10000 });
    await expect(firstRow.locator('//div[@data-fieldname=\'finish_item\']')).toHaveText(finishItem);

    // Handle Frappe's decimal formatting in list views (pads floats to 3 decimals)
    const expectedNetWt = Number.isInteger(netWt) ? netWt.toString() : netWt.toFixed(3);
    await expect(firstRow.locator('//div[@data-fieldname=\'net_wt\']')).toHaveText(expectedNetWt);
  }
  async verifyMultipleRecordsInList(expectedRecords: { batchNo: string, finishItem: string, netWt: number }[]): Promise<void> {
    const container = this.page.locator('//div[@class=\'result-container\']');
    await expect(container).toBeVisible();

    for (let i = 0; i < expectedRecords.length; i++) {
      const record = expectedRecords[i] as { batchNo: string, finishItem: string, netWt: number };
      // list-row-container index starts from 2 for the first data row
      const row = container.locator(`(//div[@class=\'list-row-container\'])[${i + 2}]`);

      const batchNoCell = row.locator('//div[@data-fieldname=\'batch_no\']');
      await expect(batchNoCell).toHaveText(record.batchNo, { timeout: 10000 });
      await expect(row.locator('//div[@data-fieldname=\'finish_item\']')).toHaveText(record.finishItem);

      const expectedNetWt = Number.isInteger(record.netWt) ? record.netWt.toString() : record.netWt.toFixed(3);
      await expect(row.locator('//div[@data-fieldname=\'net_wt\']')).toHaveText(expectedNetWt);
    }
  }
}
