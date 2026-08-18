import { useRef } from 'react';
import { useLatestCallback } from 'hooks/useLatestCallback';

export function useUpdateCalendarSize(calendarApi: any) {
  const calendarSizeUpdateTimer = useRef(-1);
  const updateCalendarSize = useLatestCallback((timeout = 200) => {
    window.clearTimeout(calendarSizeUpdateTimer.current);
    calendarSizeUpdateTimer.current = window.setTimeout(() => {
      if (calendarApi) {
        calendarApi.updateSize();
      }
    }, timeout);
  });

  return updateCalendarSize;
}
