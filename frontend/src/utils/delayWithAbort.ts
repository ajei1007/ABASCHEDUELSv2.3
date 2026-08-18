/**
 * Creates a delay with abort controller support for cancellation.
 * Useful for implementing timeouts and cancellable delays in async operations.
 *
 * @param delayMs - Delay in milliseconds
 * @param abortController - AbortController for cancellation
 * @returns Promise that resolves after delay or rejects if aborted
 */
export const delayWithAbort = (
  delayMs: number,
  abortController: AbortController,
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      // Check if the request was aborted before timeout completion
      if (abortController.signal.aborted) {
        reject(new Error('Request was aborted during delay period'));
        return;
      }
      resolve();
    }, delayMs);

    // Listen for abort signal to cancel the delay immediately
    abortController.signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new Error('Request was aborted during delay period'));
    });
  });
};
