import moment from 'moment';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setPasteEventsLoading } from 'store/slices/calendar/actions';
import { operateSelectedEvents } from 'store/slices/calendar/thunks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import { useLatestCallback } from 'hooks/useLatestCallback';
import preparePasteEvents from '../utils/preparePasteEvents';
import { eventExtractFormatter } from '../utils/eventExtractFormatter';
import { useCalendarSelectedEventsContext } from '../context/CalendarSelectedEventsContext';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';
import { useCalendarOptimizerJobUtilsContext } from '../context/CalendarOptimizerJobUtilsContext';

export function useCalendarEventsPaste() {
  const dispatch = useAppDispatch();

  const activityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );

  const calendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const calendarEnd = useAppSelector((state) => state.calendar.calendar_end);

  const settingsTimezone = useAppSelector(
    (state) => state.settings?.settingValues?.timezone,
  );

  const { selectedEvents } = useCalendarSelectedEventsContext();
  const { toggleIsAllSelected } = useCalendarSelectedResourcesContext();
  const { hasOptimizerJobRunning } = useCalendarOptimizerJobUtilsContext();

  const pasteEvents = useLatestCallback(
    async ({
      allowCanceledEvents = false,
    }: {
      allowCanceledEvents?: boolean;
    } = {}) => {
      dispatch(setPasteEventsLoading(true));
      try {
        const parsedSelectedEvents = JSON.parse(JSON.stringify(selectedEvents));
        const timezone =
          settingsTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
        const calendar_start_moment = moment(calendarStart)
          .tz(timezone)
          .startOf('day');
        const calendar_end_moment = moment(calendarEnd)
          .tz(timezone)
          .startOf('day');

        const calendar_start = calendar_start_moment.format('YYYY-MM-DD');
        const calendar_end = calendar_end_moment.format('YYYY-MM-DD');

        const supervisionActivitiesMap = activityResources
          .filter((e) => e.supervision)
          .reduce(
            (acc, item) => acc.set(item.id, true),
            new Map<string, boolean>(),
          );

        const pastedEvents = parsedSelectedEvents
          .filter((ev: any) => {
            const start_real_moment = moment(ev.extendedProps.start_real)
              .tz(timezone)
              .startOf('day');

            // Check if the event's start date is within the calendar range
            const isInRange =
              start_real_moment.isSameOrAfter(calendar_start_moment) &&
              start_real_moment.isBefore(calendar_end_moment);
            return (
              // skip canceled events unless allowed
              (!ev.extendedProps.canceled || allowCanceledEvents) &&
              // not copy deleted
              !ev.extendedProps?.deletedAt &&
              // not copy events that are not in range
              !isInRange &&
              // not copy supervision activities
              !supervisionActivitiesMap.has(ev.extendedProps.activity0Id)
            );
          })
          .map((ev: any) => {
            const formattedEvent = eventExtractFormatter(ev);

            // If allowed, reset canceled state
            if (allowCanceledEvents && formattedEvent.canceled) {
              formattedEvent.canceled = false;
              formattedEvent.reason_canceled = null;
              formattedEvent.user_canceled = null;
            }

            return formattedEvent;
          });

        let formattedEvents = preparePasteEvents({
          events: pastedEvents,
          calendarStart: calendar_start,
          calendarEnd: calendar_end,
          timezone,
        });

        formattedEvents = formattedEvents.filter(
          (event) =>
            !hasOptimizerJobRunning(event, {
              getStartDate: (e) => e.startRecur,
              getEndDate: (e) => e.endRecur,
              endDateInclusive: false,
            }),
        );

        const { success } = await dispatch(
          operateSelectedEvents({
            operations: {
              toBeAdded: {
                items: formattedEvents,
              },
            },
            skipValidation: true,
          }),
        );
        if (success) {
          dispatch(
            checkNpsSurvey({
              chance: 1, // 100% chance to show the NPS survey
            }),
          );
        }
      } catch (error) {
        // Errors handled in operateSelectedEvents
      } finally {
        toggleIsAllSelected(false);
        dispatch(setPasteEventsLoading(false));
      }
    },
  );

  return pasteEvents;
}
