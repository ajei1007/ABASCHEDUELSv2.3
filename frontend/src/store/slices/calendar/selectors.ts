import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'store';

// Selector to retrieve the entire calendar state from the Redux store
export const selectCalendarState = (state: RootState) => state.calendar;

// Selector to get the list of activity resources from the calendar state
export const selectActivityResources = createSelector(
  [selectCalendarState],
  (calendar) => calendar.activityResources,
);

// Selector to get the list of location resources from the calendar state
export const selectLocationResources = createSelector(
  [selectCalendarState],
  (calendar) => calendar.locationResources,
);

// Selector to get the lost of block resources from the calendar state
export const selectBlockResources = createSelector(
  [selectCalendarState],
  (calendar) => calendar.blockResources,
);

// Selector to get a Set of all activity resource IDs for quick lookup and membership checks
export const selectActivityResourceIdsSet = createSelector(
  [selectActivityResources],
  (activityResources) =>
    new Set(activityResources.map((resource) => resource.id)),
);

// Selector to get a Set of all location resource IDs for quick lookup and membership checks
export const selectLocationResourceIdsSet = createSelector(
  [selectLocationResources],
  (locationResources) =>
    new Set(locationResources.map((resource) => resource.id)),
);

// Selector to get a Set of all block resource IDs for quick lookup and membership checks
export const selectBlockResourceIdsSet = createSelector(
  [selectBlockResources],
  (blockResources) => new Set(blockResources.map((resource) => resource.id)),
);

export const selectCalendarEvents = (state: RootState) => state.calendar.events;

export const selectCalendarSupervisionEventsMap = createSelector(
  [selectCalendarEvents],
  (events) =>
    events.reduce((acc: Map<string, boolean>, event: any) => {
      if (event.supervisionId) {
        acc.set(event.supervisionId, true);
      }
      return acc;
    }, new Map<string, boolean>()) as Map<string, boolean>,
);
