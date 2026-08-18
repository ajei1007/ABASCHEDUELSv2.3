import { useEffect } from 'react';
import { useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useCalendarViewContext } from '../context/CalendarViewContext';

/**
 * Automatically switches the calendar view to 'Timeline' when the user navigates
 * from the highest-level branch to a lower-level branch in the hierarchy.
 *
 * When users drill down into branch hierarchies, the Timeline view is shown for more detailed schedules
 * at lower organizational levels. This effect is triggered only when the branch hierarchy changes
 * and the conditions for switching are met.
 */
export function useCalendarViewSwitchOnBranchHierarchyChange() {
  // Current branch selection from the store
  const currentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );

  // Whether the current branch is at the highest level in the hierarchy
  const isCurrentBranchLevelHighest = useAppSelector(
    (state) => state.calendar.isCurrentBranchLevelHighest,
  );

  // Calendar view context
  const { activeView, handleSetActiveDay } = useCalendarViewContext();

  /**
   * Switches to Timeline view when moving from highest-level to lower-level branches.
   * Uses useLatestCallback to prevent stale closures.
   *
   * Accepts branch hierarchy state, current branches, and calendar API to ensure up-to-date data.
   */
  const handleBranchHierarchyChange = useLatestCallback(
    ({
      isBranchLevelHighest,
      currentBranches = [],
    }: {
      isBranchLevelHighest: boolean;
      currentBranches?: string[];
    }) => {
      // Switch to Timeline view if all conditions are met:
      // 1. User is not at the highest branch level (has drilled down)
      // 2. The current view is not already 'Timeline' (prevents redundant updates)
      // 3. At least one branch is selected (ensures valid branch context)
      // 4. The selected branch is not 'lk' (special case excluded)
      if (
        !isBranchLevelHighest &&
        activeView !== 'Timeline' &&
        currentBranches?.[0] &&
        currentBranches?.[0] !== 'lk'
      ) {
        handleSetActiveDay('view', 'Timeline');
      }
    },
  );

  // Effect: triggers when branch hierarchy level or branches change.
  // Calls the handler with current state values to ensure the switching logic uses up-to-date data.
  useEffect(() => {
    handleBranchHierarchyChange({
      isBranchLevelHighest: isCurrentBranchLevelHighest,
      currentBranches,
    });
  }, [
    currentBranches,
    isCurrentBranchLevelHighest,
    handleBranchHierarchyChange,
  ]);
}
