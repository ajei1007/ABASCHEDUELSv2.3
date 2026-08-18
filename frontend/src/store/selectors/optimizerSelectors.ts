import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../';

export const optimizerResultsSelector = (state: RootState) =>
  state.optimizer.optimizerResults;

export const optimizerResultsSelectedIdsMapSelector = (state: RootState) =>
  state.optimizer.optimizerResultsSelectedIdsMap;

export const isOptimizerResultsPreviewModeSelector = createSelector(
  [optimizerResultsSelector],
  (results) =>
    results.length > 0 &&
    results.some(
      (item) =>
        item.creatingEvents.length > 0 ||
        item.deletingEvents.length > 0 ||
        item.updatingEvents.length > 0,
    ),
);

export const optimizerCreatingEventsSelector = createSelector(
  [optimizerResultsSelector],
  (results) =>
    Array.isArray(results)
      ? results.flatMap((result) => result.creatingEvents)
      : [],
);

export const optimizerUpdatingEventsSelector = createSelector(
  [optimizerResultsSelector],
  (results) =>
    Array.isArray(results)
      ? results.flatMap((result) => result.updatingEvents)
      : [],
);

export const optimizerDeletingEventsSelector = createSelector(
  [optimizerResultsSelector],
  (results) =>
    Array.isArray(results)
      ? results.flatMap((result) => result.deletingEvents)
      : [],
);

export const optimizerDisabledConstraintsSelector = createSelector(
  [optimizerResultsSelector],
  (results) =>
    Array.isArray(results)
      ? results.flatMap((result) =>
          Array.isArray(result.disabled_constraints)
            ? result.disabled_constraints
            : [],
        )
      : [],
);

export const optimizerCreatingUpdatingEventsSelector = createSelector(
  [optimizerCreatingEventsSelector, optimizerUpdatingEventsSelector],
  (creatingEvents, updatingEvents) => [...creatingEvents, ...updatingEvents],
);

export const optimizerUpdatingEventsIdsSetSelector = createSelector(
  [optimizerUpdatingEventsSelector],
  (updatingEvents) => new Set(updatingEvents.map((e) => e.id)),
);

export const optimizerDeletingEventsIdsSetSelector = createSelector(
  [optimizerDeletingEventsSelector],
  (deletingEvents) => new Set(deletingEvents.map((e) => e.id)),
);

export const optimizerJobsSelector = (state: RootState) =>
  state.optimizer.optimizerJobs;

export const hasRunningOptimizerJobsSelector = createSelector(
  [optimizerJobsSelector],
  (optimizerJobs) => optimizerJobs.length > 0,
);

export const optimizerCreatingEventsNumberSelector = createSelector(
  [optimizerCreatingEventsSelector],
  (creatingEvents) => creatingEvents.length,
);

export const optimizerUpdatingEventsNumberSelector = createSelector(
  [optimizerUpdatingEventsSelector],
  (updatingEvents) => updatingEvents.length,
);

export const optimizerDeletingEventsNumberSelector = createSelector(
  [optimizerDeletingEventsSelector],
  (deletingEvents) => deletingEvents.length,
);
