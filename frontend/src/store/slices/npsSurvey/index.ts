import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { EventEmitter } from 'utils/eventEmitter';

const initialState = {
  eventEmitter: new EventEmitter<{
    checkNpsSurvey: {
      chance: number;
    };
  }>(),
  npsSurveyModalShown: false,
};

const npsSurveySlice = createSlice({
  name: 'npsSurvey',
  initialState,
  reducers: {
    setNpsSurveyModalShown: (state, action: PayloadAction<boolean>) => {
      state.npsSurveyModalShown = action.payload;
    },
  },
});

export const { setNpsSurveyModalShown } = npsSurveySlice.actions;

export default npsSurveySlice.reducer;
