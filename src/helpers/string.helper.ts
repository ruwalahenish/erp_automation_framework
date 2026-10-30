/**
 * @fileoverview String utility functions for test data generation and manipulation.
 * Provides generators for unique test data and string transformation helpers.
 */

/**
 * Generates a random string of the specified length.
 *
 * @param length - Desired string length
 * @param charset - Character set to use ('alpha', 'numeric', 'alphanumeric', 'hex')
 * @returns Random string of the specified length
 *
 * @example
 * ```typescript
 * randomString(8, 'alphanumeric'); // 'aB3dE7fG'
 * randomString(6, 'hex'); // 'a4f2c1'
 * ```
 */
export function randomString(
  length: number,
  charset: 'alpha' | 'numeric' | 'alphanumeric' | 'hex' = 'alphanumeric',
): string {
  const charsets: Record<string, string> = {
    alpha: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numeric: '0123456789',
    alphanumeric: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    hex: '0123456789abcdef',
  };

  const chars = charsets[charset] ?? charsets['alphanumeric']!;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a unique email address for test data.
 *
 * @param domain - Email domain to use
 * @param prefix - Optional prefix for the local part
 * @returns Unique email address
 *
 * @example
 * ```typescript
 * generateEmail('test.com', 'user'); // 'user_a3b8c1d4@test.com'
 * ```
 */
export function generateEmail(domain = 'testmail.com', prefix = 'test'): string {
  const uniquePart = randomString(8, 'alphanumeric').toLowerCase();
  return `${prefix}_${uniquePart}@${domain}`;
}

/**
 * Generates a unique username for test data.
 *
 * @param prefix - Prefix for the username
 * @returns Unique username string
 */
export function generateUsername(prefix = 'user'): string {
  return `${prefix}_${randomString(6, 'alphanumeric').toLowerCase()}`;
}

/**
 * Converts a string to title case.
 *
 * @param input - The string to convert
 * @returns Title-cased string
 *
 * @example
 * ```typescript
 * toTitleCase('hello world'); // 'Hello World'
 * ```
 */
export function toTitleCase(input: string): string {
  return input.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Converts a string to slug format (kebab-case).
 *
 * @param input - The string to convert
 * @returns Slugified string
 *
 * @example
 * ```typescript
 * toSlug('Hello World Test'); // 'hello-world-test'
 * ```
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Truncates a string to the specified length with an ellipsis.
 *
 * @param input - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to append when truncated
 * @returns Truncated string
 */
export function truncate(input: string, maxLength: number, suffix = '...'): string {
  if (input.length <= maxLength) return input;
  return input.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Masks sensitive data, showing only the last N characters.
 *
 * @param input - The string to mask
 * @param visibleChars - Number of characters to show at the end
 * @param maskChar - Character to use for masking
 * @returns Masked string
 *
 * @example
 * ```typescript
 * maskString('1234567890', 4); // '******7890'
 * ```
 */
export function maskString(input: string, visibleChars = 4, maskChar = '*'): string {
  if (input.length <= visibleChars) return input;
  const masked = maskChar.repeat(input.length - visibleChars);
  return masked + input.slice(-visibleChars);
}

/**
 * Generates a UUID v4-like string for test identifiers.
 * Note: Not cryptographically secure — for test data only.
 *
 * @returns A UUID-formatted string
 */
export function generateTestId(): string {
  const hex = (): string => randomString(4, 'hex');
  return `${hex()}${hex()}-${hex()}-4${randomString(3, 'hex')}-${randomString(1, 'hex')}${randomString(3, 'hex')}-${hex()}${hex()}${hex()}`;
}
