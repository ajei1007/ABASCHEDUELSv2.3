import { useMemo } from 'react';
import moment from 'moment';
import { useAppSelector } from 'store/hooks';
import { useCalendarViewContext } from '../context/CalendarViewContext';
import { useCalendarOptimizerJobUtilsContext } from '../context/CalendarOptimizerJobUtilsContext';

export function useCurrentDaysOptimizerJob() {
  const { findOptimizerJobByGivenDate } = useCalendarOptimizerJobUtilsContext();

  const storeCalendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const storeCalendarEnd = useAppSelector(
    (state) => state.calendar.calendar_end,
  );

  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );

  // Context for active day and view
  const { activeDay } = useCalendarViewContext();

  const currentDaysOptimizerJob = useMemo(() => {
    if (!['Week', 'Day'].includes(activeDay)) {
      return null;
    }

    return findOptimizerJobByGivenDate({
      startDate: moment
        .tz(storeCalendarStart, storeSettingsValuesTimezone)
        .startOf('day')
        .format(),
      endDate: moment
        .tz(storeCalendarEnd, storeSettingsValuesTimezone)
        .startOf('day')
        .format(),
      endDateInclusive: false,
    });
  }, [
    activeDay,
    storeCalendarStart,
    storeCalendarEnd,
    storeSettingsValuesTimezone,
    findOptimizerJobByGivenDate,
  ]);

  const hasCurrentDayHaveOptimizerJob = currentDaysOptimizerJob !== null;

  return {
    currentDaysOptimizerJob,
    hasCurrentDayHaveOptimizerJob,
  };
}
