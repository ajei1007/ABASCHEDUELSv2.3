import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TIntegrationSoftware } from 'types';

// ** Initial State
const initialState = {
  software: null as TIntegrationSoftware | null,
  shownLoginModal: false,
  shownIntegrationModal: false,
  checkingCredentials: false,
};

export const newIntegrationSlice = createSlice({
  name: 'newIntegration',
  initialState,
  reducers: {
    setSoftware(state, action: PayloadAction<TIntegrationSoftware | null>) {
      state.software = action.payload;
    },
    setShownLoginModal(state, action: PayloadAction<boolean>) {
      state.shownLoginModal = action.payload;
    },
    setShownIntegrationModal(state, action: PayloadAction<boolean>) {
      state.shownIntegrationModal = action.payload;
    },
    setCheckingCredentials(state, action: PayloadAction<boolean>) {
      state.checkingCredentials = action.payload;
    },
  },
});

export const {
  setSoftware,
  setShownLoginModal,
  setShownIntegrationModal,
  setCheckingCredentials,
} = newIntegrationSlice.actions;

export default newIntegrationSlice.reducer;
