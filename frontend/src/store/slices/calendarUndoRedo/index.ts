import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ICalendarOperationItem } from 'types';

const initialState = {
  operations: [] as ICalendarOperationItem[],
  currentIndex: 0,
};

export const calendarUndoRedoSlice = createSlice({
  name: 'calendarUndoRedo',
  initialState,
  reducers: {
    setOperations(state, action: PayloadAction<ICalendarOperationItem[]>) {
      state.operations = action.payload;
    },
    setOperationCurrentIndex(state, action: PayloadAction<number>) {
      state.currentIndex = action.payload;
    },
  },
});

export const { setOperations, setOperationCurrentIndex } =
  calendarUndoRedoSlice.actions;

export default calendarUndoRedoSlice.reducer;
