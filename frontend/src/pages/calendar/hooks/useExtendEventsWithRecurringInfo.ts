import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchEventGroups } from 'store/slices/calendar/thunks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { isDateRangeRecurring } from 'utils/isDateRangeRecurring';
import type { IApiCalendarEventGroupItem } from 'types';

export function useExtendEventsWithRecurringInfo({
  eventDateRangeExtractor,
  eventGroupIdExtractor,
}: {
  eventDateRangeExtractor: (event: any) => {
    startDate: string;
    endDate: string;
  };
  eventGroupIdExtractor: (event: any) => string;
}) {
  const dispatch = useAppDispatch();
  const storeEvents = useAppSelector((state) => state.calendar.events);

  function getMaybeRecurringEvents(events: any[]) {
    return events.reduce(
      (acc, event) => {
        const { startDate, endDate } = eventDateRangeExtractor(event);
        const eventGroupId = eventGroupIdExtractor(event);

        if (
          !isDateRangeRecurring(endDate, startDate) &&
          !storeEvents.some(
            (item) =>
              item.eventGroupId === eventGroupId && item.id !== event.id,
          )
        ) {
          acc.maybeRecurringEvents.push(event);
        } else {
          acc.recurringEvents.push(event);
        }

        return acc;
      },
      {
        recurringEvents: [] as any[],
        maybeRecurringEvents: [] as any[],
      },
    ) as {
      recurringEvents: any[];
      maybeRecurringEvents: any[];
    };
  }

  const extendUpdatingEventsWithRecurringInfo = useLatestCallback(
    async ({
      events,
      onEventGroupsFetched = () => {},
    }: {
      events: {
        newEvent: any;
        oldEvent: any;
      }[];
      onEventGroupsFetched?: (groups: IApiCalendarEventGroupItem[]) => void;
    }) => {
      const oldEvents = events.map((item) => item.oldEvent);
      const { maybeRecurringEvents, recurringEvents } =
        getMaybeRecurringEvents(oldEvents);

      if (maybeRecurringEvents.length === 0) {
        return events.map(({ newEvent, oldEvent }) => ({
          newEvent,
          oldEvent,
          isRecurring: true,
        }));
      }

      const groups = await dispatch(
        fetchEventGroups(
          events.map(({ oldEvent }) => eventGroupIdExtractor(oldEvent)),
        ),
      );
      onEventGroupsFetched(groups);

      const recurringEventsMap = recurringEvents.reduce((acc, item) => {
        acc[item.id] = true;
        return acc;
      }, {}) as Record<string, boolean>;

      const groupsMap = groups.reduce((acc, item) => {
        acc[item.eventGroupId] = item;
        return acc;
      }, {} as Record<string, IApiCalendarEventGroupItem>);

      return events.map(({ newEvent, oldEvent }) => {
        const eventGroupId = eventGroupIdExtractor(oldEvent);
        return {
          newEvent,
          oldEvent,
          isRecurring:
            !!recurringEventsMap[oldEvent.id] ||
            (eventGroupId in groupsMap
              ? groupsMap[eventGroupId].count > 1
              : false),
        };
      });
    },
  );

  const extendDeletingEventsWithRecurringInfo = useLatestCallback(
    async ({
      events,
      onEventGroupsFetched = () => {},
    }: {
      events: any[];
      onEventGroupsFetched?: (groups: IApiCalendarEventGroupItem[]) => void;
    }) => {
      const { maybeRecurringEvents, recurringEvents } =
        getMaybeRecurringEvents(events);

      if (maybeRecurringEvents.length === 0) {
        return events.map((event) => ({
          event,
          isRecurring: true,
        }));
      }

      const groups = await dispatch(
        fetchEventGroups(events.map((event) => eventGroupIdExtractor(event))),
      );
      onEventGroupsFetched(groups);

      const recurringEventsMap = recurringEvents.reduce((acc, item) => {
        acc[item.id] = true;
        return acc;
      }, {}) as Record<string, boolean>;

      const groupsMap = groups.reduce((acc, item) => {
        acc[item.eventGroupId] = item;
        return acc;
      }, {} as Record<string, IApiCalendarEventGroupItem>);

      return events.map((event) => {
        const eventGroupId = eventGroupIdExtractor(event);
        return {
          event,
          isRecurring:
            !!recurringEventsMap[event.id] ||
            (eventGroupId in groupsMap
              ? groupsMap[eventGroupId].count > 1
              : false),
        };
      });
    },
  );

  return {
    extendUpdatingEventsWithRecurringInfo,
    extendDeletingEventsWithRecurringInfo,
  };
}
