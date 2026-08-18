import { uniqBy } from 'lodash';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useCalendarOptimizerJobUtilsContext } from '../context/CalendarOptimizerJobUtilsContext';
import { useCalendarSelectedEventsContext } from '../context/CalendarSelectedEventsContext';
import { useCalendarCopyModeContext } from '../context/CalendarCopyModeContext';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';
import { useFullcalendarApiContext } from '../context/FullcalendarApiContext';
import { useExtendEventsWithRecurringInfo } from '../hooks/useExtendEventsWithRecurringInfo';
import { prepareToBeUpdatedEvents } from '../utils/prepareToBeUpdatedEvents';
import { eventExtractFormatter } from '../utils/eventExtractFormatter';
import { formatEventOptions } from '../utils/eventOptionsFormatter';
import { eventOptions } from '../constants';
import { getEventUpdateType } from '../utils/getEventUpdateType';
import {
  operateSelectedEvents,
  fetchEventGroups,
} from 'store/slices/calendar/thunks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import type { IApiCalendarEventGroupItem } from 'types/api';

const formatBeingUpdatedEvents = (
  _droppedEvents: any[],
  _selectedEvents: any[],
  _newUserIds: any[],
) => {
  return _droppedEvents.map((de) => {
    const event = de;
    const oldEvent = _selectedEvents.find((se) => se.id === de.id);

    if (event?.extendedProps?.supervisionUsers?.length) {
      const supervisionUsers = event.extendedProps.supervisionUsers;
      const updatedEventResourceIds = event._def.resourceIds;
      const oldEventResourceIds = oldEvent._def.resourceIds;

      const newRId = updatedEventResourceIds.filter(
        (rId: any) => !oldEventResourceIds.includes(rId),
      );
      const oldRId = oldEventResourceIds.filter(
        (rId: any) => !updatedEventResourceIds.includes(rId),
      );

      // If event is being dragging into resource of supervision, then remove supervision
      const isDragginIntoSupervisionUsers =
        supervisionUsers.filter((rId: any) => newRId.includes(rId))?.length > 0;
      if (isDragginIntoSupervisionUsers) {
        event.setExtendedProp('supervisionUsers', null);
      } else {
        // Properly updating supervision resources
        const updatedSupervisionEvents = supervisionUsers.filter(
          (uId: any) => !oldRId.includes(uId),
        );
        event.setExtendedProp('supervisionUsers', updatedSupervisionEvents);
      }
    }

    const eventUserIds = event?.extendedProps?._newUserIds ?? _newUserIds;
    event.setExtendedProp('users', eventUserIds);
    return {
      newEvent: event,
      oldEvent,
    };
  });
};

export function useCalendarReplaceEventsHandler({
  updateSelectedEventsModalRef,
  changeAffectedEventsModalRef,
}: {
  updateSelectedEventsModalRef: React.RefObject<{
    show: (props: any) => Promise<{
      isSubmit: boolean;
      payload?: any;
      stale?: boolean;
    }>;
  }>;
  changeAffectedEventsModalRef: React.RefObject<{
    show: (props: any) => Promise<{
      isSubmit: boolean;
      payload?: any;
      stale?: boolean;
    }>;
  }>;
}) {
  const dispatch = useAppDispatch();

  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );

  const storeCalendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const storeCalendarEnd = useAppSelector(
    (state) => state.calendar.calendar_end,
  );

  // Get the FullCalendar API context
  const { calendarApi } = useFullcalendarApiContext();

  const { hasOptimizerJobRunning } = useCalendarOptimizerJobUtilsContext();

  const { selectedEvents } = useCalendarSelectedEventsContext();

  // Context for copy mode
  const { copyModeActive } = useCalendarCopyModeContext();

  // Context for selected resources
  const { resetAnySelected } = useCalendarSelectedResourcesContext();

  const { extendUpdatingEventsWithRecurringInfo } =
    useExtendEventsWithRecurringInfo({
      eventDateRangeExtractor: (event: any) => ({
        startDate: event.extendedProps.startRecur1,
        endDate: event.extendedProps.endRecur1,
      }),
      eventGroupIdExtractor: (event: any) => event.extendedProps.eventGroupId,
    });

  const handleReplaceEvents = useLatestCallback(async (eventInfo) => {
    const {
      event: resizedEvent,
      oldEvent: resizedOldEvent,
      relatedEvents,
      newResource,
      oldResource,
      revert: revertAction,
    } = eventInfo;

    if (hasOptimizerJobRunning(resizedEvent)) {
      revertAction();
      return;
    }

    if (resizedEvent?._def?.resourceIds?.length === 0) {
      revertAction();
      return;
    }

    let _relatedEvents =
      relatedEvents.length === 0 ? [] : [...relatedEvents, resizedEvent];

    let droppedEvents = uniqBy(_relatedEvents, 'extendedProps.eventGroupId');
    const isMultiSelect = droppedEvents.length;

    const newResourceId = newResource?.id;
    const oldResourceId = oldResource?.id;
    const newUserIds = [
      ...new Set(
        [...resizedEvent._def.resourceIds, newResourceId]?.filter(
          (rId) => rId !== oldResourceId,
        ),
      ),
    ];
    droppedEvents.forEach((dE) => {
      const _newUserIds = [
        ...new Set(
          [...dE._def.resourceIds, newResourceId]?.filter(
            (rId) => rId !== oldResourceId,
          ),
        ),
      ];
      dE.setExtendedProp('_newUserIds', _newUserIds);
    });

    let groups: IApiCalendarEventGroupItem[] = [];
    let groupsIsFetched = false;

    let beingUpdatedEvents = await extendUpdatingEventsWithRecurringInfo({
      events: isMultiSelect
        ? formatBeingUpdatedEvents(droppedEvents, selectedEvents, newUserIds)
        : formatBeingUpdatedEvents(
            [resizedEvent],
            [resizedOldEvent],
            newUserIds,
          ),

      onEventGroupsFetched(_groups) {
        groups = _groups;
        groupsIsFetched = true;
      },
    });

    const view_type = calendarApi?.view.type!;

    // Preserve for update selected recurring events only for calendar daily, for now
    if (!['Day_Timeline', 'resourceTimeGridDay'].includes(view_type)) {
      beingUpdatedEvents = beingUpdatedEvents.filter(
        (item) => !item.isRecurring,
      );
    }

    // Detect does one of the drag&dropped events changed date
    const updateLevel = beingUpdatedEvents.some((item) => {
      const newEventStartDate = moment(item.newEvent.start).tz(
        storeSettingsValuesTimezone,
      );
      const newEventEndDate = moment(item.newEvent.end).tz(
        storeSettingsValuesTimezone,
      );
      const oldEventStartDate = moment(item.oldEvent.start).tz(
        storeSettingsValuesTimezone,
      );
      const oldEventEndDate = moment(item.oldEvent.end).tz(
        storeSettingsValuesTimezone,
      );

      return !(
        newEventStartDate.isSame(oldEventStartDate, 'day') &&
        newEventEndDate.isSame(oldEventEndDate, 'day')
      );
    })
      ? 'RRULE'
      : 'SIMPLE';

    beingUpdatedEvents = beingUpdatedEvents.map((e) => ({
      newEvent: eventExtractFormatter(e.newEvent),
      oldEvent: eventExtractFormatter(e.oldEvent),
      isRecurring: e.isRecurring,
    }));

    const recurringEvents = beingUpdatedEvents.filter((ev) => ev.isRecurring);

    if (recurringEvents.length === 0) {
      updateEvents({
        toBeUpdated: prepareToBeUpdatedEvents({
          // only cases which (RRULE, ALL) or (SIMPLE, ALL)
          events: beingUpdatedEvents.map(({ oldEvent, newEvent }) => {
            const newEventStartDate = moment(newEvent.start).tz(
              storeSettingsValuesTimezone,
            );
            const newEventStartDatePlusOneDay = newEventStartDate
              .clone()
              .add(1, 'days');
            return {
              oldEvent,
              newEvent: {
                ...newEvent,
                startRecur: newEventStartDate.format('YYYY-MM-DD'),
                endRecur: newEventStartDatePlusOneDay.format('YYYY-MM-DD'),
              },
            };
          }),
          updateType: 'ALL',
          updateLevel,
          calendarStartDate: storeCalendarStart,
          calendarEndDate: storeCalendarEnd,
          timezone: storeSettingsValuesTimezone,
        }),
        revertFunction: revertAction,
      });
      return;
    }

    if (!updateSelectedEventsModalRef.current) {
      console.warn(
        'updateSelectedEventsModalRef ref is not attached to component',
      );
      return;
    }

    const result = await updateSelectedEventsModalRef.current.show({
      showSelectInput: true,
      options: formatEventOptions({
        eventOptions,
        updateLevel,
      }),
    });
    if (!result.isSubmit) {
      if (!result.stale) {
        revertAction();
      }
      return;
    }

    const selectedUpdateOptionIndex = result.payload;
    const updateType = getEventUpdateType(selectedUpdateOptionIndex);
    const toBeUpdatedEvents = prepareToBeUpdatedEvents({
      // cases which (ONLY, SIMPLE) or (ONLY, RRULE, not-recurring)
      events: beingUpdatedEvents.map(({ oldEvent, newEvent, isRecurring }) => {
        const newEventStartDate = moment(newEvent.start).tz(
          storeSettingsValuesTimezone,
        );
        const newEventStartDatePlusOneDay = newEventStartDate
          .clone()
          .add(1, 'days');
        return {
          oldEvent,
          newEvent:
            updateType === 'ONLY' && (updateLevel === 'SIMPLE' || !isRecurring)
              ? {
                  ...newEvent,
                  startRecur: newEventStartDate.format('YYYY-MM-DD'),
                  endRecur: newEventStartDatePlusOneDay.format('YYYY-MM-DD'),
                }
              : newEvent,
        };
      }),
      updateType,
      updateLevel,
      calendarStartDate: storeCalendarStart,
      calendarEndDate: storeCalendarEnd,
      timezone: storeSettingsValuesTimezone,
    });

    // Check whether selected only-this-event update type
    if (updateType === 'ONLY') {
      updateEvents({
        toBeUpdated: toBeUpdatedEvents,
        revertFunction: revertAction,
      });
      return;
    }

    if (!groupsIsFetched) {
      const groupIds = recurringEvents.map(
        ({ newEvent }) => newEvent.eventGroupId,
      );
      groups = await dispatch(fetchEventGroups(groupIds));
      groupsIsFetched = true;
    }

    // Check whether one of groups has multiple event members
    if (groups.some((item) => item.count > 1)) {
      if (!changeAffectedEventsModalRef.current) {
        console.warn(
          'changeAffectedEventsModalRef ref is not attached to component',
        );
        return;
      }

      const result = await changeAffectedEventsModalRef.current.show({
        eventGroups: groups,
        action: 'UPDATE',
        actionType: updateType,
        toBeChangedEvents: toBeUpdatedEvents.items.map(
          ({ newEvent }) => newEvent,
        ),
        updateLevel,
      });
      if (!result.isSubmit) {
        if (!result.stale) {
          revertAction();
        }
        return;
      }
    }

    updateEvents({
      toBeUpdated: toBeUpdatedEvents,
      revertFunction: revertAction,
    });
  });

  const updateEvents = useLatestCallback(
    async ({
      toBeUpdated,
      revertFunction = () => {},
    }: {
      toBeUpdated: ReturnType<typeof prepareToBeUpdatedEvents>;
      revertFunction?: () => void;
    }) => {
      dispatch(
        operateSelectedEvents({
          operations: {
            toBeUpdated,
          },
          formatted: false,
          availabilityObj: null,
          runFlagging: true,
          revertFunction,
          copyActive: copyModeActive,
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

      if (copyModeActive) {
        resetAnySelected();
      }
    },
  );

  return {
    handleReplaceEvents,
  };
}
