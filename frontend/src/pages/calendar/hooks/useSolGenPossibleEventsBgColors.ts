import { useMemo } from 'react';
import { applyGradient, sortFunctions } from '../utils/solutionGenerator';

export function useSolGenPossibleEventsBgColors({
  possibleEvents,
  sortOption,
}: {
  possibleEvents: any[];
  sortOption: string;
}) {
  const possibleEventsBgColors = useMemo(
    () =>
      applyGradient(
        possibleEvents,
        sortOption as keyof typeof sortFunctions,
      ) as Record<string, string>,
    [possibleEvents, sortOption],
  );

  return possibleEventsBgColors;
}
