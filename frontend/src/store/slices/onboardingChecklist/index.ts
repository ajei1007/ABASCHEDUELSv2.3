import { createSlice } from '@reduxjs/toolkit';
import type { IApiOnboardingChecklistPhaseItem } from 'types/api';
import {
  clearChecklist,
  fetchOnboardingChecklist,
  toggleChecklistItem,
} from './actions';

const initialState = {
  fetchingStatus: 'idle' as 'idle' | 'loading' | 'success' | 'error', // Initial status of the fetching operation
  error: null as string | null,
  checklist: [] as IApiOnboardingChecklistPhaseItem[],
  // Track which items are currently being toggled to prevent concurrent requests
  togglingItems: {} as Record<string, boolean>,
};

const onboardingChecklistSlice = createSlice({
  name: 'onboardingChecklist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOnboardingChecklist.pending, (state) => {
        state.fetchingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchOnboardingChecklist.fulfilled, (state, action) => {
        state.fetchingStatus = 'success';
        state.checklist = action.payload;
      })
      .addCase(fetchOnboardingChecklist.rejected, (state, action) => {
        state.fetchingStatus = 'error';
        state.error = action.payload as string;
      })
      .addCase(clearChecklist, (state) => {
        state.checklist = [];
        state.error = null;
        state.fetchingStatus = 'idle';
        state.togglingItems = {};
      })
      .addCase(toggleChecklistItem.pending, (state, action) => {
        const { itemId } = action.meta.arg;
        state.togglingItems[itemId] = true;
      })
      .addCase(toggleChecklistItem.fulfilled, (state, action) => {
        const { itemId, isCompleted, completedAt } = action.payload;
        delete state.togglingItems[itemId];

        // Update the specific item in the checklist
        for (const phase of state.checklist) {
          for (const item of phase.items) {
            if (item.id === itemId) {
              item.isCompleted = isCompleted;
              item.completedAt = completedAt;
              return;
            }
          }
        }
      })
      .addCase(toggleChecklistItem.rejected, (state, action) => {
        const { itemId } = action.meta.arg;
        delete state.togglingItems[itemId];
      });
  },
});

export default onboardingChecklistSlice.reducer;
