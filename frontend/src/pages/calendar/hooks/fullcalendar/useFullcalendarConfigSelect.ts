import moment from 'moment';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSelectedEvent } from 'store/slices/calendar/actions';
import { toggleEventFormDrawerOpen } from 'store/slices/calendarOverlayingPanels/actions';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { blankEvent } from '../../constants';
import { useCalendarOptimizerJobUtilsContext } from '../../context/CalendarOptimizerJobUtilsContext';

export function useFullcalendarConfigSelect({
  hasCurrentDayHaveOptimizerJob,
}: {
  hasCurrentDayHaveOptimizerJob: boolean;
}) {
  const dispatch = useAppDispatch();
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );
  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );
  const storeAvailabilities = useAppSelector(
    (state) => state.calendar.availabilities,
  );
  const storeLocationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );

  const { hasOptimizerJobRunning } = useCalendarOptimizerJobUtilsContext();

  const select = useLatestCallback((info: any) => {
    if (
      isOptimizerResultsPreviewMode ||
      hasCurrentDayHaveOptimizerJob ||
      hasOptimizerJobRunning(info, {
        getStartDate: (e) => e?.start,
        getEndDate: (e) => e?.end,
        endDateInclusive: true,
      })
    ) {
      return;
    }

    // Resources expanded block
    if (info?.resource?.extendedProps?.a) {
      return;
    }

    const ev: typeof blankEvent & {
      clients?: any[];
      employees?: any[];
      users?: any[];
      daysofweek?: any;
      resourceId?: string;
    } = { ...blankEvent }; // Clone blankEvent to avoid direct mutation
    ev.start = info.start;
    ev.end = info.end;

    ev.clients = [];
    ev.employees = [];

    const currentStart = moment(info.start)
      .tz(storeSettingsValuesTimezone)
      .format('YYYY-MM-DD');
    ev.daysofweek = [moment(currentStart).weekday()];

    if (info.resource) {
      ev.users = [info.resource.id];
      ev.resourceId = info.resource.id;
    }

    const a = moment(ev.start);
    const b = moment(ev.end);
    let location: any[] = [];

    storeAvailabilities
      .filter((e) => e?.resourceIds[0] === info?.resource?.id)
      .forEach((e) => {
        const c = moment(e.start);
        const d = moment(e.end);
        const lo = Math.max(Number(a), Number(c));
        const hi = Math.min(Number(b), Number(d));
        if (lo < hi) {
          location = e.location;
        }
      });

    if (location && location.length > 0 && ev.extendedProps) {
      ev.users = [...(ev.users || []), location[0]];
      const location_full = storeLocationResources.find(
        (e) => e.id === location[0],
      );

      // Clone extendedProps to ensure immutability
      const updatedExtendedProps = { ...(ev.extendedProps as any) };

      if (
        updatedExtendedProps.address &&
        location_full?.name === 'Home' &&
        info.resource.extendedProps.roles.includes('Client')
      ) {
        updatedExtendedProps.address = info.resource.extendedProps.address;
      } else if (location_full?.address) {
        updatedExtendedProps.address = location_full.address;
      }

      // Assign the updated object back to ev.extendedProps
      (ev.extendedProps as any) = updatedExtendedProps;
    }

    dispatch(setSelectedEvent(ev));
    dispatch(toggleEventFormDrawerOpen());
  });

  return select;
}
