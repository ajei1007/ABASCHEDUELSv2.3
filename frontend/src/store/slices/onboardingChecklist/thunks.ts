import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import { selectErrorMessage } from 'components/FormItems/error/errors';
import type { IApiOnboardingChecklistPhaseItem } from 'types/api';

// ==============================
// TYPES
// ==============================

/** Options for fetching the onboarding checklist */
interface FetchChecklistOptions {
  /** If true, bypasses cache and forces a fresh fetch */
  skipCache?: boolean;
}

/** Options for toggling a checklist item */
interface ToggleChecklistItemOptions {
  /** ID of the checklist item to toggle */
  itemId: string;
}

/** Response type for toggle operation */
interface ToggleChecklistItemResponse {
  /** ID of the item that was toggled */
  itemId: string;
  /** New completed state */
  isCompleted: boolean;
  /** Timestamp when the item was completed/uncompleted */
  completedAt: string | null;
}

// ==============================
// ASYNC THUNKS
// ==============================

/**
 * Fetches the onboarding checklist data
 *
 * @param options - Configuration options for the fetch request
 * @param options.skipCache - If true, bypasses cache and forces a fresh fetch
 * @returns Promise resolving to onboarding checklist phase items
 */
export const fetchOnboardingChecklist = createAsyncThunk<
  IApiOnboardingChecklistPhaseItem[],
  FetchChecklistOptions | undefined,
  {
    rejectValue: string;
    state: RootState;
  }
>(
  'onboardingChecklist/fetchChecklist',
  async (_options, { rejectWithValue }) => {
    try {
      const response = await axios.get('/onboardingChecklist');
      const data = (response?.data || []) as {
        checklist: IApiOnboardingChecklistPhaseItem;
      }[];
      const checklist = data.map((item) => item.checklist);
      return checklist;
    } catch (error: any) {
      const errorMessage = selectErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  },
  {
    condition: (options = {}, { getState }) => {
      const { skipCache = false } = options;
      const state = getState();
      const { fetchingStatus } = state.onboardingChecklist;

      // Prevent duplicate requests if already loading
      if (fetchingStatus === 'loading') {
        return false;
      }

      // Allow fetch if cache should be skipped or if not already successful
      return skipCache || fetchingStatus !== 'success';
    },
  },
);

/**
 * Toggles the completed state of a checklist item
 *
 * @param options - Configuration options for the toggle request
 * @param options.itemId - ID of the checklist item to toggle
 * @returns Promise resolving to the updated item state
 */
export const toggleChecklistItem = createAsyncThunk<
  ToggleChecklistItemResponse,
  ToggleChecklistItemOptions,
  {
    rejectValue: string;
    state: RootState;
  }
>(
  'onboardingChecklist/toggleItem',
  async ({ itemId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/onboardingChecklist/toggle-complete',
        {
          checklistItemId: itemId,
        },
      );

      const { isCompleted, completedAt } = response.data as Omit<
        ToggleChecklistItemResponse,
        'itemId'
      >;

      return {
        itemId,
        isCompleted,
        completedAt,
      };
    } catch (error: any) {
      const errorMessage = selectErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  },
  {
    condition: ({ itemId }, { getState }) => {
      const state = getState();
      const { togglingItems } = state.onboardingChecklist;

      // Prevent duplicate requests for the same item
      return !togglingItems[itemId];
    },
  },
);
