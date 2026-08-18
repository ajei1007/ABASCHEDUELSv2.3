import { useMemo } from 'react';
import { useAppSelector } from 'store/hooks';

/**
 * Custom hook that provides options for calendar total type selection.
 *
 * This hook retrieves total types from the calendar state and transforms them
 * into a format suitable for dropdown/select components. It includes a default
 * "Total All" option and dynamically adds options for each available total type.
 *
 * @returns {Array} An array of option objects with label and value properties
 *   - Each option contains:
 *     - label: Display text for the option
 *     - value: Unique identifier for the option
 */
export function useCalendarTotalTypeOptions() {
  // Get total types from the calendar state
  const totalTypes = useAppSelector((state) => state.calendar.totalTypes);

  // Memoize the options array to prevent unnecessary re-renders
  const totalTypeOptions = useMemo(() => {
    return [
      // Default option to show totals for all types
      {
        label: 'Total All',
        value: 'total',
      },
      // Map each total type to an option object
      ...totalTypes.map((resource) => ({
        value: resource.id,
        label: `Total ${resource.name}`,
      })),
    ];
  }, [totalTypes]); // Re-compute only when totalTypes changes

  return totalTypeOptions;
}
