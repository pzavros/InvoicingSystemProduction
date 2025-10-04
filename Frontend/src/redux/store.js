import { configureStore } from '@reduxjs/toolkit';
import invoicesReducer from './invoicesSlice';

export const store = configureStore({
  reducer: {
    invoices: invoicesReducer,
  },
});
