/**
 * @fileoverview Barrel export for all framework types.
 * Provides clean import paths for consumers.
 */

export type {
  EnvironmentName,
  EnvironmentConfig,
  ApiRequestConfig,
  ApiResponse,
  UserCredentials,
  TestUser,
  PageMetadata,
  ScreenshotConfig,
  TestResultMetadata,
} from './framework.types';

export type {
  NavigationItem,
  FormFieldConfig,
  TableRowData,
  PaginationState,
  ToastNotification,
  ModalConfig,
  SearchCriteria,
} from './page.types';
