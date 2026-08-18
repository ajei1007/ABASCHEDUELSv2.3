import { useCallback } from 'react';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import { useCalendarOptimizerJobUtilsContext } from '../../context/CalendarOptimizerJobUtilsContext';
import { operateSelectedEvents } from 'store/slices/calendar/thunks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/thunks';
import { eventExtractFormatter } from '../../utils/eventExtractFormatter';

export function useFullcalendarConfigEventReceive({
  hasCurrentDayHaveOptimizerJob,
}: {
  hasCurrentDayHaveOptimizerJob: boolean;
}) {
  const dispatch = useAppDispatch();
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );

  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );

  const storeSettingsValuesDefaultActivity = useAppSelector(
    (state) => state.settings.settingValues.defaultActivity,
  );

  const storeSettingsValuesDefaultLocation = useAppSelector(
    (state) => state.settings.settingValues.defaultLocation,
  );

  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );

  const sandboxMode = useAppSelector((state) => state.calendar.sandboxMode);

  const { hasOptimizerJobRunning } = useCalendarOptimizerJobUtilsContext();

  const handleReceiveEvent = useLatestCallback((info) => {
    // Prevents event duplication
    if (info?.event?.extendedProps?.createdAt) {
      // TODO ??
      // const id = info?.event?.id;
      // const foundEvent = calendarApi.getEventById(id);
      // info?.event.remove();
      // calendarApi.addEvent(foundEvent);
      return;
    }
    info.event.setProp('id', info.draggedEl.id);
    const class_name_arr = info.draggedEl.className.split(' ');
    const resources = info.event.getResources();
    const resource_roles = resources[0].extendedProps.roles;
    if (
      !(
        class_name_arr.includes('Employee') ||
        class_name_arr.includes('Client') ||
        resource_roles.includes('Person')
      )
    ) {
      alert(
        'Either the Dragged Resource or the Recieving Resource Must be a Person',
      );
    } else {
      let date1 = new Date(info.event.start);

      // Get default duration from dragged activity
      const matchedActivity = storeActivityResources?.find(
        (resource) => resource.id === info.event.id,
      );

      const defaultDuration = matchedActivity?.defaultDuration ?? 60;

      date1.setMinutes(date1.getMinutes() + defaultDuration);
      info.event.setEnd(date1);

      const draggableActivityId =
        info.event?.extendedProps?.draggableActivityId || 'Default';
      const draggableLocationId =
        info.event?.extendedProps?.draggableLocationId || 'Default';

      info.event.activity = draggableActivityId;
      info.event.setProp('activity', draggableActivityId);

      let location_real: string | null = draggableLocationId;

      let activity_real: string | null = draggableActivityId;

      if (draggableActivityId === 'Default') {
        if (
          storeSettingsValuesDefaultActivity &&
          typeof storeSettingsValuesDefaultActivity === 'string'
        ) {
          activity_real = storeSettingsValuesDefaultActivity;
        } else {
          activity_real = null;
        }
      }
      if (draggableLocationId === 'Default') {
        if (
          storeSettingsValuesDefaultLocation &&
          typeof storeSettingsValuesDefaultLocation === 'string'
        ) {
          location_real = storeSettingsValuesDefaultLocation;
        } else {
          location_real = null;
        }
      }

      let real_drag_users = [{ value: info.draggedEl.id }];
      if (
        !class_name_arr.includes('Activity') &&
        !resource_roles.includes('Activity') &&
        activity_real
      ) {
        real_drag_users = [...real_drag_users, { value: activity_real }];
      }
      if (
        !class_name_arr.includes('Location') &&
        !resource_roles.includes('Location') &&
        location_real
      ) {
        real_drag_users = [...real_drag_users, { value: location_real }];
      }
      info.event.setExtendedProp('drag_users', real_drag_users);
      const arr = info.event
        .getResources()
        .map((t: any) => {
          return { value: t.id };
        })
        .concat(real_drag_users);
      info.event.dragResources = arr.filter((item: any, index: any) => {
        return arr.map((e: any) => e.value).indexOf(item.value) === index;
      });
      info.event.setExtendedProp('timezone', storeSettingsValuesTimezone);
      info.event.setExtendedProp('sandboxMode', sandboxMode);

      const overbookingObj = eventExtractFormatter(info.event);
      dispatch(
        operateSelectedEvents({
          operations: {
            toBeAdded: {
              items: [overbookingObj],
            },
          },
        }),
      ).then(({ success }) => {
        if (success) {
          dispatch(
            checkNpsSurvey({
              chance: 1, // 100% chance to show NPS survey
            }),
          );
        }
      });
    }
    info.event.remove();
  });

  const eventReceive = useCallback(
    (info: any) => {
      if (
        isOptimizerResultsPreviewMode ||
        hasCurrentDayHaveOptimizerJob ||
        hasOptimizerJobRunning(info?.event, {
          getStartDate: (e) => e?.start,
          getEndDate: (e) => e?.end,
          endDateInclusive: true,
        })
      ) {
        info?.revert?.();
        return;
      }
      handleReceiveEvent(info);
    },
    [
      handleReceiveEvent,
      hasOptimizerJobRunning,
      isOptimizerResultsPreviewMode,
      hasCurrentDayHaveOptimizerJob,
    ],
  );

  return eventReceive;
}
