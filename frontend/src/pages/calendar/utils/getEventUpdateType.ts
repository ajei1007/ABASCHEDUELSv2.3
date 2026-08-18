import { eventOptions } from '../constants';
import type { TApiEventUpdateType } from 'types/api';

export function getEventUpdateType(
  selectedEventOptionIndex: number,
): TApiEventUpdateType {
  const selectedEventOption = eventOptions[selectedEventOptionIndex];
  switch (selectedEventOption.value) {
    case '1':
      return 'PARTLY';
    case '2':
      return 'ALL';
    case '3':
    case '4':
      return 'FUTURE';
    default:
      return 'ONLY';
  }
}
