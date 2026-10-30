/**
 * @fileoverview Sales Order Page Object encapsulating list view, form entry, child grid, and submission.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import type { PageMetadata } from '../types';
import type { SalesOrderFormData, SalesOrderItemData } from '../data/sales-order.data';

interface FrappeItemDoc {
  item_code?: string;
  qty?: number | string;
  rate?: number | string;
  amount?: number | string;
}

interface FrappeDoc {
  docstatus?: number;
  items?: FrappeItemDoc[];
  total_qty?: number | string;
  net_total?: number | string;
  base_net_total?: number | string;
}

interface FrappeWindow {
  cur_frm?: {
    doc?: FrappeDoc;
  };
}

/**
 * Page Object for the Sales Order feature.
 */
export class SalesOrderPage extends BasePage {
  readonly pageMetadata: PageMetadata = {
    title: 'Sales Order',
    urlPattern: /\/desk\/sales-order/,
    heading: 'Sales Order',
  };

  // ─── List View Locators ───────────────────────────────────────────────
  readonly addSalesOrderButton: Locator;
  readonly resultContainer: Locator;

  // ─── Form View Header Locators ─────────────────────────────────────────
  readonly seriesSelect: Locator;
  readonly customerInput: Locator;
  readonly dateInput: Locator;
  readonly startDeliveryDateInput: Locator;
  readonly isSubcontractedCheckbox: Locator;
  readonly sourceWarehouseInput: Locator;

  // ─── Items Child Table Locators ────────────────────────────────────────
  readonly itemsGrid: Locator;
  readonly addRowButton: Locator;
  readonly gridRows: Locator;

  // ─── Financial Totals Locators ─────────────────────────────────────────
  readonly totalQtyDisplay: Locator;
  readonly totalAmountDisplay: Locator;
  readonly netTotalDisplay: Locator;

  // ─── Action & Dialog Locators ──────────────────────────────────────────
  readonly saveButton: Locator;
  readonly submitButton: Locator;
  readonly confirmModal: Locator;
  readonly confirmYesButton: Locator;
  readonly errorModal: Locator;
  readonly errorMsg: Locator;

  // ─── Delivery Schedule Modal Locators ──────────────────────────────────
  readonly deliveryScheduleModal: Locator;
  readonly firstDeliveryDateInput: Locator;
  readonly perDayQtyInput: Locator;
  readonly scheduleQtyInput: Locator;
  readonly noOfDeliveriesInput: Locator;
  readonly getDeliveryScheduleButton: Locator;
  readonly scheduleGridRows: Locator;
  readonly addScheduleButton: Locator;

  constructor(page: Page) {
    super(page);

    // List view
    this.addSalesOrderButton = page.locator("//button[@data-label='Add Sales Order']");
    this.resultContainer = page
      .locator('.frappe-list .result-container, .result-container, .result')
      .first();

    // Form header
    this.seriesSelect = page.locator("//select[@data-fieldname='naming_series']");
    this.customerInput = page.locator("(//input[@data-fieldname='customer'])[2]");
    this.dateInput = page.locator(
      "//div[@data-fieldtype='Date']//div[@class='control-value like-disabled-input bold']",
    );
    this.startDeliveryDateInput = page.locator("//input[@data-fieldname='delivery_date']").first();
    this.isSubcontractedCheckbox = page.locator("//input[@data-fieldname='is_subcontracted']");
    this.sourceWarehouseInput = page.locator("//input[@data-fieldname='set_warehouse']");

    // Items grid
    this.itemsGrid = page.locator("//div[@data-fieldname='items']");
    this.addRowButton = page
      .locator(
        "//div[@data-fieldname='items']//button[contains(., 'Add row')] | //button[@data-fieldname='items_add']",
      )
      .first();
    this.gridRows = page.locator(
      "//div[@data-fieldname='items']//div[contains(@class, 'grid-row') and not(contains(@class, 'grid-row-header'))]",
    );

    // Financial totals (scoped with .first() to prevent strict mode violations)
    this.totalQtyDisplay = page
      .locator(
        ".form-page [data-fieldname='total_qty'] .control-value, .form-layout [data-fieldname='total_qty'] .control-value, [data-fieldname='total_qty'] .control-value, [data-fieldname='total_qty']",
      )
      .first();
    this.totalAmountDisplay = page
      .locator(
        ".form-page [data-fieldname='base_total'] .control-value, .form-layout [data-fieldname='base_total'] .control-value, [data-fieldname='base_total'] .control-value, [data-fieldname='base_total']",
      )
      .first();
    this.netTotalDisplay = page
      .locator(
        ".form-page [data-fieldname='base_net_total'] .control-value, .form-layout [data-fieldname='base_net_total'] .control-value, [data-fieldname='base_net_total'] .control-value, [data-fieldname='base_net_total']",
      )
      .first();

    // Actions & Modals
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
    this.errorModal = page.locator("//div[@class='modal-content']");
    this.errorMsg = page.locator("//div[@class='msgprint']");

    // Delivery Schedule Modal
    this.deliveryScheduleModal = page
      .locator(".modal.show, .modal:visible, div[role='dialog']:visible")
      .filter({ hasText: 'Delivery Schedule' })
      .first();
    this.firstDeliveryDateInput = this.deliveryScheduleModal
      .locator(
        "input[data-fieldname='first_delivery_date'], input[data-fieldname='delivery_date'], [data-fieldname*='delivery_date'] input, .frappe-control:has-text('First Delivery Date') input",
      )
      .first();
    this.perDayQtyInput = this.deliveryScheduleModal
      .locator(
        "input[data-fieldname='per_day_qty'], input[data-fieldname='daily_qty'], [data-fieldname*='per_day'] input, .frappe-control:has-text('Per Day Qty') input",
      )
      .first();
    this.scheduleQtyInput = this.deliveryScheduleModal
      .locator(
        "input[data-fieldname='qty'], [data-fieldname='total_qty'] input, .frappe-control:has-text('Qty') input:not([data-fieldname*='per_day'])",
      )
      .first();
    this.noOfDeliveriesInput = this.deliveryScheduleModal
      .locator(
        "input[data-fieldname='no_of_deliveries'], [data-fieldname*='deliveries'] input, .frappe-control:has-text('No of Deliveries') input, .frappe-control:has-text('No of Deliveries') .control-value",
      )
      .first();
    this.getDeliveryScheduleButton = this.deliveryScheduleModal
      .locator(
        "button:has-text('Get Delivery Schedule'), [data-fieldname='get_delivery_schedule'] button, button[data-fieldname='get_delivery_schedule']",
      )
      .first();
    this.scheduleGridRows = this.deliveryScheduleModal.locator(
      "[data-fieldname='delivery_schedule'] .grid-body .grid-row[data-idx], [data-fieldname='delivery_schedule'] .grid-row[data-idx], .grid-body .grid-row[data-idx], .grid-row[data-idx]",
    );
    this.addScheduleButton = this.deliveryScheduleModal
      .locator(
        "button:has-text('Add Schedule'), .modal-footer button:has-text('Add Schedule'), button[data-fieldname='add_schedule']",
      )
      .first();
  }

  // ─── Navigation ───────────────────────────────────────────────────────

  /**
   * Navigates to Sales Order list view.
   */
  async goto(): Promise<void> {
    await this.page.goto('/desk/sales-order', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Clicks '+ Add Sales Order' button to initiate a new sales order form.
   */
  async clickAddSalesOrder(): Promise<void> {
    await this.addSalesOrderButton.click();
    await this.page.waitForURL(/\/desk\/sales-order\/new-sales-order/, { timeout: 15000 });
  }

  // ─── Header Form Interaction ──────────────────────────────────────────

  /**
   * Selects customer from Awesomplete autocomplete dropdown.
   */
  async selectCustomer(customerName: string): Promise<void> {
    await this.customerInput.click();
    await this.customerInput.fill(customerName);
    // In Frappe, wait for autocomplete list item or confirm via Tab/Enter
    const autocompleteOption = this.page
      .locator(`//ul[contains(@class, 'awesomplete')]//li[contains(., '${customerName}')]`)
      .first();
    if (await autocompleteOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await autocompleteOption.click();
    } else {
      await this.page.keyboard.press('Tab');
    }
  }

  /**
   * Enters the header transaction date (format: DD-MM-YYYY).
   */
  async enterDate(dateStr: string): Promise<void> {
    await this.dateInput.fill(dateStr);
    await this.page.keyboard.press('Tab');
  }

  /**
   * Selects today's date from the datepicker for a given input locator.
   */
  async selectTodayDate(inputLocator: Locator): Promise<void> {
    const input = inputLocator.first();
    await input.scrollIntoViewIfNeeded();
    await input.click();

    // Wait for the Frappe / air-datepicker container to appear
    const datepicker = this.page
      .locator(
        '#datepickers-container .datepicker.active, #datepickers-container .datepicker:visible, .datepicker.-active-, .datepicker.active, .datepicker:visible',
      )
      .first();

    await datepicker.waitFor({ state: 'visible', timeout: 2500 }).catch(() => {});

    // Option A: "Today" action button in the datepicker footer
    const todayBtn = datepicker
      .locator(
        "[data-action='today'], .datepicker--button[data-action='today'], .datepicker--button:has-text('Today'), span:has-text('Today'), button:has-text('Today')",
      )
      .first();

    // Option B: Active / current day cell in the datepicker grid
    const todayCell = datepicker
      .locator('.datepicker--cell.-current-, .datepicker--cell-day.-current-')
      .first();

    let dateSelected = false;

    if (await todayBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      try {
        await todayBtn.click({ timeout: 2000 });
        dateSelected = true;
      } catch {
        await todayBtn.dispatchEvent('click').catch(() => {});
        dateSelected = true;
      }
    }

    if (!dateSelected && (await todayCell.isVisible({ timeout: 1500 }).catch(() => false))) {
      try {
        await todayCell.click({ timeout: 2000 });
        dateSelected = true;
      } catch {
        await todayCell.dispatchEvent('click').catch(() => {});
        dateSelected = true;
      }
    }

    // Fallback: If neither was interactable or value remains empty, fill formatted today's date
    const val = await input.inputValue().catch(() => '');
    if (!val || !val.trim()) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const todayStr = `${dd}-${mm}-${yyyy}`;
      await input.fill(todayStr);
      await this.page.keyboard.press('Tab');
    }

    // Dismiss datepicker overlay so it does not intercept subsequent clicks
    await this.closeDatepickerIfOpen();
  }

  /**
   * Selects today's date from the currently active datepicker (e.g. after clicking a grid cell).
   */
  async selectTodayFromActiveDatepicker(contextRow?: Locator): Promise<void> {
    const datepicker = this.page
      .locator(
        '#datepickers-container .datepicker.active, #datepickers-container .datepicker:visible, .datepicker.-active-, .datepicker.active, .datepicker:visible',
      )
      .first();

    const todayBtn = datepicker
      .locator(
        "[data-action='today'], .datepicker--button[data-action='today'], .datepicker--button:has-text('Today'), span:has-text('Today'), button:has-text('Today')",
      )
      .first();

    const todayCell = datepicker
      .locator('.datepicker--cell.-current-, .datepicker--cell-day.-current-')
      .first();

    let dateSelected = false;

    if (await todayBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      try {
        await todayBtn.click({ timeout: 2000 });
        dateSelected = true;
      } catch {
        await todayBtn.dispatchEvent('click').catch(() => {});
        dateSelected = true;
      }
    }

    if (!dateSelected && (await todayCell.isVisible({ timeout: 1500 }).catch(() => false))) {
      try {
        await todayCell.click({ timeout: 2000 });
        dateSelected = true;
      } catch {
        await todayCell.dispatchEvent('click').catch(() => {});
        dateSelected = true;
      }
    }

    if (!dateSelected && contextRow) {
      const inlineInput = contextRow.locator("input[data-fieldname='delivery_date']").first();
      if (await inlineInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        await inlineInput.fill(`${dd}-${mm}-${yyyy}`);
        await inlineInput.press('Enter');
      }
    }

    await this.closeDatepickerIfOpen();
  }

  /**
   * Selects today's date for Start Delivery Date in the form header using the Frappe date picker.
   */
  async selectTodayDeliveryDate(): Promise<void> {
    await this.selectTodayDate(this.startDeliveryDateInput);
  }

  /**
   * Alias for selectTodayDeliveryDate.
   */
  async selectStartDeliveryDateToday(): Promise<void> {
    await this.selectTodayDeliveryDate();
  }

  /**
   * Enters or selects the start delivery date in the header (format: DD-MM-YYYY).
   * If dateStr is omitted, 'today', or undefined, selects today's date via the date picker.
   */
  async enterStartDeliveryDate(dateStr?: string): Promise<void> {
    if (!dateStr || dateStr.toLowerCase() === 'today') {
      await this.selectTodayDeliveryDate();
      return;
    }
    await this.startDeliveryDateInput.first().fill(dateStr);
    await this.page.keyboard.press('Tab');
    await this.closeDatepickerIfOpen();
  }

  /**
   * Dismisses any active Frappe datepicker container that could intercept mouse clicks.
   */
  async closeDatepickerIfOpen(): Promise<void> {
    const activeDatepicker = this.page
      .locator(
        '#datepickers-container .datepicker.active, #datepickers-container .datepicker:visible, .datepicker.-active-, .datepicker.active, .datepicker:visible, .datepicker--cells',
      )
      .first();
    if (await activeDatepicker.isVisible({ timeout: 500 }).catch(() => false)) {
      await this.page.keyboard.press('Escape');
      if (await activeDatepicker.isVisible({ timeout: 300 }).catch(() => false)) {
        await this.page.keyboard.press('Tab');
      }
    }
  }

  // ─── Child Table (Items Grid) Interaction ─────────────────────────────

  /**
   * Populates a line item in the items child grid.
   * Row 0 exists by default on New Sales Order; subsequent rows are added via 'Add row'.
   */
  async fillLineItem(rowIndex: number, item: SalesOrderItemData): Promise<void> {
    // If target row doesn't exist yet, click 'Add row'
    const currentRowsCount = await this.gridRows.count();
    if (rowIndex >= currentRowsCount) {
      await this.addRowButton.click();
      await expect(this.gridRows).toHaveCount(currentRowsCount + 1, { timeout: 5000 });
    }

    const targetRow = this.gridRows.nth(rowIndex);

    // Hover row and locate row edit button (.btn-open-row is Frappe's standard row open trigger)
    await targetRow.hover();
    const editButton = targetRow
      .locator(
        ".btn-open-row, [title*='Edit'], .octicon-pencil, .icon-edit, a.grid-row-open, .grid-row-open",
      )
      .first();
    const rowForm = this.page
      .locator("//div[contains(@class, 'grid-row-open')] | //div[contains(@class, 'form-in-grid')]")
      .first();

    let isFormOpen = false;
    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click();
      isFormOpen = await rowForm.isVisible({ timeout: 4000 }).catch(() => false);
    }

    if (!isFormOpen) {
      const indexEl = targetRow.locator('.row-index, span').first();
      if (await indexEl.isVisible({ timeout: 500 }).catch(() => false)) {
        await indexEl.click().catch(() => {});
      }
      if (await editButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await editButton.click();
        isFormOpen = await rowForm.isVisible({ timeout: 3000 }).catch(() => false);
      }
    }

    // Dismiss any modal that might have opened
    const dismissModalBtn = this.page
      .locator(
        ".modal.show button.btn-modal-close, .modal.show button:has-text('Close'), .modal.show .close",
      )
      .first();
    if (await dismissModalBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await dismissModalBtn.click().catch(() => {});
    }

    if (isFormOpen) {
      // ── Form-in-Grid Editing ──
      // 1. Item Code
      const itemInput = rowForm.locator("input[data-fieldname='item_code']").first();
      await itemInput.click();
      await itemInput.fill(item.itemCode);
      const autocompleteItem = this.page
        .locator(`ul.awesomplete li:has-text("${item.itemCode}")`)
        .first();
      if (await autocompleteItem.isVisible({ timeout: 2000 }).catch(() => false)) {
        await autocompleteItem.click();
      } else {
        await itemInput.press('Tab');
      }

      await this.page.waitForTimeout(500);

      // 2. Delivery Date: Select today's date BEFORE entering quantity
      const deliveryInput = rowForm.locator("input[data-fieldname='delivery_date']").first();
      if (await deliveryInput.isVisible({ timeout: 1500 }).catch(() => false)) {
        if (item.deliveryDate && item.deliveryDate.toLowerCase() !== 'today') {
          await deliveryInput.click();
          await deliveryInput.fill(item.deliveryDate);
          await deliveryInput.press('Tab');
          await this.closeDatepickerIfOpen();
        } else {
          await this.selectTodayDate(deliveryInput);
        }
      }

      // 3. Quantity: Enter quantity AFTER delivery date
      const qtyInput = rowForm.locator("input[data-fieldname='qty']").first();
      await qtyInput.click();
      await qtyInput.fill(item.qty.toString());
      await qtyInput.press('Tab');

      // 4. Rate (optional override)
      if (item.rate !== undefined) {
        const rateInput = rowForm.locator("input[data-fieldname='rate']").first();
        await rateInput.click();
        await rateInput.fill(item.rate.toString());
        await rateInput.press('Tab');
      }

      // Collapse / close row form
      const collapseBtn = rowForm
        .locator(".grid-collapse-row, button:has-text('Close'), a.grid-collapse-row, .btn-open-row")
        .first();
      if (await collapseBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await collapseBtn.click();
      }
    } else {
      // ── Inline Grid Editing Fallback ──
      // 1. Item Code Cell (scoped strictly to targetRow)
      const itemCell = targetRow.locator("[data-fieldname='item_code']").first();
      await itemCell.click();
      const inlineItemInput = targetRow.locator("input[data-fieldname='item_code']").first();
      if (await inlineItemInput.isVisible({ timeout: 1500 }).catch(() => false)) {
        await inlineItemInput.fill(item.itemCode);
        const autocompleteItem = this.page
          .locator(`ul.awesomplete li:has-text("${item.itemCode}")`)
          .first();
        if (await autocompleteItem.isVisible({ timeout: 2000 }).catch(() => false)) {
          await autocompleteItem.click();
        } else {
          await inlineItemInput.press('Enter');
        }
      } else {
        await this.page.keyboard.type(item.itemCode);
        await this.page.keyboard.press('Enter');
      }

      await this.page.waitForTimeout(1000);

      // 2. Delivery Date: Select today's date BEFORE entering quantity
      const deliveryCell = targetRow.locator("[data-fieldname='delivery_date']").first();
      await deliveryCell.scrollIntoViewIfNeeded();
      await deliveryCell.click();
      const inlineDeliveryInput = targetRow
        .locator("input[data-fieldname='delivery_date']")
        .first();
      if (await inlineDeliveryInput.isVisible({ timeout: 1500 }).catch(() => false)) {
        if (item.deliveryDate && item.deliveryDate.toLowerCase() !== 'today') {
          await inlineDeliveryInput.fill(item.deliveryDate);
          await inlineDeliveryInput.press('Enter');
          await this.closeDatepickerIfOpen();
        } else {
          await this.selectTodayDate(inlineDeliveryInput);
        }
      } else {
        await this.selectTodayFromActiveDatepicker(targetRow);
      }

      // Ensure datepicker overlay is closed before interacting with Quantity
      await this.closeDatepickerIfOpen();
      await this.page.waitForTimeout(300);

      // 3. Quantity Cell: Enter quantity AFTER delivery date
      const qtyCell = targetRow.locator("[data-fieldname='qty']").first();
      await qtyCell.scrollIntoViewIfNeeded();
      await qtyCell.click();
      const inlineQtyInput = targetRow.locator("input[data-fieldname='qty']").first();
      if (!(await inlineQtyInput.isVisible({ timeout: 1000 }).catch(() => false))) {
        await qtyCell.dblclick().catch(() => {});
      }
      if (await inlineQtyInput.isVisible({ timeout: 1500 }).catch(() => false)) {
        await inlineQtyInput.click();
        await inlineQtyInput.fill(item.qty.toString());
        await inlineQtyInput.press('Enter');
        await this.page.keyboard.press('Tab');
      } else {
        await qtyCell.click();
        await this.page.keyboard.type(item.qty.toString());
        await this.page.keyboard.press('Enter');
        await this.page.keyboard.press('Tab');
      }

      // Close datepicker if open
      await this.closeDatepickerIfOpen();

      // Ensure model synchronization for quantity
      await this.page
        .evaluate(
          async ({ idx, qty }) => {
            const fw = window as unknown as any;
            if (fw.cur_frm?.doc?.items?.[idx]) {
              const row = fw.cur_frm.doc.items[idx];
              if (Number(row.qty) !== qty) {
                await fw.frappe.model.set_value(row.doctype, row.name, 'qty', qty);
              }
              if (fw.cur_frm.cscript && typeof fw.cur_frm.cscript.calculate_taxes_and_totals === 'function') {
                fw.cur_frm.cscript.calculate_taxes_and_totals();
              }
              fw.cur_frm.refresh_field('items');
              fw.cur_frm.refresh_field('total_qty');
              fw.cur_frm.refresh_field('net_total');
            }
          },
          { idx: rowIndex, qty: item.qty },
        )
        .catch(() => {});

      // 4. Rate Cell (optional)
      if (item.rate !== undefined) {
        const rateCell = targetRow.locator("[data-fieldname='rate']").first();
        await rateCell.click({ force: true });
        const inlineRateInput = targetRow.locator("input[data-fieldname='rate']").first();
        if (await inlineRateInput.isVisible({ timeout: 1500 }).catch(() => false)) {
          await inlineRateInput.fill(item.rate.toString());
          await inlineRateInput.press('Enter');
        } else {
          await this.page.keyboard.type(item.rate.toString());
          await this.page.keyboard.press('Enter');
        }
        await this.closeDatepickerIfOpen();
      }
    }

    // Allow browser event loop to process Frappe calculation hooks
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Explicitly selects today's date (or specified date) for a line item's delivery date in the child grid.
   */
  async selectLineItemDeliveryDate(rowIndex: number, dateStr?: string): Promise<void> {
    const targetRow = this.gridRows.nth(rowIndex);
    const deliveryCell = targetRow.locator("[data-fieldname='delivery_date']").first();
    await deliveryCell.click({ force: true });
    const inlineInput = targetRow.locator("input[data-fieldname='delivery_date']").first();
    if (await inlineInput.isVisible({ timeout: 1500 }).catch(() => false)) {
      if (dateStr && dateStr.toLowerCase() !== 'today') {
        await inlineInput.fill(dateStr);
        await inlineInput.press('Enter');
        await this.closeDatepickerIfOpen();
      } else {
        await this.selectTodayDate(inlineInput);
      }
    } else {
      await this.selectTodayFromActiveDatepicker(targetRow);
    }
    await this.closeDatepickerIfOpen();
  }

  /**
   * Fills an entire Sales Order form with header and multiple items.
   */
  async fillSalesOrder(formData: SalesOrderFormData): Promise<void> {
    await this.selectCustomer(formData.customer);
    if (formData.date) {
      await this.enterDate(formData.date);
    }
    if (formData.startDeliveryDate) {
      await this.enterStartDeliveryDate(formData.startDeliveryDate);
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (item) {
        await this.fillLineItem(i, item);
      }
    }
  }

  // ─── Actions & Lifecycle Transitions ───────────────────────────────────

  /**
   * Clicks Save button to commit form as Draft (docstatus 0).
   * Returns generated document ID (e.g. 'O/2566').
   */
  async saveDraft(): Promise<string> {
    await this.saveButton.click();
    // Wait for save to complete and URL to navigate from new-sales-order to the created ID
    await expect(this.page).not.toHaveURL(/\/new-sales-order/, { timeout: 15000 });

    // Wait for Frappe form to settle after save (Submit button or Draft indicator becomes visible)
    await expect(
      this.page.locator("button[data-label='Submit'], .page-head:has-text('Draft')").first(),
    ).toBeVisible({ timeout: 15000 });

    // Extract ID from current URL (e.g. /desk/sales-order/O%2F2566)
    const currentUrl = decodeURIComponent(this.page.url());
    const match = currentUrl.match(/sales-order\/(O\/\d+|[A-Za-z0-9_-]+)/);
    const orderId = match ? match[1] || '' : '';
    return orderId;
  }

  // ─── Delivery Schedule Modal Interactions ──────────────────────────────

  /**
   * Clicks 'Schedule' button in the items child grid row to open the Delivery Schedule modal.
   *
   * @param rowIndex Zero-based index of the line item row (default: 0).
   */
  async openDeliverySchedule(rowIndex = 0): Promise<void> {
    const scheduleBtn = this.itemsGrid
      .locator(
        "button:has-text('Schedule'), button[data-fieldname='custom_schedule'], [data-fieldname='custom_schedule'] button",
      )
      .nth(rowIndex);

    // Auto-retrying web-first assertion ensures the button is attached and visible after re-renders
    await expect(scheduleBtn).toBeVisible({ timeout: 15000 });

    // Click auto-scrolls into view and handles element actionability safely
    await scheduleBtn.click();

    await expect(this.deliveryScheduleModal).toBeVisible({ timeout: 10000 });
  }

  /**
   * Enters the Per Day Qty in the Delivery Schedule modal.
   *
   * @param perDayQty The quantity to deliver per day (e.g. 100).
   */
  async enterDeliverySchedulePerDayQty(perDayQty: number): Promise<void> {
    await expect(this.perDayQtyInput).toBeVisible({ timeout: 5000 });
    await this.perDayQtyInput.click();
    await this.perDayQtyInput.fill('');
    await this.perDayQtyInput.fill(perDayQty.toString());
    await this.perDayQtyInput.press('Tab');
    await this.perDayQtyInput.dispatchEvent('change').catch(() => {});
  }

  /**
   * Verifies that the auto-calculated 'No of Deliveries' matches the expected count.
   *
   * @param expectedCount Expected number of deliveries (e.g. 5).
   */
  async verifyNumberOfDeliveries(expectedCount: number): Promise<void> {
    await expect
      .poll(
        async () => {
          const val =
            (await this.noOfDeliveriesInput.inputValue().catch(() => '')) ||
            (await this.noOfDeliveriesInput.textContent().catch(() => '')) ||
            '';
          const parsed = parseInt(val.trim(), 10);
          return isNaN(parsed) ? null : parsed;
        },
        {
          message: `Expected 'No of Deliveries' to be auto-counted to ${expectedCount}`,
          timeout: 10000,
        },
      )
      .toBe(expectedCount);
  }

  /**
   * Clicks 'Get Delivery Schedule' button in the Delivery Schedule modal.
   */
  async clickGetDeliverySchedule(): Promise<void> {
    await expect(this.getDeliveryScheduleButton).toBeVisible({ timeout: 5000 });
    await this.getDeliveryScheduleButton.click();
  }

  /**
   * Adds a given number of days to a DD-MM-YYYY date string.
   */
  private addDaysToDateStr(dateStr: string, days: number): string {
    const parts = dateStr.trim().split('-');
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts.map(Number);
      if (dd && mm && yyyy) {
        const d = new Date(yyyy, mm - 1, dd);
        d.setDate(d.getDate() + days);
        const resDd = String(d.getDate()).padStart(2, '0');
        const resMm = String(d.getMonth() + 1).padStart(2, '0');
        const resYyyy = d.getFullYear();
        return `${resDd}-${resMm}-${resYyyy}`;
      }
    }
    return '';
  }

  /**
   * Verifies that the auto-calculated delivery schedule grid is populated properly.
   * Checks row count, sequential dates, and quantities per row.
   *
   * @param options Verification options containing perDayQty, expectedCount, and optional startDate.
   */
  async verifyDeliveryScheduleRows(options: {
    perDayQty: number;
    expectedCount: number;
    startDate?: string;
  }): Promise<void> {
    const { perDayQty, expectedCount } = options;

    // 1. Verify expected number of rows populated
    await expect(this.scheduleGridRows).toHaveCount(expectedCount, { timeout: 10000 });

    // 2. Determine start date
    let startDateStr = options.startDate;
    if (!startDateStr) {
      startDateStr =
        (await this.firstDeliveryDateInput.inputValue().catch(() => '')) ||
        (await this.firstDeliveryDateInput.textContent().catch(() => '')) ||
        '';
    }

    // 3. Verify each row's date and quantity
    let totalScheduledQty = 0;
    for (let i = 0; i < expectedCount; i++) {
      const row = this.scheduleGridRows.nth(i);
      const expectedDate = startDateStr ? this.addDaysToDateStr(startDateStr, i) : '';

      // Verify sequential date
      if (expectedDate) {
        const dateCell = row
          .locator("[data-fieldname='delivery_date'], [data-fieldname*='date']")
          .first();
        if (await dateCell.isVisible({ timeout: 1000 }).catch(() => false)) {
          await expect(dateCell).toContainText(expectedDate);
        } else {
          await expect(row).toContainText(expectedDate);
        }
      }

      // Verify quantity
      const qtyCell = row.locator("[data-fieldname='qty']").first();
      let rowQty = 0;
      if (await qtyCell.isVisible({ timeout: 1000 }).catch(() => false)) {
        const text =
          (await qtyCell.textContent()) ||
          (await qtyCell
            .locator('input')
            .inputValue()
            .catch(() => ''));
        rowQty = parseFloat(text.replace(/[^0-9.]/g, '') || '0');
      } else {
        const rowText = await row.innerText();
        const matches = rowText.match(/\b\d+(\.\d+)?\b/g);
        if (matches && matches.length > 0) {
          rowQty = parseFloat(matches[matches.length - 1] || '0');
        }
      }
      expect(rowQty).toBeCloseTo(perDayQty, 2);
      totalScheduledQty += rowQty;
    }

    // 4. Verify total scheduled quantity
    const expectedTotal = perDayQty * expectedCount;
    expect(totalScheduledQty).toBeCloseTo(expectedTotal, 2);
  }

  /**
   * Clicks 'Add Schedule' button to apply delivery schedule and close modal.
   */
  async clickAddSchedule(): Promise<void> {
    await expect(this.addScheduleButton).toBeVisible({ timeout: 5000 });
    await this.addScheduleButton.click();
    await expect(this.deliveryScheduleModal).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Complete delivery schedule flow: opens modal, enters per-day quantity,
   * verifies auto-calculated number of deliveries, generates schedule,
   * verifies schedule grid, and adds schedule.
   */
  async configureDeliverySchedule(options: {
    rowIndex?: number;
    perDayQty: number;
    expectedDeliveries?: number;
  }): Promise<void> {
    const { rowIndex = 0, perDayQty, expectedDeliveries } = options;

    await this.openDeliverySchedule(rowIndex);
    await this.enterDeliverySchedulePerDayQty(perDayQty);

    let expectedCount = expectedDeliveries;
    if (expectedCount === undefined) {
      const qtyVal =
        (await this.scheduleQtyInput.inputValue().catch(() => '')) ||
        (await this.scheduleQtyInput.textContent().catch(() => '')) ||
        '';
      const totalQty = parseFloat(qtyVal.replace(/[^0-9.]/g, '') || '0');
      expectedCount = totalQty > 0 ? Math.ceil(totalQty / perDayQty) : 5;
    }

    await this.verifyNumberOfDeliveries(expectedCount);
    await this.clickGetDeliverySchedule();
    await this.verifyDeliveryScheduleRows({ perDayQty, expectedCount });
    await this.clickAddSchedule();
  }

  /**
   * Submits the saved Draft Sales Order (docstatus 1).
   * Confirms Frappe permanent submission dialog and asserts status becomes 'To Deliver and Bill'.
   */
  async submitOrder(): Promise<void> {
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
        .catch(() => {});
    }

    // Await docstatus transition to 1 (Submitted)
    await expect
      .poll(
        async () => {
          return await this.page
            .evaluate(() => {
              const fw = window as unknown as any;
              return fw.cur_frm?.doc?.docstatus ?? 0;
            })
            .catch(() => 0);
        },
        { timeout: 15000 },
      )
      .toBe(1);
  }

  // ─── Assertions ────────────────────────────────────────────────────────

  /**
   * Asserts the default values shown on a fresh Sales Order form.
   */
  async expectDefaultFormValues(): Promise<void> {
    await expect(this.seriesSelect).toHaveValue('O/.#');
    await expect(this.sourceWarehouseInput).toHaveValue('Finished Goods - MMPL');
  }

  /**
   * Retrieves the dynamic unit rate of an item from the child grid.
   * Checks Frappe's client-side doc model first, then falls back to grid DOM cell.
   *
   * @param rowIndex Zero-based index of the line item row (default: 0).
   * @returns Unit rate as a number.
   */
  async getLineItemRate(rowIndex = 0): Promise<number> {
    // 1. Try Frappe client runtime model (fastest and most reliable)
    const modelRate = await this.page
      .evaluate((idx: number) => {
        const fw = window as unknown as FrappeWindow;
        const items = fw.cur_frm?.doc?.items;
        if (items && items[idx]) {
          const item = items[idx];
          const rate = Number(item?.rate);
          if (!isNaN(rate) && rate > 0) return rate;
        }
        return null;
      }, rowIndex)
      .catch(() => null);

    if (modelRate !== null && modelRate !== undefined) {
      return modelRate;
    }

    // 2. Fallback to DOM inspection
    const targetRow = this.gridRows.nth(rowIndex);
    const rateEl = targetRow.locator("[data-fieldname='rate']").first();
    if (await rateEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      const inputEl = rateEl.locator('input').first();
      let text = '';
      if (await inputEl.isVisible({ timeout: 500 }).catch(() => false)) {
        text = await inputEl.inputValue();
      } else {
        text = (await rateEl.textContent()) || '';
      }
      const parsed = parseFloat(text.replace(/[^0-9.]/g, '') || '0');
      if (parsed > 0) return parsed;
    }

    return 0;
  }

  /**
   * Retrieves the dynamic line amount (quantity * rate) of an item from the child grid.
   * Checks Frappe's client-side doc model first, then falls back to grid DOM cell.
   *
   * @param rowIndex Zero-based index of the line item row (default: 0).
   * @returns Line amount as a number.
   */
  async getLineItemAmount(rowIndex = 0): Promise<number> {
    const modelAmount = await this.page
      .evaluate((idx: number) => {
        const fw = window as unknown as FrappeWindow;
        const items = fw.cur_frm?.doc?.items;
        if (items && items[idx]) {
          const item = items[idx];
          const amt = Number(item?.amount);
          if (!isNaN(amt) && amt > 0) return amt;
          const qty = Number(item?.qty || 0);
          const rate = Number(item?.rate || 0);
          if (qty > 0 && rate > 0) return qty * rate;
        }
        return null;
      }, rowIndex)
      .catch(() => null);

    if (modelAmount !== null && modelAmount !== undefined) {
      return modelAmount;
    }

    const targetRow = this.gridRows.nth(rowIndex);
    const amountEl = targetRow.locator("[data-fieldname='amount']").first();
    if (await amountEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      const inputEl = amountEl.locator('input').first();
      let text = '';
      if (await inputEl.isVisible({ timeout: 500 }).catch(() => false)) {
        text = await inputEl.inputValue();
      } else {
        text = (await amountEl.textContent()) || '';
      }
      const parsed = parseFloat(text.replace(/[^0-9.]/g, '') || '0');
      if (parsed > 0) return parsed;
    }

    return 0;
  }

  /**
   * Dynamically calculates the expected net total across all line items in the grid.
   * Net Total = sum of (quantity * item unit amount) for all lines.
   */
  async calculateExpectedNetTotal(): Promise<number> {
    // 1. Try Frappe client runtime model
    const modelTotal = await this.page
      .evaluate(() => {
        const fw = window as unknown as FrappeWindow;
        const items = fw.cur_frm?.doc?.items;
        if (Array.isArray(items) && items.length > 0) {
          let sum = 0;
          for (const item of items) {
            const qty = Number(item.qty || 0);
            const rate = Number(item.rate || 0);
            const amount = Number(item.amount || qty * rate);
            sum += amount;
          }
          if (sum > 0) return sum;
        }
        return null;
      })
      .catch(() => null);

    if (modelTotal !== null && modelTotal !== undefined) {
      return modelTotal;
    }

    // 2. Fallback: calculate from each visible row in the DOM
    const rowCount = await this.gridRows.count();
    let sum = 0;
    for (let i = 0; i < rowCount; i++) {
      const amt = await this.getLineItemAmount(i);
      if (amt > 0) {
        sum += amt;
      } else {
        const rate = await this.getLineItemRate(i);
        const qtyEl = this.gridRows.nth(i).locator("[data-fieldname='qty']").first();
        const qtyText = (await qtyEl.textContent()) || '';
        const qty = parseFloat(qtyText.replace(/[^0-9.]/g, '') || '0');
        sum += qty * rate;
      }
    }
    return sum;
  }

  /**
   * Retrieves the current total quantity displayed on the form.
   */
  async getTotalQuantity(): Promise<number> {
    const modelTotal = await this.page
      .evaluate(() => {
        const fw = window as unknown as any;
        const total = fw.cur_frm?.doc?.total_qty;
        return total !== undefined && total !== null ? Number(total) : null;
      })
      .catch(() => null);

    if (modelTotal !== null && !isNaN(modelTotal) && modelTotal > 0) {
      return modelTotal;
    }

    const valueEl = this.totalQtyDisplay.locator('.control-value, input').first();
    let text = '';
    if (await valueEl.isVisible({ timeout: 500 }).catch(() => false)) {
      text =
        (await valueEl.inputValue().catch(() => '')) ||
        (await valueEl.textContent().catch(() => '')) ||
        '';
    }
    if (!text) {
      text = (await this.totalQtyDisplay.first().textContent()) || '';
    }
    return parseFloat(text.replace(/[^0-9.]/g, '') || '0');
  }

  /**
   * Retrieves the current Net Total displayed on the form.
   */
  async getNetTotal(): Promise<number> {
    const modelNetTotal = await this.page
      .evaluate(() => {
        const fw = window as unknown as any;
        const net = fw.cur_frm?.doc?.base_net_total ?? fw.cur_frm?.doc?.net_total;
        return net !== undefined && net !== null ? Number(net) : null;
      })
      .catch(() => null);

    if (modelNetTotal !== null && !isNaN(modelNetTotal) && modelNetTotal > 0) {
      return modelNetTotal;
    }

    const valueEl = this.netTotalDisplay.locator('.control-value, input').first();
    let text = '';
    if (await valueEl.isVisible({ timeout: 500 }).catch(() => false)) {
      text =
        (await valueEl.inputValue().catch(() => '')) ||
        (await valueEl.textContent().catch(() => '')) ||
        '';
    }
    if (!text) {
      text = (await this.netTotalDisplay.first().textContent()) || '';
    }
    return parseFloat(text.replace(/[^0-9.]/g, '') || '0');
  }

  /**
   * Asserts total quantity displayed in summary matches expected value.
   */
  async expectTotalQuantity(expectedQty: number): Promise<void> {
    await expect
      .poll(
        async () => {
          return await this.getTotalQuantity();
        },
        {
          message: `Expected total quantity to equal ${expectedQty}`,
          timeout: 10000,
        },
      )
      .toBeCloseTo(expectedQty, 2);
  }

  /**
   * Asserts Net Total (INR) displayed in summary matches expected value.
   * If expectedTotal is omitted, it dynamically computes the expected value:
   * Net Total = sum of (quantity * item unit amount) based on the items selected.
   *
   * @param expectedTotal Optional explicit expected total. If omitted, computes dynamically.
   */
  async expectNetTotal(expectedTotal?: number): Promise<void> {
    if (expectedTotal === undefined) {
      // Wait for Frappe to fetch dynamic item rates and compute line totals
      await expect
        .poll(
          async () => {
            return await this.calculateExpectedNetTotal();
          },
          {
            message: 'Expected items grid to have non-zero dynamic rates/amounts fetched from ERP',
            timeout: 10000,
          },
        )
        .toBeGreaterThan(0);

      expectedTotal = await this.calculateExpectedNetTotal();
    }

    // Assert that the Net Total display matches the expected total (web-first polling)
    await expect
      .poll(
        async () => {
          return await this.getNetTotal();
        },
        {
          message: `Expected Net Total to equal ${expectedTotal}`,
          timeout: 10000,
        },
      )
      .toBeCloseTo(expectedTotal, 2);
  }

  /**
   * Verifies that the order record appears in the list view with expected attributes.
   */
  async verifyOrderInList(
    orderId: string,
    customerName: string,
    expectedStatus: string,
  ): Promise<void> {
    await this.goto();
    await expect(this.resultContainer).toBeVisible({ timeout: 15000 });

    // Locate row containing the order ID
    const row = this.page
      .locator(`//div[contains(@class, 'list-row-container') and contains(., '${orderId}')]`)
      .first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row).toContainText(customerName);
    await expect(row).toContainText(expectedStatus);
  }
}
