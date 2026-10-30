/**
 * @fileoverview Date and time utility functions for test data generation.
 * Provides formatters and generators for date-related test scenarios.
 */

/** Date format options supported by the formatter */
export type DateFormatType = 'ISO' | 'US' | 'EU' | 'short' | 'long' | 'timestamp';

/**
 * Formats a Date object into the specified string format.
 *
 * @param date - The Date object to format
 * @param format - The desired output format
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatDate(new Date('2024-01-15'), 'US'); // '01/15/2024'
 * formatDate(new Date('2024-01-15'), 'EU'); // '15/01/2024'
 * ```
 */
export function formatDate(date: Date, format: DateFormatType = 'ISO'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (format) {
    case 'ISO':
      return date.toISOString();
    case 'US':
      return `${month}/${day}/${year}`;
    case 'EU':
      return `${day}/${month}/${year}`;
    case 'short':
      return `${year}-${month}-${day}`;
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'timestamp':
      return date.getTime().toString();
    default:
      return date.toISOString();
  }
}

/**
 * Returns a Date object offset from the current date by the specified number of days.
 *
 * @param days - Number of days to offset (positive for future, negative for past)
 * @returns The offset Date object
 *
 * @example
 * ```typescript
 * const tomorrow = getDateOffset(1);
 * const lastWeek = getDateOffset(-7);
 * ```
 */
export function getDateOffset(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Generates a unique timestamp-based string for use in test data.
 * Useful for creating unique identifiers that are also human-readable.
 *
 * @param prefix - Optional prefix for the generated string
 * @returns A unique timestamp-based string
 *
 * @example
 * ```typescript
 * generateTimestamp('test'); // 'test_20240115_143022_789'
 * ```
 */
export function generateTimestamp(prefix = ''): string {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '_',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
    '_',
    String(now.getMilliseconds()).padStart(3, '0'),
  ].join('');

  return prefix ? `${prefix}_${parts}` : parts;
}

/**
 * Checks if a date string is valid and parseable.
 *
 * @param dateString - The date string to validate
 * @returns Whether the string represents a valid date
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Returns the difference between two dates in the specified unit.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @param unit - Unit of measurement ('days', 'hours', 'minutes', 'seconds')
 * @returns The difference between the two dates in the specified unit
 */
export function dateDifference(
  date1: Date,
  date2: Date,
  unit: 'days' | 'hours' | 'minutes' | 'seconds' = 'days',
): number {
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  const divisors: Record<string, number> = {
    days: 86_400_000,
    hours: 3_600_000,
    minutes: 60_000,
    seconds: 1_000,
  };

  return Math.floor(diffMs / (divisors[unit] ?? 86_400_000));
}
