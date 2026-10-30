/**
 * @fileoverview Page-specific types for Page Object Model implementations.
 * Defines interfaces for common UI components and page interactions.
 */

/** Navigation menu item structure */
export interface NavigationItem {
  /** Display label of the menu item */
  readonly label: string;
  /** Navigation URL or route */
  readonly href: string;
  /** Whether the item is currently active */
  readonly isActive?: boolean;
}

/** Form field configuration for dynamic form handling */
export interface FormFieldConfig {
  /** Unique field identifier */
  readonly fieldName: string;
  /** Field type (text, email, password, select, checkbox, radio, textarea) */
  readonly fieldType: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea';
  /** Value to fill in the field */
  readonly value: string | boolean;
  /** Whether the field is required */
  readonly required?: boolean;
}

/** Table row data for data grid assertions */
export interface TableRowData {
  /** Row index (0-based) */
  readonly index: number;
  /** Column name to cell value mapping */
  readonly cells: Record<string, string>;
}

/** Pagination state for paginated views */
export interface PaginationState {
  /** Current page number */
  readonly currentPage: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Items per page */
  readonly itemsPerPage: number;
  /** Total item count */
  readonly totalItems: number;
}

/** Toast notification data */
export interface ToastNotification {
  /** Toast message content */
  readonly message: string;
  /** Notification type */
  readonly type: 'success' | 'error' | 'warning' | 'info';
  /** Auto-dismiss duration in milliseconds */
  readonly duration?: number;
}

/** Modal/Dialog configuration */
export interface ModalConfig {
  /** Modal title text */
  readonly title: string;
  /** Whether the modal has a close button */
  readonly hasCloseButton: boolean;
  /** Whether clicking overlay closes the modal */
  readonly closeOnOverlayClick: boolean;
}

/** Search/filter criteria */
export interface SearchCriteria {
  /** Search query string */
  readonly query: string;
  /** Filter category */
  readonly category?: string;
  /** Sort field */
  readonly sortBy?: string;
  /** Sort direction */
  readonly sortOrder?: 'asc' | 'desc';
}
