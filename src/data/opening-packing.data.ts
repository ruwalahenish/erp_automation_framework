/**
 * @fileoverview Test data definitions and interface definitions for Opening Packing flow.
 */

export interface OpeningPackingItemData {
  finishItem: string;
  cops?: number;
  grossWt?: number;
  tareWt?: number;
}

export interface OpeningPackingFormData {
  series?: string;
  company?: string;
  postingDate?: string;
  postingTime?: string;
  checker?: string;
  packer?: string;
  finishWarehouse?: string;
  tubeColor?: string;
  finishItem?: string;
  items: OpeningPackingItemData[];
}
