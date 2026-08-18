import day_ids from 'constants/days';

export const intervalOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
];

export const frequencyOptions = [
  { value: 'Weekly', label: 'Week', name: 'Week' },
  { value: 'Monthly', label: 'Month', name: 'Month' },
];

export const weekNumberOptions = [
  { value: '1', label: 'on 1st week' },
  { value: '2', label: 'on 2nd week' },
  { value: '3', label: 'on 3rd week' },
  { value: '4', label: 'on 4th week' },
  { value: '-1', label: 'on Last week' },
];

export const weekdayOptions = [
  { value: day_ids['sunday_id'], label: 'Su', name: 'Sunday', pos: 0 },
  { value: day_ids['monday_id'], label: 'Mo', name: 'Monday', pos: 1 },
  { value: day_ids['tuesday_id'], label: 'Tu', name: 'Tuesday', pos: 2 },
  { value: day_ids['wednesday_id'], label: 'We', name: 'Wednesday', pos: 3 },
  { value: day_ids['thursday_id'], label: 'Th', name: 'Thursday', pos: 4 },
  { value: day_ids['friday_id'], label: 'Fr', name: 'Friday', pos: 5 },
  { value: day_ids['saturday_id'], label: 'Sa', name: 'Saturday', pos: 6 },
];

export const recurranceOptions = [
  { value: 0, label: 'Does not repeat' },
  { value: 1, label: 'Weekly' },
  { value: 2, label: 'Monthly' },
  { value: 3, label: 'Every weekday (Monday to Friday)' },
  { value: 4, label: 'Custom' },
];

export const repeatingOptions = [
  { value: 1, label: '2 occurrences', type: 'weeks' },
  { value: 2, label: '3 occurrences', type: 'weeks' },
  { value: 3, label: '4 occurrences', type: 'weeks' },
  { value: 4, label: '5 occurrences', type: 'weeks' },
  { value: 5, label: '6 occurrences', type: 'weeks' },
  { value: 6, label: '7 occurrences', type: 'weeks' },
  { value: 7, label: '8 occurrences', type: 'weeks' },
  { value: 8, label: '9 occurrences', type: 'weeks' },
  { value: 9, label: '10 occurrences', type: 'weeks' },
  { value: 10, label: '11 occurrences', type: 'weeks' },
  { value: 11, label: '12 occurrences', type: 'weeks' },
];
