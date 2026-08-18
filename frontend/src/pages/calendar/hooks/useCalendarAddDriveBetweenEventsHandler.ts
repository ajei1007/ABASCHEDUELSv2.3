import axios from 'axios';
import moment from 'moment';
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { operateSelectedEvents } from 'store/slices/calendar/thunks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { eventExtractFormatter } from '../utils/eventExtractFormatter';
import calculateTime from '../utils/distanceCalculator';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';
import { useCalendarSelectedEventsContext } from '../context/CalendarSelectedEventsContext';
import { useCalendarOptimizerJobUtilsContext } from '../context/CalendarOptimizerJobUtilsContext';

export function useCalendarAddDriveBetweenEventsHandler() {
  const dispatch = useAppDispatch();
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const storeLazyResources = useAppSelector(
    (state) => state.calendar.lazyResources,
  );
  const timeInterval = useAppSelector(
    (state) => state.settings.settingValues.timeInterval,
  );
  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );

  // Context for selected resources
  const { resetAnySelected } = useCalendarSelectedResourcesContext();

  const { hasOptimizerJobRunning } = useCalendarOptimizerJobUtilsContext();

  const { selectedEvents } = useCalendarSelectedEventsContext();

  const handleAddDriveBetweenEvent = useLatestCallback(async () => {
    let bol = true;
    if (selectedEvents.length !== 2) {
      bol = false;
      alert(
        `Exactly 2 appointments must be selected. Currently Selected: ${selectedEvents.length}`,
      );
      resetAnySelected();
      return;
    }

    if (
      hasOptimizerJobRunning(selectedEvents[0]) ||
      hasOptimizerJobRunning(selectedEvents[1])
    ) {
      alert(
        'One of the appointments is part of an optimizer job. Please remove from the optimizer job before adding a drive between.',
      );
      resetAnySelected();
      return;
    }

    let eventOrigin: ReturnType<typeof eventExtractFormatter> & {
      distance?: any;
      driveDuration?: any;
    } = eventExtractFormatter(selectedEvents[0]);
    let eventDestination: ReturnType<typeof eventExtractFormatter> & {
      distance?: any;
      driveDuration?: any;
    } = eventExtractFormatter(selectedEvents[1]);
    if (bol && !(eventOrigin.address && eventDestination.address)) {
      alert(
        'One of the appointments does not have an address attached. Please add.',
      );
      bol = false;
    }
    let drive_array = [];
    const drive_id = storeActivityResources.find(
      (e) => e.firstName === 'Drive',
    )?.id;
    if (
      bol &&
      drive_id &&
      (eventDestination.start < eventOrigin.end ||
        eventOrigin.start < eventDestination.end)
    ) {
      if (eventDestination.start < eventOrigin.end) {
        eventOrigin = eventDestination;
        eventDestination = eventOrigin;
      }
      let usersOrigin = eventOrigin.users.map((t: any) => t.value);
      let usersDestination = eventDestination.users.map((t: any) => t.value);
      const set2 = new Set(usersDestination);
      const userIntersection = usersOrigin.filter((value: any) =>
        set2.has(value),
      );
      for (let index = 0; index < userIntersection.length; index++) {
        const element = userIntersection[index];
        if (
          storeLazyResources
            .find((t) => t.id === element)
            ?.roles.includes('Employee')
        ) {
          let drive_end = cloneDeep(eventOrigin);
          try {
            const params = {
              address1: eventOrigin.address,
              address2: eventDestination.address,
            };
            const response = await axios.get(`/distancematrix/calculator`, {
              params,
            });
            const drive_info = response.data;

            if (drive_info['duration']) {
              const minutes = calculateTime(
                drive_info['duration'],
                timeInterval,
              );
              drive_end = {
                ...drive_end,
                id: uuidv4(),
                distance: drive_info['distance'],
                driveDuration: drive_info['duration'],
                start: eventOrigin.end,
                end: moment(eventOrigin.end).add(minutes, 'minutes').toDate(),
                timezone: storeSettingsValuesTimezone,
              };
              drive_end['users'] = [{ value: drive_id }, { value: element }];
              drive_array.push(drive_end);
            } else {
              alert('Error with one of the addresses');
            }
          } catch (error: any) {
            console.log(error.msg);
          }
        }
      }

      dispatch(
        operateSelectedEvents({
          operations: {
            toBeAdded: {
              items: [...drive_array],
            },
          },
          skipValidation: true,
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

    resetAnySelected();
  });

  return {
    handleAddDriveBetweenEvent,
  };
}
