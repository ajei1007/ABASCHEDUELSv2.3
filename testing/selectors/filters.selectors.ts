export const filtersSelectors = {
  createEventButton: 'button:has-text("Create Event")',
  activityTab: 'button:has-text("Activity")',
  dragTab: 'button:has-text("Drag Events")',
  typeCheckboxes: '.calendar-events-filter input[type=checkbox]',
  locationCheckboxes: '.location-filter input[type=checkbox]',
} as const;