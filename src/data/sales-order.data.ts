/**
 * @fileoverview Test data definitions and interfaces for Sales Order flow.
 */

export interface SalesOrderItemData {
  itemCode: string;
  qty: number;
  rate?: number;
  deliveryDate?: string;
}

export interface SalesOrderFormData {
  series?: string;
  customer: string;
  date?: string;
  startDeliveryDate?: string;
  deliveryDate?: string;
  sourceWarehouse?: string;
  isSubcontracted?: boolean;
  items: SalesOrderItemData[];
}

/**
 * Standard test dataset using verified QC test customer 'Deepak Test'
 */
export const standardSalesOrderData: SalesOrderFormData = {
  series: 'O/.#',
  customer: 'Amanta Fabrics LLP',
  sourceWarehouse: 'Finished Goods - MMPL',
  items: [
    {
      itemCode: '1565-Z',
      qty: 500,
    },
  ],
};

/**
 * Multi-item sales order dataset combining distinct manufactured yarn codes
 */
export const multiItemSalesOrderData: SalesOrderFormData = {
  series: 'O/.#',
  customer: 'Amanta Fabrics LLP',
  sourceWarehouse: 'Finished Goods - MMPL',
  items: [
    {
      itemCode: '1565-Z',
      qty: 260,
    },
    {
      itemCode: '1830-S',
      qty: 412,
    },
  ],
};

/**
 * Commercial customer test dataset using live verified customer 'Amanta Fabrics LLP'
 */
export const commercialSalesOrderData: SalesOrderFormData = {
  series: 'O/.#',
  customer: 'Amanta Fabrics LLP',
  sourceWarehouse: 'Finished Goods - MMPL',
  items: [
    {
      itemCode: '1565-Z',
      qty: 125,
    },
  ],
};
