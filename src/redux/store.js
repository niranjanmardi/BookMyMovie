import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './bookingSlice';
import authReducer from './authSlice';
import { bookingMiddleware } from './bookingMiddleware';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(bookingMiddleware),
});

export default store;
