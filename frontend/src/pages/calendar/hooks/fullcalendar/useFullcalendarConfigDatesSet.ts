import { useCallback } from 'react';
import { useAppDispatch } from 'store/hooks';
import { updateCalendarTime } from 'store/slices/calendar/thunks';

export function useFullcalendarConfigDatesSet() {
  const dispatch = useAppDispatch();

  const datesSet = useCallback(
    (dateInfo: any) => {
      // localStorage.setItem('currentDate', dateInfo.view.currentStart.toISOString())
      dispatch(
        updateCalendarTime({
          start: dateInfo.startStr,
          end: dateInfo.endStr,
        }),
      );
    },
    [dispatch],
  );

  return datesSet;
}
