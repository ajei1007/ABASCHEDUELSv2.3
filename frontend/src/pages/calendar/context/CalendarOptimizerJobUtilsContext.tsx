// Context and provider for calendar optimizer job utilities.
// This context exposes utility functions for working with optimizer jobs in the calendar view.
import { useMemo, useContext, createContext } from 'react';
import { useOptimizerFindJobByGivenDate } from '../hooks/useOptimizerFindJobByGivenDate';
import type { IOptimizerJobItem } from 'types';

/**
 * The shape of the context value for CalendarOptimizerJobUtilsContext.
 * Provides utility functions for finding and checking optimizer jobs by date.
 */
interface CalendarOptimizerJobUtilsContextType {
  /**
   * Finds an optimizer job by a given date range.
   * @param params - Object containing startDate, endDate, and optional endDateInclusive.
   * @returns The matching IOptimizerJobItem or null if not found.
   */
  findOptimizerJobByGivenDate: ({
    startDate,
    endDate,
    endDateInclusive,
  }: {
    startDate: any;
    endDate: any;
    endDateInclusive?: boolean;
  }) => IOptimizerJobItem | null;

  /**
   * Checks if an optimizer job is running for a given event.
   * @param event - The event to check.
   * @param options - Optional functions to get start/end dates and endDateInclusive flag.
   * @returns True if a job is running, false otherwise.
   */
  hasOptimizerJobRunning: (
    event: any,
    data?: {
      getStartDate?: ((event: any) => any) | undefined;
      getEndDate?: ((event: any) => any) | undefined;
      endDateInclusive?: boolean | undefined;
    },
  ) => boolean;
}

/**
 * React context for calendar optimizer job utilities.
 * Use the provider to supply context value to consumers.
 */
export const CalendarOptimizerJobUtilsContext =
  createContext<CalendarOptimizerJobUtilsContextType | null>(null);
CalendarOptimizerJobUtilsContext.displayName =
  'CalendarOptimizerJobUtilsContext';

/**
 * Custom hook to access the CalendarOptimizerJobUtilsContext.
 * Throws an error if used outside the provider.
 */
export const useCalendarOptimizerJobUtilsContext = () => {
  const context = useContext(CalendarOptimizerJobUtilsContext);
  if (!context) {
    throw new Error(
      'useCalendarOptimizerJobUtilsContext must be used within a CalendarOptimizerJobUtilsContextProvider',
    );
  }
  return context;
};

/**
 * Props for CalendarOptimizerJobUtilsContextProvider.
 */
interface CalendarOptimizerJobUtilsContextProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for CalendarOptimizerJobUtilsContext.
 * Supplies utility functions for optimizer job lookups to its children.
 */
export const CalendarOptimizerJobUtilsContextProvider = ({
  children,
}: CalendarOptimizerJobUtilsContextProviderProps) => {
  // Get utility functions from custom hook
  const { findOptimizerJobByGivenDate, hasOptimizerJobRunning } =
    useOptimizerFindJobByGivenDate();

  // Memoize context value to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      findOptimizerJobByGivenDate,
      hasOptimizerJobRunning,
    }),
    [findOptimizerJobByGivenDate, hasOptimizerJobRunning],
  );
  return (
    <CalendarOptimizerJobUtilsContext.Provider value={contextValue}>
      {children}
    </CalendarOptimizerJobUtilsContext.Provider>
  );
};
