import moment from 'moment';
import { useCallback } from 'react';
import { useAppSelector } from 'store/hooks';
import { duration_interval } from '../../constants';

export function useFullcalendarConfigSlotLaneDidMount({
  duration,
}: {
  duration: number;
}) {
  const settingsTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );

  const slotLaneDidMount = useCallback(
    (arg: any) => {
      const dayMoment = moment.tz(arg.date, settingsTimezone);
      const el = arg.el as HTMLDivElement;
      const date = dayMoment.isValid() ? dayMoment.format('YYYY-MM-DD') : '';
      const time = dayMoment.isValid() ? dayMoment.format('h:mma') : '';

      if (!el) {
        return;
      }

      el.setAttribute('data-qa', 'time-slot-lane');
      el.setAttribute('data-snap-duration', duration_interval[duration][0]);
      el.setAttribute(
        'data-slot-label-interval',
        duration_interval[duration][1],
      );

      if (time) {
        el.setAttribute('data-time', time);
      }
      if (date) {
        el.setAttribute('data-date-only', date);
      }
    },
    [settingsTimezone, duration],
  );

  return slotLaneDidMount;
}
