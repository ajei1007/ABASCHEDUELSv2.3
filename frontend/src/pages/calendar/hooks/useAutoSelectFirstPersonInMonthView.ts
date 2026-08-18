import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { handleSetDisplayedUser } from 'store/slices/calendar/thunks';
import getCalendarView from '../utils/getCalendarView';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useCalendarViewContext } from '../context/CalendarViewContext';

/**
 * Custom hook that automatically selects the first available person when the calendar
 * view changes to month view, but only under specific conditions:
 *
 * Conditions for auto-selection:
 * - The calendar is in month view (dayGridMonth)
 * - No isolated resources are configured in settings (isolatedResources is empty or undefined)
 * - There are available persons (resources with 'Person' role and not hidden) in lazyResources
 *
 * When these conditions are met, the first available person is set as the displayed user in the calendar.
 * The effect runs whenever the calendar view or active day changes.
 */
export function useAutoSelectFirstPersonInMonthView() {
  const dispatch = useAppDispatch();

  // Get all lazy-loaded calendar resources (persons, locations, etc.)
  const lazyResources = useAppSelector((state) => state.calendar.lazyResources);

  // Get isolated resources setting; if set, prevents auto-selection
  const isolatedResources = useAppSelector(
    (state) => state.settings?.settingValues?.isolatedResources,
  );

  // Calendar view context (activeView and activeDay)
  const { activeView, activeDay } = useCalendarViewContext();

  /**
   * Callback to auto-select the first available person in month view.
   * - Only runs if calendarView is 'dayGridMonth' and isolatedResources is empty.
   * - Filters lazyResources for persons not hidden from calendar.
   * - Dispatches handleSetDisplayedUser for the first available person.
   */
  const autoSelectFirstPerson = useLatestCallback(
    (view: string, day: string) => {
      // Get the actual calendar view type
      const calendarView = getCalendarView(view, day);

      // Skip if not month view or if isolated resources are set
      if (calendarView !== 'dayGridMonth' || isolatedResources?.length !== 0) {
        return;
      }

      // Find available persons (role: 'Person', not hidden)
      const availablePersons =
        lazyResources?.filter(
          (resource) =>
            resource?.roles?.includes('Person') && !resource?.calendarhide,
        ) ?? [];

      // If no available persons, do nothing
      if (!availablePersons?.length) {
        return;
      }

      // Set the first available person as displayed user
      const firstPerson = {
        value: availablePersons[0]?.id,
        label: availablePersons[0]?.title,
      };

      dispatch(
        handleSetDisplayedUser({
          user: firstPerson,
        }),
      );
    },
  );

  /**
   * Effect: runs whenever the calendar view or active day changes.
   * Ensures the first person is auto-selected when switching to month view.
   */
  useEffect(() => {
    autoSelectFirstPerson(activeView, activeDay);
  }, [activeView, activeDay, autoSelectFirstPerson]);
}
