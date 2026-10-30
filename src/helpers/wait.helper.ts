/**
 * @fileoverview Utility functions for async timeouts.
 * Standard Playwright web assertions (expect.poll, expect(locator)) should be preferred
 * over custom polling or retry loops.
 */

/**
 * Wraps a promise with a timeout limit, rejecting if the promise does not resolve in time.
 *
 * @typeParam T - Return type of the promise
 * @param promise - The promise to wrap
 * @param timeoutMs - Maximum time to wait in milliseconds
 * @param errorMessage - Optional error message on timeout
 * @returns The resolved value of the promise
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out',
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`[WaitHelper] ${errorMessage} (timeout: ${timeoutMs}ms)`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}
