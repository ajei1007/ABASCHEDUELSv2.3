import { uniqBy } from 'lodash';
import { toast } from 'react-toastify';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setUndeleteEventsLoading } from 'store/slices/calendar/actions';
import { operateSelectedEvents } from 'store/slices/calendar/thunks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import { useCalendarCopyModeContext } from '../context/CalendarCopyModeContext';
import { useCalendarSelectedEventsContext } from '../context/CalendarSelectedEventsContext';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';

export function useCalendarUndeleteMultipleEventsHandler() {
  const dispatch = useAppDispatch();
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );

  // Context for copy mode
  const { copyModeActive } = useCalendarCopyModeContext();

  const { selectedEvents } = useCalendarSelectedEventsContext();

  // Context for selected resources
  const { resetAnySelected } = useCalendarSelectedResourcesContext();

  const handleUndelete = useLatestCallback(async () => {
    const supervisionActivitiesMap = storeActivityResources
      .filter((e) => e.supervision)
      .reduce(
        (acc, item) => acc.set(item.id, true),
        new Map<string, boolean>(),
      );

    let filteredEvents = selectedEvents.filter(
      (ev: any) =>
        // not include not-deleted
        ev.extendedProps.deletedAt &&
        // not include supervision activities
        !supervisionActivitiesMap.has(ev.extendedProps.activity0Id),
    );

    filteredEvents = uniqBy(filteredEvents, 'extendedProps.eventGroupId');

    if (filteredEvents?.length === 0) {
      toast.error('Nothing to undelete!');
      return;
    }

    dispatch(setUndeleteEventsLoading(true));
    try {
      const { success } = await dispatch(
        operateSelectedEvents({
          operations: {
            toBeUndeleted: {
              items: filteredEvents.map((event) => ({
                id: event?.id,
                eventGroupId: event?.extendedProps?.eventGroupId,
              })),
            },
          },
          availabilityObj: null,
          runFlagging: true,
          copyActive: copyModeActive,
        }),
      );
      if (success) {
        dispatch(
          checkNpsSurvey({
            chance: 1, // 100% chance to show NPS survey
          }),
        );
      }
    } catch (error) {
    } finally {
      resetAnySelected();
      dispatch(setUndeleteEventsLoading(false));
    }
  });

  return {
    handleUndelete,
  };
}
