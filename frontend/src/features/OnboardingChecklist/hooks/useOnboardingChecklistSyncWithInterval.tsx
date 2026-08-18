import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch } from 'store/hooks';
import { fetchOnboardingChecklist } from 'store/slices/onboardingChecklist/actions';

/**
 * Configuration options for the onboarding checklist sync hook
 */
interface UseOnboardingChecklistSyncOptions {
  /**
   * Interval in milliseconds between sync attempts
   * @default 90000 (90 seconds or 1.5 minutes)
   */
  interval?: number;
  /**
   * When true, disables the automatic syncing functionality
   * @default false
   */
  disabled?: boolean;
}

/**
 * Custom hook that automatically syncs the onboarding checklist data at regular intervals
 * using a recursive setTimeout pattern to prevent request overlap.
 *
 * This hook waits for the specified interval before making the first fetch, then schedules
 * subsequent fetches after each request completes. This ensures that slow requests don't
 * cause overlapping network calls and maintains consistent timing.
 *
 * @param options - Configuration options for the sync behavior
 * @returns A cleanup function that can be used to manually stop the sync process
 *
 * @example
 * ```tsx
 * // Basic usage with default 1-minute interval
 * useOnboardingChecklistSyncWithInterval();
 *
 * // Custom interval of 30 seconds
 * const stopSync = useOnboardingChecklistSyncWithInterval({ interval: 30000 });
 *
 * // Disabled syncing
 * useOnboardingChecklistSyncWithInterval({ disabled: true });
 *
 * // Conditionally disable based on some state
 * useOnboardingChecklistSyncWithInterval({
 *   interval: 30000,
 *   disabled: !isUserActive
 * });
 *
 * // Later, manually stop syncing
 * stopSync();
 * ```
 */

export function useOnboardingChecklistSyncWithInterval(
  options: UseOnboardingChecklistSyncOptions = {},
) {
  const { interval = 90000, disabled = false } = options;
  const dispatch = useAppDispatch();

  // Ref to store the timeout ID for cleanup
  const timeoutRef = useRef<number | null>(null);

  // Ref to track if the component is still mounted to prevent memory leaks
  const isMountedRef = useRef(true);

  /**
   * Memoized fetch function that schedules the next fetch after completion.
   * This recursive pattern ensures that:
   * - Requests don't overlap even if they take longer than the interval
   * - The next request is always scheduled after the current one completes
   * - Component unmounting is properly handled to prevent memory leaks
   */
  const fetchDataWithTimeout = useCallback(async () => {
    // Early return if component has been unmounted
    if (!isMountedRef.current) return;

    try {
      // Fetch the latest onboarding checklist data, bypassing cache
      await dispatch(fetchOnboardingChecklist({ skipCache: true }));
    } catch (error) {
      // Silently handle errors to prevent breaking the sync cycle
      // In a production app, you might want to log this or implement retry logic
    }

    // Schedule the next fetch only if the component is still mounted
    // This prevents scheduling new timeouts after cleanup
    if (isMountedRef.current) {
      timeoutRef.current = window.setTimeout(fetchDataWithTimeout, interval);
    }
  }, [dispatch, interval]);

  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;

    // Early return if syncing is disabled
    if (disabled) {
      return;
    }

    // Schedule the first fetch after the interval delay (not immediately)
    // This provides consistent timing for all fetch operations
    timeoutRef.current = window.setTimeout(fetchDataWithTimeout, interval);

    // Cleanup function runs when the component unmounts or dependencies change
    return () => {
      // Mark component as unmounted to prevent further async operations
      isMountedRef.current = false;

      // Clear any pending timeout to prevent memory leaks
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [fetchDataWithTimeout, interval, disabled]);

  /**
   * Returns a memoized cleanup function that can be used to manually stop
   * the sync process before the component unmounts.
   *
   * @returns A function that clears the current timeout and stops syncing
   */
  return useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
}
