import {
  useMemo,
  useContext,
  createContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import getCalendarView from '../utils/getCalendarView';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useFullcalendarApiContext } from './FullcalendarApiContext';

/**
 * CalendarViewContextType defines the shape of the context value for calendar view state management.
 */
interface CalendarViewContextType {
  /** Currently selected day (e.g., 'Day', 'Month') */
  activeDay: string;
  /** Currently selected calendar view (e.g., 'Timeline', 'Timegrid') */
  activeView: string;
  /** Whether the week view is expanded */
  weekExpanded: boolean;

  /** Toggle the expanded/collapsed state of the week view */
  toggleWeekExpanded: () => void;
  /** Set the active day and optionally update the view */
  handleSetActiveDay: (type: string, day: string) => void;
  /** Set both the active day and view together */
  handleSetActiveDayAndView: (arg: { day: string; view: string }) => void;
}

/**
 * Context for sharing calendar view state and actions across components.
 */
export const CalendarViewContext =
  createContext<CalendarViewContextType | null>(null);

// Set a display name for easier debugging in React DevTools
CalendarViewContext.displayName = 'CalendarViewContext';

/**
 * Custom hook to access the CalendarViewContext safely.
 * Throws an error if used outside the provider.
 */
export const useCalendarViewContext = () => {
  const context = useContext(CalendarViewContext);

  if (!context) {
    throw new Error(
      'useCalendarViewContext must be used within a CalendarViewContextProvider',
    );
  }

  return context;
};

/**
 * Props for CalendarViewContextProvider
 */
interface CalendarViewContextProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for CalendarViewContext.
 * Manages calendar view state and exposes actions to update it.
 */
export const CalendarViewContextProvider = ({
  children,
}: CalendarViewContextProviderProps) => {
  // Access FullCalendar API from context
  const { calendarApi } = useFullcalendarApiContext();

  // State for currently active day, initialized from localStorage or default
  const [activeDay, setActiveDay] = useState(() => {
    const defaultViewStr = localStorage.getItem('defaultView');
    const storedValue = defaultViewStr ? JSON.parse(defaultViewStr) : null;
    return storedValue?.day ?? 'Day';
  });
  // State for currently active view, initialized from localStorage or default
  const [activeView, setActiveView] = useState(() => {
    const defaultViewStr = localStorage.getItem('defaultView');
    const storedValue = defaultViewStr ? JSON.parse(defaultViewStr) : null;
    return storedValue?.view ?? 'Timeline';
  });
  // State for week expanded/collapsed, initialized from localStorage
  const [weekExpanded, setWeekExpanded] = useState(() => {
    const weekExpandedStr = localStorage.getItem('weekExpanded');
    return weekExpandedStr === 'true';
  });

  /**
   * Toggles the expanded/collapsed state of the week view.
   */
  const toggleWeekExpanded = useCallback(() => {
    setWeekExpanded((prev) => !prev);
  }, []);

  /**
   * Sets the active day or view based on type and value.
   * Also triggers FullCalendar view change if needed.
   * @param type - 'day' or 'view'
   * @param value - new day or view value
   */
  const handleSetActiveDay = useLatestCallback(
    (type: string, value: string) => {
      let day = '';
      let view = '';

      // Reset selection state if day changes (TODO: implement logic)
      if (activeDay !== value) {
        // setCopyActive(false);
        // setSelectedEvents([]);
        // uncheckAll();
      }

      if (type === 'day') {
        day = value;
        view = value === 'Month' ? 'Timegrid' : activeView;
        setActiveDay(day);
        if (value === 'Month') {
          setActiveView(view);
        }
      } else {
        day = activeDay;
        view = value;
        setActiveView(view);
      }

      // Change FullCalendar view if applicable
      const calendarView = getCalendarView(view, day);
      if (calendarView) {
        window.setTimeout(() => {
          calendarApi?.changeView(calendarView);
        });
      }
    },
  );

  /**
   * Sets both the active day and view together.
   * Also triggers FullCalendar view change if needed.
   * @param data - object with day and view
   */
  const handleSetActiveDayAndView = useLatestCallback(
    ({ day, view }: { day: string; view: string }) => {
      // Reset selection state if day changes (TODO: implement logic)
      if (activeDay !== day) {
        // setCopyActive(false);
        // setSelectedEvents([]);
        // uncheckAll();
      }

      // If day is 'Month', force view to 'Timegrid'
      if (day === 'Month') {
        view = 'Timegrid';
      }

      if (activeDay !== day) {
        setActiveDay(day);
      }

      if (activeView !== view) {
        setActiveView(view);
      }

      // Change FullCalendar view if applicable
      const calendarView = getCalendarView(view, day);
      if (calendarView) {
        window.setTimeout(() => {
          calendarApi?.changeView(calendarView);
        });
      }
    },
  );

  /**
   * Persist weekExpanded state to localStorage whenever it changes.
   * This ensures user's week view preference is saved across sessions.
   */
  useEffect(() => {
    try {
      localStorage.setItem('weekExpanded', `${weekExpanded}`);
    } catch (error) {
      // Handle localStorage access errors (e.g., incognito mode, storage full)
      console.warn('Failed to access localStorage for weekExpanded:', error);
    }
  }, [weekExpanded]);

  /**
   * Persist activeDay and activeView to localStorage whenever either changes.
   * This allows restoring the user's last selected view and day on reload.
   */
  useEffect(() => {
    try {
      // Validate current values before storing
      if (typeof activeView === 'string' && typeof activeDay === 'string') {
        localStorage.setItem(
          'defaultView',
          JSON.stringify({
            view: activeView,
            day: activeDay,
          }),
        );
      }
    } catch (error) {
      // Handle localStorage access errors (e.g., incognito mode, storage full)
      console.warn('Failed to access localStorage for defaultView:', error);
    }
  }, [activeDay, activeView]);

  /**
   * Memoize the context value to prevent unnecessary re-renders of consumers.
   * Only updates when any of the dependencies change.
   */
  const contextValue = useMemo(
    () => ({
      activeDay,
      activeView,
      weekExpanded,
      toggleWeekExpanded,
      handleSetActiveDay,
      handleSetActiveDayAndView,
    }),
    [
      activeDay,
      activeView,
      weekExpanded,
      toggleWeekExpanded,
      handleSetActiveDay,
      handleSetActiveDayAndView,
    ],
  );

  // Provide context to children
  return (
    <CalendarViewContext.Provider value={contextValue}>
      {children}
    </CalendarViewContext.Provider>
  );
};
