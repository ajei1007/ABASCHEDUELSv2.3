import { useMemo } from 'react';
import moment from 'moment';
import { useAppSelector } from 'store/hooks';
import { allGradients } from '../../constants';
import { useCalendarViewContext } from '../../context/CalendarViewContext';

export function useFullcalendarConfigEventOrder() {
  // Context for active day and view
  const { activeDay, weekExpanded } = useCalendarViewContext();

  const storeResourceSortsSolGen = useAppSelector(
    (state) => state.calendar.resourceSortsSolGen,
  );

  const eventOrder = useMemo(() => {
    // Helper function to check if event is from solution generator
    const isSolutionGeneratorEvent = (event: any): boolean => {
      return event.av === 't' || event.av === 'n';
    };

    // Helper function to check if we're in detailed view (Day or expanded Week)
    const isDayView = (): boolean => {
      return activeDay === 'Day' || (activeDay === 'Week' && weekExpanded);
    };

    // Solution generator duration sorting
    const solutionGeneratorDurationSort = (a: any, b: any) => {
      if (!isSolutionGeneratorEvent(a) || !isSolutionGeneratorEvent(b)) {
        return 0;
      }

      if (storeResourceSortsSolGen.length === 0) {
        return 0;
      }

      const sortValues = storeResourceSortsSolGen.map((t) => t.value);

      if (sortValues.includes('longest')) {
        return b.duration - a.duration;
      }

      if (sortValues.includes('shortest')) {
        return a.duration - b.duration;
      }

      return 0;
    };

    // Start time sorting for day views
    const startTimeSort = (a: any, b: any) => {
      if (!isDayView()) {
        return 0;
      }
      return a.start - b.start;
    };

    // Duration sorting for day views (longer events first)
    const durationSort = (a: any, b: any) => {
      if (!isDayView()) {
        return 0;
      }

      const aDuration = moment(a.end).diff(moment(a.start));
      const bDuration = moment(b.end).diff(moment(b.start));

      return bDuration - aDuration;
    };

    // Background color sorting for solution generator events
    const backgroundColorSort = (a: any, b: any) => {
      if (!isSolutionGeneratorEvent(a) || !isSolutionGeneratorEvent(b)) {
        // Fallback to start time sorting for non-solution generator events
        return a.start - b.start;
      }

      const aColorIndex = allGradients.findIndex(
        (p) => p === a.backgroundColor2,
      );
      const bColorIndex = allGradients.findIndex(
        (p) => p === b.backgroundColor2,
      );

      return aColorIndex - bColorIndex;
    };

    // Start time sorting for solution generator events
    const solutionGeneratorStartTimeSort = (a: any, b: any) => {
      if (!isSolutionGeneratorEvent(a) || !isSolutionGeneratorEvent(b)) {
        return 0;
      }

      return new Date(a.start).getTime() - new Date(b.start).getTime();
    };

    const supervisionPairSort = (a: any, b: any) => {
      const aIsSupervision = !!a.extendedProps?.supervisionId;
      const bIsSupervision = !!b.extendedProps?.supervisionId;

      const aMainId = aIsSupervision ? a.extendedProps.supervisionId : a.id;
      const bMainId = bIsSupervision ? b.extendedProps.supervisionId : b.id;

      if (aMainId !== bMainId) {
        return aMainId.localeCompare(bMainId);
      }

      if (aIsSupervision && !bIsSupervision) return -1;
      if (!aIsSupervision && bIsSupervision) return 1;

      return 0;
    };

    // Return the sorting functions array in the format expected by FullCalendar
    return [
      solutionGeneratorDurationSort,
      startTimeSort,
      durationSort,
      'priority', // Built-in FullCalendar property
      backgroundColorSort,
      solutionGeneratorStartTimeSort,
      'ap', // Built-in FullCalendar property
      '-cap_priority', // Built-in FullCalendar property (descending)
      '-reasons_l', // Built-in FullCalendar property (descending)
      supervisionPairSort,
    ] as any[];
  }, [activeDay, weekExpanded, storeResourceSortsSolGen]);

  return eventOrder;
}
