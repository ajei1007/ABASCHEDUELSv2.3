import { configureStore } from '@reduxjs/toolkit';
import { createRootReducer } from './reducers/rootReducer';

export const store = configureStore({
  reducer: createRootReducer(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers({
      autoBatch: {
        type: 'timer',
        timeout: 0,
      },
    }),
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
