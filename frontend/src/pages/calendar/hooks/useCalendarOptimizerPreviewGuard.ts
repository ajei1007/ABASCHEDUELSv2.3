import { useEffect } from 'react';
import { useBlocker } from 'react-router';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { resetExpandedResources } from 'store/slices/calendar/actions';
import {
  resetOptimizerResults,
  cancelAllOptimizerJobs,
} from 'store/actions/optimizerActions';
import {
  isOptimizerResultsPreviewModeSelector,
  hasRunningOptimizerJobsSelector,
} from 'store/selectors/optimizerSelectors';

/**
 * Custom hook that manages navigation blocking and cleanup when the calendar
 * is in optimizer results preview mode or has running optimizer jobs.
 *
 * This hook provides protection against accidental navigation away from the calendar
 * when important optimizer data might be lost. It handles:
 * - Blocking navigation with confirmation dialogs
 * - Preventing browser refresh/close without warning
 * - Cleaning up optimizer state when navigation is confirmed
 * - Triggering callbacks when preview mode is activated or deactivated
 *
 * @param onModeActivated - Optional callback function executed when optimizer preview mode becomes active
 * @param onModeDeactivated - Optional callback function executed when optimizer preview mode becomes inactive
 */
export function useCalendarOptimizerPreviewGuard({
  onModeActivated,
  onModeDeactivated,
}: {
  onModeActivated?: () => void;
  onModeDeactivated?: () => void;
} = {}) {
  const dispatch = useAppDispatch();

  // Get current optimizer state from Redux store
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );
  const hasRunningOptimizerJobs = useAppSelector(
    hasRunningOptimizerJobsSelector,
  );

  // Block navigation when in preview mode or when optimizer jobs are running
  // This prevents users from accidentally losing their optimizer results
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname &&
      (isOptimizerResultsPreviewMode || hasRunningOptimizerJobs),
  );

  // Use latest callback pattern to ensure callbacks always reference the most recent version
  // This prevents stale closure issues when callbacks are passed as dependencies
  const _onModeActivated = useLatestCallback(() => {
    onModeActivated?.();
  });

  const _onModeDeactivated = useLatestCallback(() => {
    onModeDeactivated?.();
  });

  // Handle preview mode activation and browser navigation prevention
  useEffect(() => {
    // Reset expanded resources when entering preview mode for clean UI state
    if (isOptimizerResultsPreviewMode) {
      dispatch(resetExpandedResources());
    }

    // Prevent browser refresh/close when optimizer data might be lost
    if (isOptimizerResultsPreviewMode || hasRunningOptimizerJobs) {
      window.onbeforeunload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };

      // Cleanup: Remove the beforeunload listener when component unmounts
      // or when preview mode/running jobs are no longer active
      return () => {
        window.onbeforeunload = null;
      };
    }
  }, [isOptimizerResultsPreviewMode, hasRunningOptimizerJobs, dispatch]);

  // Handle blocked navigation attempts with user confirmation
  useEffect(() => {
    if (blocker.state === 'blocked') {
      // Show confirmation dialog to user before allowing navigation
      const userConfirmed = window.confirm(
        'Are you sure you want to leave? You will lose the current optimizer results.',
      );

      // If user cancels, reset the blocker and stay on current page
      if (!userConfirmed) {
        blocker.reset();
        return;
      }

      // If user confirms, clean up optimizer state and cancel all running jobs
      dispatch(resetOptimizerResults());
      dispatch(cancelAllOptimizerJobs());
      blocker.proceed();
    }
  }, [blocker, dispatch]);

  // Trigger appropriate callback based on preview mode state changes
  useEffect(() => {
    if (isOptimizerResultsPreviewMode) {
      // Preview mode is active - trigger activation callback
      _onModeActivated();
    } else {
      // Preview mode is inactive - trigger deactivation callback
      _onModeDeactivated();
    }
  }, [isOptimizerResultsPreviewMode, _onModeActivated, _onModeDeactivated]);
}
