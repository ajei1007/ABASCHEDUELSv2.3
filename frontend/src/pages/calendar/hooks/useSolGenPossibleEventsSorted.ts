import { useMemo } from 'react';
import { sortFunctions } from '../utils/solutionGenerator';

export function useSolGenPossibleEventsSorted({
  possibleEvents,
  sortOption,
}: {
  possibleEvents: any[];
  sortOption: string;
}) {
  const sortedPossibleEvents = useMemo(
    () =>
      [...possibleEvents].sort(
        sortFunctions[sortOption as keyof typeof sortFunctions],
      ),
    [possibleEvents, sortOption],
  );

  return sortedPossibleEvents;
}
