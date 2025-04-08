// lib/store.ts
import { configureStore } from '@reduxjs/toolkit';
import clinicReducer from './clinicSlice';

export const store = configureStore({
  reducer: {
    clinic: clinicReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;