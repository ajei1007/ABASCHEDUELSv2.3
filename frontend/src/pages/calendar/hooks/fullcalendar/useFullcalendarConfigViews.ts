import { useMemo } from 'react';
import { duration_interval } from '../../constants';
import { useCalendarViewContext } from '../../context/CalendarViewContext';

export function useFullcalendarConfigViews({ duration }: { duration: number }) {
  const { weekExpanded } = useCalendarViewContext();

  const views = useMemo(
    () =>
      ({
        Week_Timeline_All: {
          type: 'resourceTimeline',
          duration: { weeks: 1 },
          slotDuration: { days: 1 },
          slotLabelFormat: { day: 'numeric', weekday: 'short' },
        },
        Day_Timeline: {
          type: 'resourceTimelineDay',
          snapDuration: duration_interval[duration][0],
          eventMinWidth: 1,
          scrollTime: '05:00:00',
          slotLabelInterval: duration_interval[duration][1],
          titleFormat: {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'long',
          },
        },
        Week_Timeline: !weekExpanded
          ? {
              type: 'resourceTimeline',
              duration: { weeks: 1 },
              slotMinWidth: 150,
              slotDuration: { days: 1 },
              slotLabelFormat: { day: 'numeric', weekday: 'short' },
            }
          : {
              type: 'resourceTimelineDay',
              snapDuration: duration_interval[duration][0],
              eventMinWidth: 1,
              scrollTime: '05:00:00',
              duration: { weeks: 1 },
              slotMinWidth: 16,
              slotLabelInterval: duration_interval[duration][1],
              titleFormat: {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                weekday: 'long',
              },
            },
        Month_Timeline: {
          type: 'resourceTimeline',
          duration: { months: 1 },
          slotMinWidth: 150,
          slotDuration: { days: 1 },
          slotLabelFormat: { day: 'numeric', weekday: 'short' },
        },
        dayGridMonth: {
          dayMaxEventRows: 3,
          columnHeaderFormat: { weekday: 'long' },
        },
        listDay: {
          type: 'listDay',
        },
        Month2_Timeline: {
          type: 'listMonth',
          slotMinWidth: 150,
        },
        resourceTimeGridDay: {
          slotDuration: '00:30:00',
          dayMinWidth: 150,
          titleFormat: {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            weekday: 'short',
          },
        },
        resourceTimeGridWeek: {
          dayMinWidth: 150,
          slotDuration: '00:30:00',
        },
      }) as any,
    [duration, weekExpanded],
  );

  return views;
}
