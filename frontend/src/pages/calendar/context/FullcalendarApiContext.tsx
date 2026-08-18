import { useMemo, useContext, createContext, useState } from 'react';
import type { CalendarApi } from '@fullcalendar/core';
import { useUpdateCalendarSize } from '../hooks/useUpdateCalendarSize';

/**
 * Context type definition for the FullCalendar API management
 * This interface defines the shape of the context that provides access to the FullCalendar API instance
 * and the ability to update it throughout the component tree
 */
interface FullcalendarApiContextType {
  /** The FullCalendar API instance, null when not initialized */
  calendarApi: CalendarApi | null;
  /** Function to set or update the FullCalendar API instance */
  setCalendarApi: (api: CalendarApi | null) => void;

  /** Function to update the calendar size, useful for responsive layouts */
  updateCalendarSize: (timeout?: number) => void;
}

/**
 * React Context for managing the FullCalendar API instance
 *
 * This context provides a centralized way to share the FullCalendar API instance
 * across multiple components in the calendar feature. It enables components to:
 * - Access calendar methods (navigate, refresh, get events, etc.)
 * - Programmatically control calendar behavior
 * - Maintain a single source of truth for the calendar state
 *
 * The context is initialized with null and should be set once the calendar
 * component is mounted and the API becomes available.
 */
export const FullcalendarApiContext =
  createContext<FullcalendarApiContextType | null>(null);

// Set display name for better debugging experience
FullcalendarApiContext.displayName = 'FullcalendarApiContext';

/**
 * Custom hook to access the FullCalendar API context
 *
 * This hook provides a safe way to access the FullCalendar API context with
 * built-in error handling. It ensures that components using this hook are
 * properly wrapped within the FullcalendarApiContextProvider.
 *
 * @returns {FullcalendarApiContextType} The context value containing:
 *   - calendarApi: The FullCalendar API instance for programmatic control
 *   - setCalendarApi: Function to update the API instance
 *
 * @throws {Error} Throws an error if used outside of FullcalendarApiContextProvider
 *
 * @example
 * ```tsx
 * const { calendarApi, setCalendarApi } = useFullcalendarApiContext();
 *
 * // Navigate to next month
 * calendarApi?.next();
 *
 * // Get current events
 * const events = calendarApi?.getEvents();
 * ```
 */
export const useFullcalendarApiContext = () => {
  const context = useContext(FullcalendarApiContext);

  if (!context) {
    throw new Error(
      'useFullcalendarApiContext must be used within a FullcalendarApiContextProvider',
    );
  }

  return context;
};

/**
 * Props for the FullcalendarApiContextProvider component
 */
interface FullcalendarApiContextProviderProps {
  /** Child components that will have access to the FullCalendar API context */
  children: React.ReactNode;
}

/**
 * Context Provider component for FullCalendar API management
 *
 * This provider component wraps the calendar feature components and provides
 * access to the FullCalendar API instance throughout the component tree.
 * It manages the state of the calendar API and ensures efficient re-renders
 * through memoization.
 *
 * The provider should be placed at the root of the calendar feature to ensure
 * all child components can access the API when needed.
 *
 * @param {FullcalendarApiContextProviderProps} props - The provider props
 * @param {React.ReactNode} props.children - Child components to wrap
 *
 * @example
 * ```tsx
 * <FullcalendarApiContextProvider>
 *   <CalendarComponent />
 *   <CalendarControls />
 *   <EventModal />
 * </FullcalendarApiContextProvider>
 * ```
 */
export const FullcalendarApiContextProvider = ({
  children,
}: FullcalendarApiContextProviderProps) => {
  // State to hold the FullCalendar API instance
  // Initially null until the calendar component is mounted and provides the API
  const [calendarApi, setCalendarApi] = useState<CalendarApi | null>(null);

  const updateCalendarSize = useUpdateCalendarSize(calendarApi);

  // Memoize the context value to prevent unnecessary re-renders
  // Only updates when calendarApi changes, not when setCalendarApi reference changes
  const contextValue = useMemo(
    () => ({
      calendarApi,
      setCalendarApi,
      updateCalendarSize,
    }),
    [calendarApi, updateCalendarSize], // Removed setCalendarApi from dependency array as setState functions are stable
  );

  return (
    <FullcalendarApiContext.Provider value={contextValue}>
      {children}
    </FullcalendarApiContext.Provider>
  );
};
