import { useRef } from 'react';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useFullcalendarApiContext } from '../../context/FullcalendarApiContext';
import { useCurrentBranchTeamsHierarchy } from '../../hooks/useCurrentBranchTeamsHierarchy';
import { useFullcalendarSyncPrepareLatestEvents } from './useFullcalendarSyncPrepareLatestEvents';
import { useFullcalendarSyncPrepareLatestResources } from './useFullcalendarSyncPrepareLatestResources';

export function useFullcalendarSyncEventsResources() {
  // Context for FullCalendar API
  const { calendarApi } = useFullcalendarApiContext();

  const nextCalendarEvents = useRef<any[] | null>(null);
  const nextCalendarResources = useRef<any[] | null>(null);
  const calendarSyncTimer = useRef(-1);

  const { currentBranchTeamsHierarchy } = useCurrentBranchTeamsHierarchy();

  const syncCalendarEventsAndResources = useLatestCallback(() => {
    window.clearTimeout(calendarSyncTimer.current);
    calendarSyncTimer.current = window.setTimeout(() => {
      const events = nextCalendarEvents.current;
      const resources = nextCalendarResources.current;
      nextCalendarEvents.current = null;
      nextCalendarResources.current = null;
      (calendarApi as any).batchRendering(() => {
        if (events) {
          calendarApi?.removeAllEventSources();
          calendarApi?.addEventSource(events);
        }
        if (resources) {
          calendarApi?.getResources().forEach((item: any) => item.remove());
          resources.forEach((item: any) =>
            calendarApi?.addResource(item, false),
          );
        }
      });
    }, 4);
  });

  useFullcalendarSyncPrepareLatestEvents({
    currentBranchTeamsHierarchy,
    nextCalendarEvents,
    syncCalendar: syncCalendarEventsAndResources,
  });

  useFullcalendarSyncPrepareLatestResources({
    currentBranchTeamsHierarchy,
    nextCalendarResources,
    syncCalendar: syncCalendarEventsAndResources,
  });
}
