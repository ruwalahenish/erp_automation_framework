/**
 * @fileoverview Test data definitions and interfaces for RI Dispatch Planning module.
 */

export interface RIDispatchPlanDetailData {
  scheduleDate?: string;
  customer?: string;
  item?: string;
  orderNo?: string;
  orderDate?: string;
  dueDays?: number;
  orderQty?: number;
  pendingDispQty?: number;
  scheduleQty?: number;
  dispQty?: number;
  shippingAddress: string;
}

export interface RIDispatchPlanningFormData {
  namingSeries?: string;
  company?: string;
  deliveryPlanDate?: string;
  fromDate?: string;
  toDate?: string;
  customer: string;
  itemCode?: string;
  warehouse?: string;
  shippingAddress?: string;
}

/**
 * Standard test dataset for RI Dispatch Planning using verified live customer.
 */
export const standardRIDispatchPlanningData: RIDispatchPlanningFormData = {
  namingSeries: 'DO/.#',
  company: 'Meera Metyarns Private Limited',
  warehouse: 'Finished Goods - MMPL',
  customer: 'Amanta Fabrics LLP',
  itemCode: '1565-Z',
  shippingAddress: 'Amanta Fabrics LLP-2-Billing',
};
