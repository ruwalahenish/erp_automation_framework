/**
 * @fileoverview Helper utility to persist and retrieve generated Sales Order identifiers across test steps and modules.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SavedSalesOrder {
  orderId: string;
  customer: string;
  date?: string;
  itemCode?: string;
  qty?: number;
  timestamp?: string;
}

const STORAGE_FILE = path.resolve(process.cwd(), '.auth', 'last-sales-order.json');

/**
 * Saves a generated Sales Order details to disk and memory for downstream modules (e.g. RI Dispatch Planning).
 */
export function saveSavedSalesOrder(data: SavedSalesOrder): void {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[OrderStore] Failed to persist sales order data to disk:`, err);
  }
}

/**
 * Retrieves the last saved Sales Order details from disk.
 */
export function getSavedSalesOrder(): SavedSalesOrder | null {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(content) as SavedSalesOrder;
    }
  } catch (err) {
    console.warn(`[OrderStore] Failed to read saved sales order data from disk:`, err);
  }
  return null;
}

/**
 * Clears any stored sales order details.
 */
export function clearSavedSalesOrder(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE);
    }
  } catch {
    // Ignore cleanup failure
  }
}
