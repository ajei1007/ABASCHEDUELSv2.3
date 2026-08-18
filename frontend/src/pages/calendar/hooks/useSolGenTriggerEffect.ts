import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { retriggerSolutionGeneratorJobs } from 'store/slices/solutionGenerator/actions';

/**
 * Interface defining the parameters for the solution generator trigger hook
 */
interface UseSolGenTriggerEffectProps {
  /** Flag indicating whether the solution generator jobs should be triggered */
  shouldTrigger: boolean;
}

/**
 * Custom hook that handles triggering of solution generator jobs based on calendar state
 *
 * This hook monitors the calendar's expanded resources and current branches,
 * and triggers solution generator jobs when requested. It uses memoization
 * to prevent unnecessary re-computations and ensures efficient state updates.
 *
 * @param props - Configuration object for the hook
 * @param props.shouldTrigger - Boolean flag to control when jobs should be triggered
 *
 * @example
 * ```typescript
 * // In a calendar component
 * const { shouldTrigger } = useSomeCondition();
 * useSolGenTriggerEffect({ shouldTrigger });
 * ```
 */
export function useSolGenTriggerEffect({
  shouldTrigger,
}: UseSolGenTriggerEffectProps) {
  const dispatch = useAppDispatch();

  // Select expanded resources from calendar state
  // These represent the resources currently visible/expanded in the calendar view
  const expandedResources = useAppSelector(
    (state) => state.calendar.expandedResources,
  );

  // Select current branches from calendar state
  // These represent the organizational branches currently being viewed
  const currentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );

  // Memoize the resource IDs to prevent unnecessary re-computations
  // This optimization ensures we only recalculate when expandedResources actually changes
  const resourceIds = useMemo(
    () => expandedResources.map((resource) => resource.id),
    [expandedResources],
  );

  // Memoize the branch ID to prevent unnecessary re-computations
  // Falls back to empty string if no branches are selected
  const branchId = useMemo(
    () => currentBranches[0]?.value || '',
    [currentBranches],
  );

  // Create a stable callback function that triggers solution generator jobs
  // useLatestCallback ensures the callback always uses the latest values
  // without causing unnecessary re-renders due to dependency changes
  const triggerSolutionGeneratorJobs = useLatestCallback(() => {
    // Early return if no resources are expanded
    if (resourceIds.length === 0) {
      return;
    }

    // Early return if no branch is selected
    if (!branchId) {
      return;
    }

    // Dispatch the retrigger action with current resource IDs and branch ID
    dispatch(
      retriggerSolutionGeneratorJobs({
        resourceIds,
        branchId,
      }),
    );
  });

  // Effect to handle the triggering logic
  // Only runs when shouldTrigger changes to true
  useEffect(() => {
    if (shouldTrigger) {
      // Trigger the solution generator jobs
      triggerSolutionGeneratorJobs();
    }
  }, [shouldTrigger, triggerSolutionGeneratorJobs]);
}
