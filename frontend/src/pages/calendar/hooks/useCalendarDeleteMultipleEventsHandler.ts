import { uniqBy } from 'lodash';
import type { IApiCalendarEventGroupItem } from 'types/api';
import type { IModalWrapperRef } from 'components/ModalWrapper';
import type { IEventsDeleteConfirmModalPropsForRef } from '../components/modals/EventsDeleteConfirmModal/EventsDeleteConfirmModal';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setDeleteEventsLoading } from 'store/slices/calendar/actions';
import {
  operateSelectedEvents,
  fetchEventGroups,
} from 'store/slices/calendar/thunks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';

import { useLatestCallback } from 'hooks/useLatestCallback';

import { eventOptions } from '../constants';
import { eventExtractFormatter } from '../utils/eventExtractFormatter';
import { formatEventOptions } from '../utils/eventOptionsFormatter';
import { prepareToBeDeletedEvents } from '../utils/prepareToBeDeletedEvents';
import { useExtendEventsWithRecurringInfo } from '../hooks/useExtendEventsWithRecurringInfo';

import { useCalendarViewContext } from '../context/CalendarViewContext';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';
import { useCalendarSelectedEventsContext } from '../context/CalendarSelectedEventsContext';
import { useCalendarOptimizerJobUtilsContext } from '../context/CalendarOptimizerJobUtilsContext';

export function useCalendarDeleteMultipleEventsHandler({
  deleteSelectedEventsModalRef,
}: {
  deleteSelectedEventsModalRef: React.RefObject<
    IModalWrapperRef<IEventsDeleteConfirmModalPropsForRef, any>
  >;
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

  const { hasOptimizerJobRunning } = useCalendarOptimizerJobUtilsContext();

  const { selectedEvents } = useCalendarSelectedEventsContext();

  // Context for active day and view
  const { activeDay } = useCalendarViewContext();

  // Context for selected resources
  const { resetAnySelected } = useCalendarSelectedResourcesContext();

  const { extendDeletingEventsWithRecurringInfo } =
    useExtendEventsWithRecurringInfo({
      eventDateRangeExtractor: (event: any) => ({
        startDate: event.extendedProps.startRecur1,
        endDate: event.extendedProps.endRecur1,
      }),
      eventGroupIdExtractor: (event: any) => event.extendedProps.eventGroupId,
    });

  const trash = useLatestCallback(() => {
    deleteMultipleEvents(selectedEvents);
  });

  const deleteMultipleEvents = useLatestCallback(async (events: any[]) => {
    if (!deleteSelectedEventsModalRef.current) {
      console.warn(
        'deleteSelectedEventsModalRef ref is not attached to component',
      );
      return;
    }

    events = events.filter(
      (event) =>
        !hasOptimizerJobRunning(event) &&
        // don't include deleted
        !event.extendedProps?.deletedAt,
    );
    if (events.length === 0) {
      return;
    }

    events = uniqBy(events, 'extendedProps.eventGroupId');

    let groups: IApiCalendarEventGroupItem[] = [];
    let groupsIsFetched = false;

    let beingDeletedEvents = await extendDeletingEventsWithRecurringInfo({
      events,
      onEventGroupsFetched(_groups) {
        groups = _groups;
        groupsIsFetched = true;
      },
    });

    beingDeletedEvents = beingDeletedEvents.map((e) => ({
      event: eventExtractFormatter(e.event),
      isRecurring: e.isRecurring,
    }));

    const recurringEvents = beingDeletedEvents.filter((ev) => ev.isRecurring);
    const hasRecurringEvents = recurringEvents.length !== 0;
    const options: {
      value: string;
      label: string;
    }[] = (() => {
      if (hasRecurringEvents) {
        return formatEventOptions({
          eventOptions,
          includeWeekOptions: activeDay === 'Week',
        });
      }

      if (activeDay === 'Week') {
        return eventOptions.filter((item) => item.value === '1');
      }

      return eventOptions.filter((item) => item.value === '0');
    })();

    if (!groupsIsFetched) {
      const groupIds = recurringEvents.map(({ event }) => event.eventGroupId);
      groups = await dispatch(fetchEventGroups(groupIds));
      groupsIsFetched = true;
    }

    const result = await deleteSelectedEventsModalRef.current.show({
      showSelectInput: hasRecurringEvents,
      options,
      events: beingDeletedEvents,
      eventGroups: groups,
      calendarStartDate: storeCalendarStart,
      calendarEndDate: storeCalendarEnd,
      timezone: storeSettingsValuesTimezone,
      useCalendarDateRangeForFuture: activeDay === 'Week',
    });
    if (!result.isSubmit) {
      return;
    }

    const toBeDeletedEvents = result.payload;
    deleteEvents(toBeDeletedEvents);
  });

  const deleteEvents = useLatestCallback(
    async (toBeDeleted: ReturnType<typeof prepareToBeDeletedEvents>) => {
      dispatch(setDeleteEventsLoading(true));
      try {
        const { success } = await dispatch(
          operateSelectedEvents({
            operations: {
              toBeDeleted,
            },
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
        dispatch(setDeleteEventsLoading(false));
      }
    },
  );

  return {
    trash,
    deleteMultipleEvents,
  };
}
