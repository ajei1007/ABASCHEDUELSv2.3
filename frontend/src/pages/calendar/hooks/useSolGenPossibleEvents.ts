import { useAppSelector } from 'store/hooks';
import { selectSolutionGeneratorPossibleEvents } from 'store/slices/solutionGenerator';
import { useSolGenPossibleEventsSorted } from './useSolGenPossibleEventsSorted';
import { useSolGenPossibleEventsFiltered } from './useSolGenPossibleEventsFiltered';
import { useSolGenPossibleEventsBgColors } from './useSolGenPossibleEventsBgColors';

export function useSolGenPossibleEvents({
  sortOption,
}: {
  sortOption: string;
}) {
  const solutionGeneratorPossibleEvents = useAppSelector(
    selectSolutionGeneratorPossibleEvents,
  );

  const sortedPossibleEvents = useSolGenPossibleEventsSorted({
    possibleEvents: solutionGeneratorPossibleEvents,
    sortOption,
  });

  const filteredPossibleEvents = useSolGenPossibleEventsFiltered({
    possibleEvents: sortedPossibleEvents,
  });

  const possibleEventsBgColors = useSolGenPossibleEventsBgColors({
    possibleEvents: sortedPossibleEvents,
    sortOption,
  });

  return {
    solGenPossibleEvents: filteredPossibleEvents,
    possibleEventsBgColors,
  };
}
