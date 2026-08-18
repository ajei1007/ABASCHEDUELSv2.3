import { useEffect } from 'react';
import { useAppDispatch } from 'store/hooks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';

/**
 * Custom hook that triggers an NPS (Net Promoter Score) survey check when the calendar page mounts.
 *
 * This hook is specifically designed for the calendar page to show NPS surveys to users
 * after they've had a chance to interact with the calendar functionality. The survey
 * is triggered with a short delay to ensure the page has fully loaded and the user
 * has had time to engage with the interface.
 *
 * The survey has a configurable probability of being shown (currently 90%) to avoid
 * overwhelming users while still gathering sufficient feedback data.
 */
export function useCalendarNpsSurveyTrigger() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Add a small delay before triggering the NPS survey check
    // This ensures the calendar page has fully rendered and the user
    // has had a moment to interact with the interface
    const timer = window.setTimeout(() => {
      dispatch(
        checkNpsSurvey({
          chance: 0.9, // 90% chance to show the NPS survey - allows for controlled feedback collection
        }),
      );
    }, 100); // 100ms delay for smooth user experience

    // Cleanup function to clear the timeout if the component unmounts
    // before the timer completes, preventing memory leaks
    return () => window.clearTimeout(timer);
  }, [dispatch]); // Only re-run if dispatch changes (which shouldn't happen in practice)
}
