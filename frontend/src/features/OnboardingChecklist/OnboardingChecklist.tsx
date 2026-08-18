import { memo, useEffect } from 'react';
import { Stack } from '@mui/material';
import { useAppDispatch } from 'store/hooks';
import { fetchOnboardingChecklist } from 'store/slices/onboardingChecklist/actions';
import OnboardingChecklistHeader from './components/OnboardingChecklistHeader/OnboardingChecklistHeader';
import OnboardingChecklistBody from './components/OnboardingChecklistBody/OnboardingChecklistBody';
import { useOnboardingChecklistSyncWithInterval } from './hooks/useOnboardingChecklistSyncWithInterval';

/**
 * OnboardingChecklist Component
 *
 * A comprehensive onboarding checklist component that displays a list of tasks
 * or steps that users need to complete during their onboarding process.
 *
 * Features:
 * - Fetches onboarding checklist data on component mount
 * - Automatically syncs data with server at regular intervals
 * - Displays a header with checklist information
 * - Shows the main checklist body with interactive items
 * - Responsive design with proper styling and spacing
 *
 * @component
 * @example
 * ```tsx
 * <OnboardingChecklist />
 * ```
 *
 * @returns {JSX.Element} The rendered onboarding checklist component
 */
const OnboardingChecklist = () => {
  // Get dispatch function for Redux actions
  const dispatch = useAppDispatch();

  /**
   * Effect hook to fetch onboarding checklist data when component mounts
   * This ensures the latest checklist data is loaded when the component initializes
   */
  useEffect(() => {
    dispatch(fetchOnboardingChecklist());
  }, []); // Empty dependency array means this runs only on mount

  /**
   * Custom hook that handles automatic synchronization of onboarding checklist data
   * with the server at predefined intervals to keep data fresh
   */
  useOnboardingChecklistSyncWithInterval();

  return (
    <Stack
      height='100%'
      rowGap={2}
      flexDirection='column'
      sx={{
        // Container styling for the checklist
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
        border: '1px solid rgba(0, 0, 0, 0.1)', // Light border
        px: '1rem', // Horizontal padding
        py: '1.25rem', // Vertical padding
      }}
    >
      {/* Header section containing checklist title and summary information */}
      <OnboardingChecklistHeader />

      {/* Main body section containing the actual checklist items */}
      <OnboardingChecklistBody />
    </Stack>
  );
};

OnboardingChecklist.displayName = 'OnboardingChecklist';

// Export memoized component to prevent unnecessary re-renders
// when parent component re-renders but props haven't changed
export default memo(OnboardingChecklist);
