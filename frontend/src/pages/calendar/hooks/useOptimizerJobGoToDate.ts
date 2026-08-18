import { useCallback, useEffect } from 'react';
import moment from 'moment';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { changeBranch } from 'store/slices/calendar/thunks';
import type { IOptimizerJobItem } from 'types';

export function useOptimizerJobGoToDate({
  calendarApi,
  activeDay,
  activeView,
  handleSetActiveDayAndView,
}: {
  calendarApi: any;
  activeDay: string;
  activeView: string;
  handleSetActiveDayAndView: (arg: { day: string; view: string }) => void;
}) {
  const dispatch = useAppDispatch();
  const timezone = useAppSelector(
    (state) => state.settings.settingValues.timezone,
  );
  const calendarStartDate = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const currentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );

  const changeCalendarDate = useLatestCallback(
    ({ date, newActiveDay }: { date: string; newActiveDay: string }) => {
      calendarApi.batchRendering(() => {
        calendarApi.gotoDate(date);
        if (activeDay !== newActiveDay) {
          handleSetActiveDayAndView({
            day: newActiveDay,
            view: newActiveDay === 'Month' ? 'Timeline' : activeView,
          });
        }
      });
    },
  );

  const handleGoToDate = useCallback(
    (job: IOptimizerJobItem) => {
      const newActiveDay = moment(job.startDate)
        .tz(timezone)
        .startOf('day')
        .isSame(moment(job.endDate).tz(timezone).startOf('day'))
        ? 'Day'
        : 'Week';

      if (currentBranches?.[0]?.value !== job?.branch?.value) {
        dispatch(changeBranch(job?.branch));
        setTimeout(() => {
          changeCalendarDate({
            date: job.startDate,
            newActiveDay,
          });
        }, 10);
      } else if (
        moment(calendarStartDate).tz(timezone).format('YYYY-MM-DD') !==
          moment(job.startDate).tz(timezone).format('YYYY-MM-DD') ||
        activeDay !== newActiveDay
      ) {
        changeCalendarDate({
          date: job.startDate,
          newActiveDay,
        });
      }
    },
    [
      activeDay,
      calendarStartDate,
      currentBranches,
      timezone,
      changeCalendarDate,
      dispatch,
    ],
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const cEvent = event as CustomEvent<IOptimizerJobItem>;
      handleGoToDate(cEvent.detail);
    };

    window.addEventListener('optimizerJob:goToDate', handler);
    return () => {
      window.removeEventListener('optimizerJob:goToDate', handler);
    };
  }, [handleGoToDate]);
}
