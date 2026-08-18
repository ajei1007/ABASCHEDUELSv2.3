import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { EventApi } from '@fullcalendar/core';
import { uniqBy } from 'lodash';
import { useAppSelector } from 'store/hooks';
import {
  selectCalendarEvents,
  selectCalendarSupervisionEventsMap,
} from 'store/slices/calendar/selectors';
import { useFullcalendarApiContext } from './FullcalendarApiContext';
import { useLatestCallback } from 'hooks/useLatestCallback';

/**
 * Context type describing all values and actions for selected events in calendar
 * @typedef {Object} CalendarSelectedEventsContextType
 * @property {EventApi[]} selectedEvents - Array of currently selected events
 * @property {Function} toggleSelectedEvent - Function to toggle selection of an event
 * @property {Function} setSelectedEvents - Function to update selected events
 * @property {() => void} unselectAllEvents - Unselect all currently selected events
 */
interface CalendarSelectedEventsContextType {
  selectedEvents: EventApi[];
  toggleSelectedEvent: (event: EventApi) => void;
  setSelectedEvents: (events: EventApi[]) => void;
  unselectAllEvents: () => void;
}

/**
 * React Context for selected calendar events. Default value is null.
 *
 * @type {React.Context<CalendarSelectedEventsContextType | null>}
 */
export const CalendarSelectedEventsContext =
  createContext<CalendarSelectedEventsContextType | null>(null);

CalendarSelectedEventsContext.displayName = 'CalendarSelectedEventsContext';

export const useCalendarSelectedEventsContext =
  (): CalendarSelectedEventsContextType => {
    const context = useContext(CalendarSelectedEventsContext);

    if (!context) {
      throw new Error(
        'useCalendarSelectedEventsContext must be used within a CalendarSelectedEventsContextProvider',
      );
    }

    return context;
  };

/**
 * Props for CalendarSelectedEventsContextProvider
 * @typedef {Object} CalendarSelectedEventsContextProviderProps
 * @property {React.ReactNode} children - Child components to be wrapped by the provider
 */
interface CalendarSelectedEventsContextProviderProps {
  children: React.ReactNode;
}

export const CalendarSelectedEventsContextProvider = ({
  children,
}: CalendarSelectedEventsContextProviderProps): JSX.Element => {
  const storeEvents = useAppSelector(selectCalendarEvents);
  const supervisionEventsMap = useAppSelector(
    selectCalendarSupervisionEventsMap,
  );

  // Access the FullCalendar API context
  const { calendarApi } = useFullcalendarApiContext();

  // State for selected events and "all selected" toggle
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);

  // Function to toggle selection of an event
  const toggleSelectedEvent = useLatestCallback((event: EventApi) => {
    const eventGroupId = event.extendedProps?.eventGroupId;
    if (
      selectedEvents.some(
        (p) =>
          p.extendedProps.eventGroupId === eventGroupId &&
          p?.extendedProps?.updatedBy === event?.extendedProps?.updatedBy,
      )
    ) {
      let filteredSelectedEvents = selectedEvents.filter(
        (p) =>
          !(
            p.extendedProps.eventGroupId === eventGroupId &&
            p?.extendedProps?.updatedBy === event?.extendedProps?.updatedBy
          ) &&
          // Exclude supervision events on every event select click for consistency
          !supervisionEventsMap.has(p.id),
      );
      filteredSelectedEvents = uniqBy(filteredSelectedEvents, 'id');
      setSelectedEvents(filteredSelectedEvents);
    } else if (
      !supervisionEventsMap.has(event.id) &&
      storeEvents.some((e) => e.eventGroupId === eventGroupId)
    ) {
      const calendarEvents = calendarApi?.getEvents() || [];
      const events = calendarEvents.filter(
        (e: any) =>
          e?.extendedProps?.eventGroupId === eventGroupId &&
          // Exclude supervision events
          !supervisionEventsMap.has(e.id),
      );
      setSelectedEvents([...selectedEvents, ...events]);
    }
  });

  const setSelectedEventsCallback = useCallback((events: any[]) => {
    setSelectedEvents(events);
  }, []);

  /**
   * Clears all selected events.
   *
   * @function
   * @returns {void}
   */
  const unselectAllEvents = useCallback((): void => {
    setSelectedEvents([]);
  }, []);

  /**
   * Memoized context value to avoid unnecessary re-renders.
   *
   * @type {CalendarSelectedEventsContextType}
   */
  const contextValue = useMemo(
    () => ({
      selectedEvents,
      toggleSelectedEvent,
      setSelectedEvents: setSelectedEventsCallback,
      unselectAllEvents,
    }),
    [selectedEvents, toggleSelectedEvent, setSelectedEvents, unselectAllEvents],
  );

  // Provide context to children
  return (
    <CalendarSelectedEventsContext.Provider value={contextValue}>
      {children}
    </CalendarSelectedEventsContext.Provider>
  );
};
