import { useMemo } from 'react';

const filterEvents = (filterPossibleEventsByResources: any[]) => {
  let counting_obj: Record<string, any> = {};
  let needed_events: any[] = filterPossibleEventsByResources
    .filter((event: any) => {
      for (let index = event.start_r; index < event.end_r; index++) {
        const index_str = index.toString();
        if (
          Object.keys(counting_obj).includes(index_str) &&
          // If the event is already counted 1000 times, skip it
          counting_obj[index_str] === 1000
        ) {
          return false;
        }
      }
      for (let index = event.start_r; index < event.end_r; index++) {
        const index_str = index.toString();
        if (!Object.keys(counting_obj).includes(index_str)) {
          counting_obj = { ...counting_obj, [index_str]: 1 };
        } else {
          counting_obj[index_str]++;
        }
      }
      return true;
    })
    .map((event: any) => event.id);

  const rangePossibleEvents = filterPossibleEventsByResources.filter(
    (event: any) => {
      if (needed_events.includes(event.id)) {
        return true;
      } else {
        return false;
      }
    },
  );
  return rangePossibleEvents;
};

export function useSolGenPossibleEventsFiltered({
  possibleEvents,
}: {
  possibleEvents: any[];
}) {
  const filteredEvents = useMemo(
    () => filterEvents(possibleEvents),
    [possibleEvents],
  );
  return filteredEvents;
}
