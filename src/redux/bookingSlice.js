import { createSlice } from '@reduxjs/toolkit';
import { calculateSeatsPriceBreakdown, SEAT_PRICES } from '../data/seatLayout.js';
import { getAvailableBookingDates } from '../data/showtimes.js';

const defaultDates = getAvailableBookingDates(7);

const initialPricing = {
  Regular: { count: 0, rate: SEAT_PRICES?.Regular || 150, total: 0, seats: [] },
  Premium: { count: 0, rate: SEAT_PRICES?.Premium || 200, total: 0, seats: [] },
  Recliner: { count: 0, rate: SEAT_PRICES?.Recliner || 300, total: 0, seats: [] },
  totalAmount: 0,
  totalSeats: 0,
};

const initialState = {
  selectedMovie: null,
  selectedTheatre: null,
  selectedDate: defaultDates[0] || null,
  selectedTime: null,
  selectedSeats: [],
  totalAmount: 0,
  totalSeats: 0,
  priceBreakdown: initialPricing,
  bookingConfirmed: false,
  bookingReference: null,
  bookingError: null,
  searchQuery: '',
  theatreAreaFilter: 'All Areas',
  theatreSearchQuery: '',
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // 1. Select Movie Action
    setMovie: (state, action) => {
      state.selectedMovie = action.payload;
      state.selectedTheatre = null;
      state.selectedDate = defaultDates[0] || null;
      state.selectedTime = null;
      state.selectedSeats = [];
      state.totalAmount = 0;
      state.totalSeats = 0;
      state.priceBreakdown = initialPricing;
      state.bookingConfirmed = false;
      state.bookingReference = null;
      state.bookingError = null;
    },

    // 2. Select Theatre Action
    setTheatre: (state, action) => {
      state.selectedTheatre = action.payload;
      state.selectedTime = null;
      state.selectedSeats = [];
      state.totalAmount = 0;
      state.totalSeats = 0;
      state.priceBreakdown = initialPricing;
      state.bookingConfirmed = false;
      state.bookingReference = null;
      state.bookingError = null;
    },

    // 3. Select Booking Date Action
    setShowDate: (state, action) => {
      state.selectedDate = action.payload;
      state.selectedTime = null;
      state.selectedSeats = [];
      state.totalAmount = 0;
      state.totalSeats = 0;
      state.priceBreakdown = initialPricing;
      state.bookingConfirmed = false;
      state.bookingReference = null;
      state.bookingError = null;
    },

    // 4. Select Show Timing Action
    setShowTime: (state, action) => {
      state.selectedTime = action.payload;
      state.selectedSeats = [];
      state.totalAmount = 0;
      state.totalSeats = 0;
      state.priceBreakdown = initialPricing;
      state.bookingConfirmed = false;
      state.bookingReference = null;
      state.bookingError = null;
    },

    // 5. Toggle Seat Selection (Select / Deselect) & Dynamic Price Calculation
    toggleSeat: (state, action) => {
      const seatId = action.payload;
      const index = state.selectedSeats.indexOf(seatId);

      if (index >= 0) {
        state.selectedSeats.splice(index, 1);
      } else {
        state.selectedSeats.push(seatId);
      }

      const breakdown = calculateSeatsPriceBreakdown(state.selectedSeats);
      state.priceBreakdown = breakdown;
      state.totalAmount = breakdown.totalAmount;
      state.totalSeats = breakdown.totalSeats;
      state.bookingConfirmed = false;
      state.bookingError = null;
    },

    // 6. Remove Seat Action & Recalculate Totals
    removeSeat: (state, action) => {
      const seatId = action.payload;
      state.selectedSeats = state.selectedSeats.filter((s) => s !== seatId);

      const breakdown = calculateSeatsPriceBreakdown(state.selectedSeats);
      state.priceBreakdown = breakdown;
      state.totalAmount = breakdown.totalAmount;
      state.totalSeats = breakdown.totalSeats;
      state.bookingConfirmed = false;
      state.bookingError = null;
    },

    // 7. Search Filter Action
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    // 8. Theatre Filter Actions
    setTheatreAreaFilter: (state, action) => {
      state.theatreAreaFilter = action.payload;
    },

    setTheatreSearchQuery: (state, action) => {
      state.theatreSearchQuery = action.payload;
    },

    // 9. Confirm Booking Action
    confirmBookingSuccess: (state, action) => {
      state.bookingConfirmed = true;
      state.bookingReference = action.payload;
      state.bookingError = null;
    },

    // 10. Error Handler Action
    setBookingError: (state, action) => {
      state.bookingError = action.payload;
    },

    // 11. Clear / Reset All Booking State
    clearBooking: (state) => {
      state.selectedMovie = null;
      state.selectedTheatre = null;
      state.selectedDate = defaultDates[0] || null;
      state.selectedTime = null;
      state.selectedSeats = [];
      state.totalAmount = 0;
      state.totalSeats = 0;
      state.priceBreakdown = initialPricing;
      state.bookingConfirmed = false;
      state.bookingReference = null;
      state.bookingError = null;
      state.searchQuery = '';
      state.theatreAreaFilter = 'All Areas';
      state.theatreSearchQuery = '';
    },
  },
});

export const {
  setMovie,
  setTheatre,
  setShowDate,
  setShowTime,
  toggleSeat,
  removeSeat,
  setSearchQuery,
  setTheatreAreaFilter,
  setTheatreSearchQuery,
  confirmBookingSuccess,
  setBookingError,
  clearBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
