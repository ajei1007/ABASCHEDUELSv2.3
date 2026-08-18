import day_ids from 'constants/days';
import moment from 'moment-timezone';

// CONSTANTS
export const calendarsColor = {
  Business: 'primary',
  Personal: 'danger',
  Flatlogic: 'warning',
  Holiday: 'success',
};
export const timeconstraintColorsOptions = [
  { label: 'R', value: 'r' },
  { label: 'Y', value: 'y' },
  { label: 'G', value: 'g' },
];
export const breakAmountOptions = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 20, label: '20' },
  { value: 25, label: '25' },
  { value: 30, label: '30' },
].map((r) => ({ ...r, label: `${r.label} min` }));
export const lunchAmountOptions = [
  { value: 15, label: '15' },
  { value: 20, label: '20' },
  { value: 25, label: '25' },
  { value: 30, label: '30' },
  { value: 35, label: '35' },
  { value: 40, label: '40' },
  { value: 45, label: '45' },
  { value: 50, label: '50' },
  { value: 55, label: '55' },
  { value: 60, label: '60' },
].map((r) => ({ ...r, label: `${r.label} min` }));
// const snapDurationOptions = [
//   { value: '00:01:00', label: '1' },
//   { value: '00:05:00', label: '5' },
//   { value: '00:10:00', label: '10' },
//   { value: '00:15:00', label: '15' },
// ];
export const eventOptions = [
  { value: '0', label: 'Only This Event' },
  { value: '1', label: 'Only This Week' },
  { value: '2', label: 'All These Recurring Events' },
  { value: '3', label: 'This Event and Future Recurring Events' },
  { value: '4', label: 'This Week and Future Recurring Events' },
];

export const distance_units = [
  { value: 'km', label: 'km' },
  { value: 'mi', label: 'mi' },
];
export const settings_organized = [
  {
    title: 'Alerts',
    permission: 'createEvent',
    elements: [
      { title: 'Overbooking', value: 'overbooking' },
      { title: 'Empty Availability', value: 'emptyAvailability' },
      { title: 'Not Available Busy', value: 'notAvailableBusy' },
      { title: 'Different Branch', value: 'differentBranch' },
      { title: 'Isolate After Cancel', value: 'isolateCanceled' },
    ],
  },
  {
    title: 'Solution Generator',
    permission: 'createEvent',
    elements: [{ title: 'Blocks', value: 'blocks' }],
  },
  {
    title: 'Miscellanous',
    permission: 'none',
    elements: [
      //{ title: 'Team Separation', value: 'teamSeparation' },
      { title: 'Weekends', value: 'weekends' },
      { title: 'Hide Cancellations', value: 'hideCancelations' },
      { title: 'Group Resources By Role', value: 'groupResourcesByRole' },
      {
        title: 'Hide Users with no Availability',
        value: 'hideUsersWithNoAvailability',
      },
    ],
  },
  {
    title: 'Drive Constraints',
    permission: 'optimizerFeature',
    elements: [
      { title: 'Time', value: 'driveTime' },
      { title: 'Distance', value: 'driveDistanceMax' },
    ],
  },
  {
    title: 'Onboarding',
    permission: 'optimizerFeature',
    elements: [{ title: 'Onboarding', value: 'isOnboarding' }],
  },
];

export const optimizer_organized = {
  Constraints: [
    ['part1', 'Start From Scratch'],
    ['reshuffle', 'Reshuffle'],
    //['nogapsequation', 'noGaps'],
    //['constraintdrive', 'Drive'],
    //['constraintteam', 'Teams'],
    // ['constraintlunch', 'Lunch'],
    // ['orange', 'Orange Solutions'],
    //['is_minSession_constraint', 'Min Session'],
    //['is_overlap_constraint', 'Overlap'],
  ],
  Time: [],
  Activities: [
    // ['breaktime', 'Breaks'],
    // ['constraintdrive', 'Drive'],
  ],
  Data: [
    // ['blocks', 'blocks'],
    // ['allOrNothingBlocks', 'All Or Nothing blocks'],
    // ['Time Constraints', 'Time Constraints'],
    // ['noGaps', 'noGaps'],
  ],
  Configuration: [
    //['workers','Workers'],
    // ['is_events','Events'],
    // ['multi','Multi'],
    // ['isdaily','isDaily'],
  ],
  Miscellanous: [
    //['advanced', 'Advanced'],
    //['is_delete','Delete'],
    //['teamtolormin', 'Team Min or Tolerace'],
    //['scratchoroptimize', 'Start From Scratch or Optimize']
  ],
};

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

export const recurranceOptions = [
  { value: 0, label: 'Does not repeat' },
  { value: 1, label: 'Weekly' },
  { value: 2, label: 'Monthly' },
  { value: 3, label: 'Every weekday (Monday to Friday)' },
  { value: 4, label: 'Custom' },
];

export const intervalOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
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

// CalendarBody
export const weekdayOptions = [
  { value: day_ids['sunday_id'], label: 'Su', name: 'Sunday', pos: 0 },
  { value: day_ids['monday_id'], label: 'Mo', name: 'Monday', pos: 1 },
  { value: day_ids['tuesday_id'], label: 'Tu', name: 'Tuesday', pos: 2 },
  { value: day_ids['wednesday_id'], label: 'We', name: 'Wednesday', pos: 3 },
  { value: day_ids['thursday_id'], label: 'Th', name: 'Thursday', pos: 4 },
  { value: day_ids['friday_id'], label: 'Fr', name: 'Friday', pos: 5 },
  { value: day_ids['saturday_id'], label: 'Sa', name: 'Saturday', pos: 6 },
];
export const weekdayOptionsForSelect = [
  { value: day_ids['sunday_id'], label: 'Sunday', pos: 0 },
  { value: day_ids['monday_id'], label: 'Monday', pos: 1 },
  { value: day_ids['tuesday_id'], label: 'Tuesday', pos: 2 },
  { value: day_ids['wednesday_id'], label: 'Wednesday', pos: 3 },
  { value: day_ids['thursday_id'], label: 'Thursday', pos: 4 },
  { value: day_ids['friday_id'], label: 'Friday', pos: 5 },
  { value: day_ids['saturday_id'], label: 'Saturday', pos: 6 },
];
export const filterBirthdayRole = 'Client';
export const filterBirthdayMin = {
  value: 1,
  label: 1,
};
export const filterBirthdayMax = {
  value: 99,
  label: 99,
};
export const duration_interval = [
  ['00:15:00', '00:05:00'],
  ['00:15:00', '00:30:00'],
  ['00:15:00', '00:45:00'],
  ['00:15:00', '00:60:00'],
  ['00:15:00', '02:00:00'],
];

export const lunchDurationOptions = [
  { label: '15min', value: 15 },
  { label: '30min', value: 30 },
  { label: '45min', value: 45 },
  { label: '60min', value: 60 },
];
export const breakDurationOptions = [
  { label: '15min', value: 15 },
  { label: '30min', value: 30 },
  { label: '45min', value: 45 },
];
export const breakQuantityOptions = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
];
export const oneBreakHoursOptions = [
  { label: '2.00', value: 2.0 },
  { label: '2.25', value: 2.25 },
  { label: '2.50', value: 2.5 },
  { label: '2.75', value: 2.75 },
  { label: '3.00', value: 3.0 },
  { label: '3.25', value: 3.25 },
  { label: '3.50', value: 3.5 },
  { label: '3.75', value: 3.75 },
  { label: '4.00', value: 4.0 },
  { label: '4.25', value: 4.25 },
  { label: '4.50', value: 4.5 },
  { label: '4.75', value: 4.75 },
  { label: '5.00', value: 5.0 },
  { label: '5.25', value: 5.25 },
  { label: '5.50', value: 5.5 },
  { label: '5.75', value: 5.75 },
  { label: '6.00', value: 6.0 },
  { label: '6.25', value: 6.25 },
  { label: '6.50', value: 6.5 },
  { label: '6.75', value: 6.75 },
  { label: '7.00', value: 7.0 },
  { label: '7.25', value: 7.25 },
  { label: '7.50', value: 7.5 },
  { label: '7.75', value: 7.75 },
  { label: '8.00', value: 8.0 },
];
export const twoBreakHoursOptions = [
  { label: '2.00', value: 2.0 },
  { label: '2.25', value: 2.25 },
  { label: '2.50', value: 2.5 },
  { label: '2.75', value: 2.75 },
  { label: '3.00', value: 3.0 },
  { label: '3.25', value: 3.25 },
  { label: '3.50', value: 3.5 },
  { label: '3.75', value: 3.75 },
  { label: '4.00', value: 4.0 },
  { label: '4.25', value: 4.25 },
  { label: '4.50', value: 4.5 },
  { label: '4.75', value: 4.75 },
  { label: '5.00', value: 5.0 },
  { label: '5.25', value: 5.25 },
  { label: '5.50', value: 5.5 },
  { label: '5.75', value: 5.75 },
  { label: '6.00', value: 6.0 },
  { label: '6.25', value: 6.25 },
  { label: '6.50', value: 6.5 },
  { label: '6.75', value: 6.75 },
  { label: '7.00', value: 7.0 },
  { label: '7.25', value: 7.25 },
  { label: '7.50', value: 7.5 },
  { label: '7.75', value: 7.75 },
  { label: '8.00', value: 8.0 },
];
export const maxEmployeeHoursPerDayOptions = [
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '6 hours', value: 6 },
  { label: '8 hours', value: 8 },
  { label: '10 hours', value: 10 },
  { label: '12 hours', value: 12 },
];
export const maxClientHoursPerdayOptions = [
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '6 hours', value: 6 },
  { label: '8 hours', value: 8 },
  { label: '10 hours', value: 10 },
  { label: '12 hours', value: 12 },
];
export const maxGapEmployeeScheduleOptions = [
  { label: '0 min', value: 0 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '120 min', value: 120 },
  { label: '150 min', value: 150 },
  { label: '180 min', value: 180 },
];
export const maxGapClientScheduleOptions = [
  { label: '0 min', value: 0 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '120 min', value: 120 },
  { label: '150 min', value: 150 },
  { label: '180 min', value: 180 },
];
export const clientsMaxAppointmentsPerDayOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
];
export const employeesMaxAppointmentsPerDayOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
];
export const settingsBusinessHours = {
  startTime: { type: 'datetime', label: 'Start Time' },
  endTime: { type: 'datetime', label: 'End Time' },
};

export const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    location: '',
    description: '',
  },
};

export const greenGradientColors = [
  '#d1fbd8',
  '#a3ee5b',
  '#66d855',
  '#40ba0f',
  '#188300',
];
export const orangeGradientColors = [
  '#FDB777',
  '#FDA766',
  '#FD9346',
  '#FD7F2C',
  '#FF6200',
];
export const yellowGradientColors = [
  '#f9ffa1',
  '#fff060',
  '#f2db00',
  '#f0c200',
  '#e7a300',
];
export const allGradients = [
  ...greenGradientColors,
  ...orangeGradientColors,
  ...yellowGradientColors,
];

export const solutionTypes = [
  {
    label: 'Green',
    value: 'white',
  },
  {
    label: 'Orange',
    value: 'orange',
  },
  {
    label: 'Yellow',
    value: 'yellow',
  },
];

export const stackSizeOptions = [
  {
    label: '5',
    value: '5',
  },
  {
    label: '10',
    value: '10',
  },
  {
    label: '25',
    value: '25',
  },
  {
    label: '50',
    value: '50',
  },
  {
    label: '100',
    value: '100',
  },
];

export const solutionGeneratorSortOptions = [
  {
    label: 'Duration (longest)',
    value: 'duration-longest',
  },
  {
    label: 'Duration (shortest)',
    value: 'duration-shortest',
  },
  {
    label: 'Start Time (earliest)',
    value: 'start-time-earliest',
  },
  {
    label: 'Start Time (latest)',
    value: 'start-time-latest',
  },
  {
    label: 'End Time (earliest)',
    value: 'end-time-earliest',
  },
  {
    label: 'End Time (latest)',
    value: 'end-time-latest',
  },
];

export const timeFormats = {
  hour: '2-digit',
  minute: '2-digit',
  //second: '2-digit',
  hour12: false,
};

export const syncPastUpdatesOptions = [
  { value: 5 * 60 * 1000, label: '5 mins' }, // 5 minutes in milliseconds
  { value: 15 * 60 * 1000, label: '15 mins' }, // 15 minutes in milliseconds
  { value: 30 * 60 * 1000, label: '30 mins' }, // 30 minutes in milliseconds
  { value: 1 * 60 * 60 * 1000, label: '1 hour' }, // 1 hour in milliseconds
  { value: 3 * 60 * 60 * 1000, label: '3 hours' }, // 3 hours in milliseconds
  { value: 6 * 60 * 60 * 1000, label: '6 hours' }, // 6 hours in milliseconds
  { value: 12 * 60 * 60 * 1000, label: '12 hours' }, // 12 hours in milliseconds
];

export const importPastUpdatesOptions = [
  { value: 30 * 24 * 60 * 60 * 1000, label: '1 month' },
  { value: 60 * 24 * 60 * 60 * 1000, label: '2 months' },
  { value: 90 * 24 * 60 * 60 * 1000, label: '3 months' },
];

export const RESOURCE_TYPES = [
  'Employee',
  'Client',
  'Activity',
  'Location',
  'Block',
];
export const PERSON_RESOURCE_TYPES = ['Employee', 'Client'];

export const highlightRecentlyChangedTimeWindowOptions = [
  {
    value: '5_m',
    label: 'Last 5 minutes',
  },
  {
    value: '10_m',
    label: 'Last 10 minutes',
  },
  {
    value: '15_m',
    label: 'Last 15 minutes',
  },
  {
    value: '30_m',
    label: 'Last 30 minutes',
  },
  {
    value: '1_h',
    label: 'Last 1 hour',
  },
  {
    value: '2_h',
    label: 'Last 2 hours',
  },
  {
    value: '4_h',
    label: 'Last 4 hours',
  },
  {
    value: '24_h',
    label: 'Last 24 hours',
  },
  {
    value: 'today',
    label: 'Today',
  },
];
