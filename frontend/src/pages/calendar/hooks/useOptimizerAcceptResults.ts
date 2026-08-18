import moment from 'moment';
import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { weekdayOptions } from 'constants/recurrenceOptions';
import {
  fetchEvents,
  operateSelectedEvents,
} from 'store/slices/calendar/thunks';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import {
  optimizerCreatingEventsSelector,
  optimizerDeletingEventsSelector,
  optimizerUpdatingEventsSelector,
  optimizerResultsSelectedIdsMapSelector,
} from 'store/selectors/optimizerSelectors';
import { resetOptimizerResults } from 'store/actions/optimizerActions';
import { setDateComponents } from '../utils/setDateComponents';

export function useOptimizerAcceptResults({
  afterAcceptResults = () => {},
}: {
  afterAcceptResults?: () => void;
} = {}) {
  const dispatch = useAppDispatch();
  const optimizerCreatingEvents = useAppSelector(
    optimizerCreatingEventsSelector,
  );
  const optimizerUpdatingEvents = useAppSelector(
    optimizerUpdatingEventsSelector,
  );
  const optimizerDeletingEvents = useAppSelector(
    optimizerDeletingEventsSelector,
  );
  const optimizerResultsSelectedIdsMap = useAppSelector(
    optimizerResultsSelectedIdsMapSelector,
  );

  const storeCalendarEvents = useAppSelector((state) => state.calendar.events);
  const timezone = useAppSelector(
    (state) => state.settings.settingValues.timezone,
  );
  const calendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );

  const [loading, setLoading] = useState(false);

  const handleAcceptResults = useCallback(async () => {
    if (loading) {
      return;
    }

    const creatingEvents = optimizerCreatingEvents.filter(
      (event) => optimizerResultsSelectedIdsMap[event.id],
    );
    const deletingEvents = optimizerDeletingEvents.filter(
      (event) => optimizerResultsSelectedIdsMap[event.id],
    );
    const updatingEvents = optimizerUpdatingEvents.filter(
      (event) => optimizerResultsSelectedIdsMap[event.id],
    );

    const frequency = 'Weekly';
    const bysetpos = 1;
    const interval = 1;

    const getEventGroupId = (event: any) => {
      if (event?.eventGroupId) {
        return event?.eventGroupId;
      }
      return storeCalendarEvents.find((e) => e.id === event?.id)?.eventGroupId;
    };

    const prepareEvent = (event: any) => {
      const startRecurMoment = event.startRecur
        ? moment.parseZone(event.startRecur)
        : moment(event.start).tz(timezone);
      const endRecurMoment = startRecurMoment.clone().add(1, 'days');
      const startRecur = startRecurMoment.format('YYYY-MM-DD');
      const endRecur = endRecurMoment.format('YYYY-MM-DD');
      const daysOfWeek = [weekdayOptions[startRecurMoment.weekday()].value];
      const dateComponents = {
        year: startRecurMoment.year(),
        month: startRecurMoment.month(),
        day: startRecurMoment.date(),
      };
      const start = setDateComponents(
        moment(event.start).tz(timezone),
        dateComponents,
      ).format();
      const end = setDateComponents(
        moment(event.end).tz(timezone),
        dateComponents,
      ).format();
      return {
        ...event,
        startRecur,
        endRecur,
        frequency,
        bysetpos,
        interval,
        daysOfWeek,
        start,
        end,
        timezone,
        supervisionEvent: event?.supervisionEvent
          ? {
              ...event?.supervisionEvent,
              start,
              end,
            }
          : null,
      };
    };
    deletingEvents.map((event) => {
      console.log(
        'deletingEvents2',
        event,
        prepareEvent(event),
        getEventGroupId(event),
      );
    });

    setLoading(true);
    try {
      await dispatch(
        operateSelectedEvents({
          operations: {
            toBeAdded: {
              items: creatingEvents.map(prepareEvent),
            },
            toBeDeleted: {
              items: deletingEvents.map((event) => ({
                ...prepareEvent(event),
                eventGroupId: getEventGroupId(event),
              })),
              deleteType: 'ONLY',
            },
            toBeUpdated: {
              items: updatingEvents.map(({ oldEvent, newEvent }) => ({
                oldEvent,
                newEvent: {
                  ...prepareEvent(newEvent),
                  eventGroupId: getEventGroupId(oldEvent),
                },
              })),
              updateLevel: 'SIMPLE',
              updateType: 'ONLY',
            },
          },
          formatted: true,
          availabilityObj: null,
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
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
      dispatch(resetOptimizerResults());
      dispatch(fetchEvents());
      afterAcceptResults();
    }
  }, [
    calendarStart,
    dispatch,
    loading,
    optimizerCreatingEvents,
    optimizerDeletingEvents,
    optimizerUpdatingEvents,
    optimizerResultsSelectedIdsMap,
    storeCalendarEvents,
    timezone,
    afterAcceptResults,
  ]);

  return {
    loading,
    handleAcceptResults,
  };
}
