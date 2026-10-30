/**
 * @fileoverview Page Object Model for the RI Dispatch Planning module.
 * Encapsulates list view, form entry, customer delivery schedule retrieval, child grid, and submission.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import type { PageMetadata } from '../types';
import type { RIDispatchPlanningFormData } from '../data/ri-dispatch-planning.data';

interface FrappeDeliveryPlanDetailRow {
  name?: string;
  order_no?: string;
  customer?: string;
  item?: string;
  schedule_date?: string;
  order_qty?: number;
  schedule_qty?: number;
  pending_disp_qty?: number;
  disp_qty?: number;
  shipping_address?: string;
}

interface FrappeDoc {
  name?: string;
  docstatus?: number;
  naming_series?: string;
  company?: string;
  customer?: string;
  warehouse?: string;
  from_date?: string;
  to_date?: string;
  delivery_plan_date?: string;
  ri_delivery_plan_detail?: FrappeDeliveryPlanDetailRow[];
}

interface FrappeWindow {
  cur_frm?: {
    doc?: FrappeDoc;
    refresh_field?: (fieldname: string) => void;
    save?: () => Promise<unknown>;
  };
}

/**
 * Page Object encapsulating interactions with RI Dispatch Planning.
 */
export class RIDispatchPlanningPage extends BasePage {
  readonly pageMetadata: PageMetadata = {
    title: 'RI Dispatch Planning',
    urlPattern: /\/desk\/ri-dispatch-planning/,
    heading: 'RI Dispatch Planning',
  };

  // ─── List View Locators ───────────────────────────────────────────────
  readonly addRIDispatchPlanningButton: Locator;
  readonly resultContainer: Locator;

  // ─── Form View Header Locators ─────────────────────────────────────────
  readonly seriesSelect: Locator;
  readonly companyInput: Locator;
  readonly deliveryPlanDateInput: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly customerInput: Locator;
  readonly itemCodeInput: Locator;
  readonly warehouseInput: Locator;
  readonly okButton: Locator;

  // ─── Child Table Locators ──────────────────────────────────────────────
  readonly detailGrid: Locator;
  readonly detailGridRows: Locator;

  // ─── Actions & Dialog Locators ──────────────────────────────────────────
  readonly saveButton: Locator;
  readonly submitButton: Locator;
  readonly confirmModal: Locator;
  readonly confirmYesButton: Locator;

  constructor(page: Page) {
    super(page);

    // List view
    this.addRIDispatchPlanningButton = page.locator(
      "//button[@data-label='Add RI Dispatch Planning'] | //button[contains(., 'Add RI Dispatch Planning')]",
    );
    this.resultContainer = page
      .locator('.frappe-list .result-container, .result-container, .result')
      .first();

    // Form Header
    this.seriesSelect = page.locator("//select[@data-fieldname='naming_series']");
    this.companyInput = page.locator("//input[@data-fieldname='company']").first();
    this.deliveryPlanDateInput = page
      .locator("//input[@data-fieldname='delivery_plan_date']")
      .first();
    this.fromDateInput = page.locator("//input[@data-fieldname='from_date']").first();
    this.toDateInput = page.locator("//input[@data-fieldname='to_date']").first();
    this.customerInput = page.locator("//input[@data-fieldname='customer']").first();
    this.itemCodeInput = page.locator("//input[@data-fieldname='item_code']").first();
    this.warehouseInput = page.locator("//input[@data-fieldname='warehouse']").first();
    this.okButton = page
      .locator("//button[@data-fieldname='ok'] | //button[normalize-space()='Ok']")
      .first();

    // Child Table (RI Delivery Plan Detail)
    this.detailGrid = page.locator("//div[@data-fieldname='ri_delivery_plan_detail']");
    this.detailGridRows = page.locator(
      "[data-fieldname='ri_delivery_plan_detail'] .grid-body .grid-row:not(.grid-row-header)",
    );

    // Actions
    this.saveButton = page.locator("//button[@data-label='Save']");
    this.submitButton = page.locator("//button[@data-label='Submit']");
    this.confirmModal = page
      .locator(".modal.show, .modal:visible, div[role='dialog']:visible")
      .first();
    this.confirmYesButton = page
      .locator(
        ".modal.show button:has-text('Yes'), .modal:visible button:has-text('Yes'), button:has-text('Yes')",
      )
      .first();
  }

  // ─── Navigation ───────────────────────────────────────────────────────

  /**
   * Navigates to the RI Dispatch Planning list view.
   */
  async goto(): Promise<void> {
    await this.page.goto('/desk/ri-dispatch-planning', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Clicks '+ Add RI Dispatch Planning' button to navigate to the new planning form.
   */
  async clickAddRIDispatchPlanning(): Promise<void> {
    await expect(this.addRIDispatchPlanningButton).toBeVisible({ timeout: 10000 });
    await this.addRIDispatchPlanningButton.click();
    await this.page.waitForURL(/\/desk\/ri-dispatch-planning\/new-ri-dispatch-planning/, {
      timeout: 15000,
    });
  }

  // ─── Form Inputs ───────────────────────────────────────────────────────

  /**
   * Asserts default values loaded on the fresh RI Dispatch Planning form.
   */
  async expectDefaultFormValues(): Promise<void> {
    await expect(this.seriesSelect).toHaveValue(/DO\/\.#/);
    await expect(this.companyInput).toHaveValue(/Meera Metyarns/i);
    await expect(this.warehouseInput).toHaveValue(/Finished Goods - MMPL/i);
  }

  /**
   * Selects customer using Frappe autocomplete.
   *
   * @param customerName Full or partial customer name (e.g. 'Amanta Fabrics LLP').
   */
  async selectCustomer(customerName: string): Promise<void> {
    await expect(this.customerInput).toBeVisible({ timeout: 10000 });
    await this.customerInput.click();
    await this.customerInput.fill(customerName);

    // Awesomplete dropdown confirmation
    const autocompleteOption = this.page
      .locator(`//ul[contains(@class, 'awesomplete')]//li[contains(., '${customerName}')]`)
      .first();

    if (await autocompleteOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await autocompleteOption.click();
    } else {
      await this.page.keyboard.press('Tab');
    }

    // Dismiss any dangling awesomplete dropdown overlay
    await this.page.keyboard.press('Escape').catch(() => { });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Selects item code filter (optional).
   */
  async selectItemCode(itemCode: string): Promise<void> {
    await expect(this.itemCodeInput).toBeVisible({ timeout: 5000 });
    await this.itemCodeInput.click();
    await this.itemCodeInput.fill(itemCode);

    const autocompleteOption = this.page
      .locator(`//ul[contains(@class, 'awesomplete')]//li[contains(., '${itemCode}')]`)
      .first();

    if (await autocompleteOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await autocompleteOption.click();
    } else {
      await this.page.keyboard.press('Tab');
    }

    await this.page.keyboard.press('Escape').catch(() => { });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Fills the header fields of the RI Dispatch Planning form.
   */
  async fillDispatchPlanningForm(formData: RIDispatchPlanningFormData): Promise<void> {
    await this.selectCustomer(formData.customer);
    if (formData.fromDate) {
      await this.setFromDate(formData.fromDate);
    }
    if (formData.toDate) {
      await this.setToDate(formData.toDate);
    }
    if (formData.itemCode) {
      await this.selectItemCode(formData.itemCode);
    }
  }

  /**
   * Sets From Date on the form.
   */
  async setFromDate(dateStr: string): Promise<void> {
    await this.page.evaluate((d) => {
      const fw = window as unknown as FrappeWindow;
      if (fw.cur_frm?.doc) {
        fw.cur_frm.doc.from_date = d;
        if (typeof fw.cur_frm.refresh_field === 'function') {
          fw.cur_frm.refresh_field('from_date');
        }
      }
    }, dateStr);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Sets To Date on the form.
   */
  async setToDate(dateStr: string): Promise<void> {
    await this.page.evaluate((d) => {
      const fw = window as unknown as FrappeWindow;
      if (fw.cur_frm?.doc) {
        fw.cur_frm.doc.to_date = d;
        if (typeof fw.cur_frm.refresh_field === 'function') {
          fw.cur_frm.refresh_field('to_date');
        }
      }
    }, dateStr);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Clicks 'Ok' button to trigger retrieval of pending Sales Order delivery schedules.
   */
  async clickOk(): Promise<void> {
    // Close any awesomplete dropdown or datepicker that might overlap
    await this.page.keyboard.press('Escape').catch(() => { });
    await expect(this.okButton).toBeVisible({ timeout: 10000 });
    await this.okButton.click({ force: true });

    // Await table population
    await expect
      .poll(
        async () => {
          return await this.detailGridRows.count();
        },
        {
          message: 'Expected child table rows to populate after clicking Ok',
          timeout: 15000,
        },
      )
      .toBeGreaterThan(0);
  }

  // ─── Child Table Verifications & Interactions ──────────────────────────

  /**
   * Retrieves the count of rows currently in the child table.
   */
  async getDetailRowsCount(): Promise<number> {
    return await this.detailGridRows.count();
  }

  /**
   * Verifies that the child table contains a line item corresponding to the given Sales Order ID.
   *
   * @param orderId Generated Sales Order ID (e.g. 'O/2587').
   */
  async verifyOrderInDetailTable(orderId: string): Promise<void> {
    // 1. First check via client-side Frappe doc model (authoritative)
    await expect
      .poll(
        async () => {
          return await this.page
            .evaluate((targetOrderId: string) => {
              const fw = window as unknown as FrappeWindow;
              const rows = fw.cur_frm?.doc?.ri_delivery_plan_detail || [];
              return rows.some(
                (r) =>
                  r.order_no === targetOrderId ||
                  (r.order_no && r.order_no.includes(targetOrderId)),
              );
            }, orderId)
            .catch(() => false);
        },
        {
          message: `Expected Sales Order ${orderId} to appear in RI Delivery Plan Detail`,
          timeout: 15000,
        },
      )
      .toBe(true);

    // 2. Scroll the target row into view, then assert visibility
    const targetRow = this.detailGridRows.filter({ hasText: orderId }).first();

    // Scroll into view first so Frappe renders the row visibly
    await targetRow.scrollIntoViewIfNeeded();

    await expect(targetRow).toBeVisible({ timeout: 5000 });
  }


  /**
   * Sets the required Shipping Address on all rows in the child table.
   * Frappe requires 'Shipping Address' in every row of RI Delivery Plan Detail before saving.
   *
   * @param shippingAddress The valid shipping address (e.g. 'Amanta Fabrics LLP-2-Billing').
   */
  async setShippingAddressForAllRows(
    shippingAddress = 'Amanta Fabrics LLP-2-Billing',
  ): Promise<void> {
    // Ensure all rows have shipping address via runtime model and grid refresh
    await this.page.evaluate((address: string) => {
      const fw = window as unknown as FrappeWindow;
      const rows = fw.cur_frm?.doc?.ri_delivery_plan_detail || [];
      rows.forEach((r) => {
        if (!r.shipping_address) {
          r.shipping_address = address;
        }
      });
      if (typeof fw.cur_frm?.refresh_field === 'function') {
        fw.cur_frm.refresh_field('ri_delivery_plan_detail');
      }
    }, shippingAddress);

    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Sets the required Shipping Address specifically for a row matching the given Sales Order ID.
   *
   * @param orderId Sales Order ID.
   * @param shippingAddress Shipping address string.
   */
  async setShippingAddressForOrder(
    orderId: string,
    shippingAddress = 'Amanta Fabrics LLP-2-Billing',
  ): Promise<void> {
    await this.page.evaluate(
      ({ id, address }: { id: string; address: string }) => {
        const fw = window as unknown as FrappeWindow;
        const rows = fw.cur_frm?.doc?.ri_delivery_plan_detail || [];
        rows.forEach((r) => {
          if (r.order_no === id || !r.shipping_address) {
            r.shipping_address = address;
          }
        });
        if (typeof fw.cur_frm?.refresh_field === 'function') {
          fw.cur_frm.refresh_field('ri_delivery_plan_detail');
        }
      },
      { id: orderId, address: shippingAddress },
    );

    await this.page.waitForLoadState('domcontentloaded');
  }

  // ─── Actions & Lifecycle Transitions ───────────────────────────────────

  /**
   * Clicks Save button to commit form as Draft (docstatus 0).
   * Returns generated document ID (e.g. 'DO/2').
   */
  async saveDraft(): Promise<string> {
    await expect(this.saveButton).toBeVisible({ timeout: 10000 });
    await this.saveButton.click();

    // Wait for save to complete and URL to navigate from new-ri-dispatch-planning to the created ID
    await expect(this.page).not.toHaveURL(/\/new-ri-dispatch-planning/, { timeout: 15000 });

    // Extract ID from current URL (e.g. /desk/ri-dispatch-planning/DO%2F2)
    const currentUrl = decodeURIComponent(this.page.url());
    const match = currentUrl.match(/ri-dispatch-planning\/(DO\/\d+|[A-Za-z0-9_-]+)/);
    const planId = match ? match[1] || '' : '';
    return planId;
  }

  /**
   * Submits the saved Draft RI Dispatch Planning (docstatus 1).
   * Confirms Frappe submission dialog and asserts docstatus transitions to 1.
   */
  async submitDispatchPlan(): Promise<void> {
    await expect(this.submitButton).toBeVisible({ timeout: 10000 });
    await this.submitButton.click();

    // Confirm standard Frappe modal
    if (await this.confirmYesButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.confirmYesButton.click();
    } else if (await this.confirmModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.confirmModal
        .locator("button:has-text('Yes')")
        .first()
        .click()
        .catch(() => { });
    }

    // Await docstatus transition to 1 (Submitted)
    await expect
      .poll(
        async () => {
          return await this.page
            .evaluate(() => {
              const fw = window as unknown as FrappeWindow;
              return fw.cur_frm?.doc?.docstatus ?? 0;
            })
            .catch(() => 0);
        },
        {
          message: 'Expected RI Dispatch Planning document status to transition to 1 (Submitted)',
          timeout: 15000,
        },
      )
      .toBe(1);
  }

  /**
   * Complete workflow helper to create, populate with sales order, and submit an RI Dispatch Planning.
   */
  async createAndSubmitDispatchPlan(options: {
    customer: string;
    orderId: string;
    shippingAddress?: string;
  }): Promise<string> {
    await this.goto();
    await this.clickAddRIDispatchPlanning();
    await this.expectDefaultFormValues();
    await this.selectCustomer(options.customer);
    await this.clickOk();
    await this.verifyOrderInDetailTable(options.orderId);
    await this.setShippingAddressForAllRows(options.shippingAddress);
    const planId = await this.saveDraft();
    expect(planId).toMatch(/^DO\/\d+/);
    await this.submitDispatchPlan();
    await this.verifyPlanInList(planId, 'Submitted');
    return planId;
  }

  /**
   * Verifies that the dispatch plan record appears in the list view with expected attributes.
   */
  async verifyPlanInList(planId: string, expectedStatus = 'Submitted'): Promise<void> {
    await this.goto();
    await expect(this.resultContainer).toBeVisible({ timeout: 15000 });

    // Locate row containing the plan ID
    const row = this.page
      .locator(`//div[contains(@class, 'list-row-container') and contains(., '${planId}')]`)
      .first();

    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row).toContainText(expectedStatus);
  }
}
