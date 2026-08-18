export const schedulerSelectors = {
  timelineGrid: '.fc-timeline',
  dailyViewButton: '[aria-label="Switch calendar view"]',
  optimizerButton: 'button:has-text("Run Optimizer")',
  expandEmployeesButton: '.fc-icon-plus-square',
  calendarEvent: '[data-qa="calendar-event"]',
  employeeGroupExpander: '.fc-resource-group[data-qa="resource-group-label"][data-resource-group="Employee"] .fc-datagrid-expander',
  employeeRow: '[data-qa="resource-label"][data-resource-type="Employee"]',
  timeSlotLane: (time: string) => `.fc-timeline-slot.fc-timeline-slot-lane.fc-slot[data-qa="time-slot-lane"][data-time="${time}"]`,
  // Date range selectors
  undoButton: {name: 'Undo'},
  redoButton: {name: 'Redo'},
} as const;