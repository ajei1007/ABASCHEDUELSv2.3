import moment from 'moment';
import { uniqBy } from 'lodash';
import { toast } from 'react-toastify';
import type { IApiCalendarEventGroupItem } from 'types/api';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  operateSelectedEvents,
  fetchEventGroups,
} from 'store/slices/calendar/thunks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useCalendarViewContext } from '../context/CalendarViewContext';
import { useCalendarCopyModeContext } from '../context/CalendarCopyModeContext';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';
import { useCalendarSelectedEventsContext } from '../context/CalendarSelectedEventsContext';
import { useCalendarOptimizerJobUtilsContext } from '../context/CalendarOptimizerJobUtilsContext';
import { eventOptions } from '../constants';
import { eventExtractFormatter } from '../utils/eventExtractFormatter';
import { formatEventOptions } from '../utils/eventOptionsFormatter';
import { getEventUpdateType } from '../utils/getEventUpdateType';
import { prepareToBeUpdatedEvents } from '../utils/prepareToBeUpdatedEvents';
import { useExtendEventsWithRecurringInfo } from '../hooks/useExtendEventsWithRecurringInfo';

export function useCalendarEventsSandboxChangeHandler({
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
  const storeCalendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const storeCalendarEnd = useAppSelector(
    (state) => state.calendar.calendar_end,
  );
  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );

  const { selectedEvents } = useCalendarSelectedEventsContext();

  const { hasOptimizerJobRunning } = useCalendarOptimizerJobUtilsContext();

  // Context for copy mode
  const { copyModeActive } = useCalendarCopyModeContext();

  // Context for selected resources
  const { resetAnySelected } = useCalendarSelectedResourcesContext();

  // Context for active day and view
  const { activeDay } = useCalendarViewContext();

  const { extendUpdatingEventsWithRecurringInfo } =
    useExtendEventsWithRecurringInfo({
      eventDateRangeExtractor: (event: any) => ({
        startDate: event.extendedProps.startRecur1,
        endDate: event.extendedProps.endRecur1,
      }),
      eventGroupIdExtractor: (event: any) => event.extendedProps.eventGroupId,
    });

  const handleEventsSandboxeChange = useLatestCallback(
    async (isSandbox = true) => {
      const events = selectedEvents.filter(
        (event) =>
          // don't include events which overlapping with optimizer job range
          !hasOptimizerJobRunning(event) &&
          // don't include deleted
          !event.extendedProps?.deletedAt,
      );
      const filteredEvents = uniqBy(
        JSON.parse(JSON.stringify(events)),
        'extendedProps.eventGroupId',
      );

      let groups: IApiCalendarEventGroupItem[] = [];
      let groupsIsFetched = false;

      let formattedEvents = await extendUpdatingEventsWithRecurringInfo({
        events: filteredEvents.map((ev: any) => ({
          newEvent: {
            ...ev,
            extendedProps: { ...ev.extendedProps, sandboxMode: isSandbox },
          },
          oldEvent: ev,
        })),
        onEventGroupsFetched(_groups) {
          groups = _groups;
          groupsIsFetched = true;
        },
      });

      formattedEvents = formattedEvents.filter(
        (e) =>
          e.isRecurring || e.oldEvent.extendedProps?.sandboxMode === !isSandbox,
      );
      if (formattedEvents.length === 0) {
        toast.error('Nothing to update!');
        return;
      }

      formattedEvents = formattedEvents.map((e) => ({
        newEvent: eventExtractFormatter(e.newEvent),
        oldEvent: eventExtractFormatter(e.oldEvent),
        isRecurring: e.isRecurring,
      }));

      const recurringEvents = (formattedEvents as any[]).filter(
        (ev) => ev.isRecurring,
      );
      if (recurringEvents.length === 0) {
        const updateType = activeDay === 'Week' ? 'PARTLY' : 'ONLY';
        updateEvents({
          toBeUpdated: prepareToBeUpdatedEvents({
            // cases which (ONLY, SIMPLE)
            events: formattedEvents.map(({ oldEvent, newEvent }) => {
              const newEventStartDate = moment(newEvent.start).tz(
                storeSettingsValuesTimezone,
              );
              const newEventStartDatePlusOneDay = newEventStartDate
                .clone()
                .add(1, 'days');
              return {
                oldEvent,
                newEvent:
                  updateType === 'ONLY'
                    ? {
                        ...newEvent,
                        startRecur: newEventStartDate.format('YYYY-MM-DD'),
                        endRecur:
                          newEventStartDatePlusOneDay.format('YYYY-MM-DD'),
                      }
                    : newEvent,
              };
            }),
            updateLevel: 'SIMPLE',
            updateType,
            calendarStartDate: storeCalendarStart,
            calendarEndDate: storeCalendarEnd,
            timezone: storeSettingsValuesTimezone,
            sandboxUpdate: true,
            useCalendarDateRangeForFuture: activeDay === 'Week',
          }),
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
          includeWeekOptions: activeDay === 'Week',
          updateLevel: 'SIMPLE',
        }),
      });
      if (!result.isSubmit) {
        return;
      }

      const selectedUpdateOptionIndex = result.payload;
      const updateType = getEventUpdateType(selectedUpdateOptionIndex);
      const toBeUpdatedEvents = prepareToBeUpdatedEvents({
        // cases which (ONLY, SIMPLE)
        events: formattedEvents.map(({ oldEvent, newEvent }) => {
          const newEventStartDate = moment(newEvent.start).tz(
            storeSettingsValuesTimezone,
          );
          const newEventStartDatePlusOneDay = newEventStartDate
            .clone()
            .add(1, 'days');
          return {
            oldEvent,
            newEvent:
              updateType === 'ONLY'
                ? {
                    ...newEvent,
                    startRecur: newEventStartDate.format('YYYY-MM-DD'),
                    endRecur: newEventStartDatePlusOneDay.format('YYYY-MM-DD'),
                  }
                : newEvent,
          };
        }),
        updateLevel: 'SIMPLE',
        updateType,
        calendarStartDate: storeCalendarStart,
        calendarEndDate: storeCalendarEnd,
        timezone: storeSettingsValuesTimezone,
        useCalendarDateRangeForFuture: activeDay === 'Week',
        sandboxUpdate: true,
      });

      // Check whether selected only-this-event update type
      if (['ONLY', 'PARTLY'].includes(updateType)) {
        updateEvents({
          toBeUpdated: toBeUpdatedEvents,
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
          updateLevel: 'SIMPLE',
        });
        if (!result.isSubmit) {
          return;
        }
      }

      updateEvents({
        toBeUpdated: toBeUpdatedEvents,
      });
    },
  );

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
    handleEventsSandboxeChange,
  };
}
