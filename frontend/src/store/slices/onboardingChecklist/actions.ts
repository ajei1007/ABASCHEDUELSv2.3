// src/slices/ticketSlice/actions.ts
import { createAction } from '@reduxjs/toolkit';

export const clearChecklist = createAction(
  'onboardingChecklist/clearChecklist',
);

export { fetchOnboardingChecklist, toggleChecklistItem } from './thunks';
