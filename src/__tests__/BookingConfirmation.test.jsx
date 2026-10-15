// ============================================================
// Experiment 1 - Test Case (e)
// File: BookingConfirmation.test.jsx
// Tool: Jest (pure logic testing + Redux state testing)
// What this tests: Booking confirmation, localStorage, Redux
// ============================================================

import {
  confirmNewBooking,
  getAllSavedBookings,
  buildShowKey,
  getBookedSeatsForShow,
} from '../services/bookingService';

import bookingReducer, {
  confirmBookingSuccess,
  setBookingError,
  clearBooking,
} from '../redux/bookingSlice';

// Fake movie data for testing
const mockMovie = {
  id: 'm1',
  title: 'Jailer 2',
  poster: '/posters/jailer2.jpg',
  category: 'Tamil',
  language: 'Tamil',
  year: 2026,
  rating: 8.8,
  runtime: '165 min',
};

// Fake theatre data
const mockTheatre = {
  id: 'th1',
  name: 'KG Cinemas (Multiplex)',
  area: 'Race Course',
  address: 'Bunglaw Road, Race Course, Coimbatore',
  screens: 'Audi 1',
};

// Fake date
const mockDate = {
  iso: '2026-10-15',
  displayLabel: 'Thu, Oct 15',
  full: 'Thursday, 15 October 2026',
};

// Fake showtime
const mockShowtime = {
  id: 'st1000',
  time: '10:00 AM',
  label: 'Morning Show',
};

describe('Experiment 1: Booking Confirmation & Persistence', () => {

  // Before each test, clear localStorage so tests don't affect each other
  beforeEach(() => {
    window.localStorage.clear();
  });

  // ==== Section 1: confirmNewBooking Function Tests ====
  describe('confirmNewBooking Core Engine', () => {

    // Test Case 1: Booking should fail if movie or seats are missing
    it('throws an error if required booking parameters are missing', () => {
      // Try booking with movie = null (missing movie)
      expect(() => {
        confirmNewBooking({
          movie: null,          // missing!
          theatre: mockTheatre,
          date: mockDate,
          showtime: mockShowtime,
          seats: ['A1'],
        });
      }).toThrow(/Incomplete booking details/i); // should throw an error

      // Try booking with empty seats array
      expect(() => {
        confirmNewBooking({
          movie: mockMovie,
          theatre: mockTheatre,
          date: mockDate,
          showtime: mockShowtime,
          seats: [],  // no seats selected!
        });
      }).toThrow(/Incomplete booking details/i); // should also throw
    });

    // Test Case 2: A successful booking should return a record with BMM-CBE- reference ID
    it('creates a verified booking record with BMM-CBE- reference format', () => {
      // Build a unique key for this show (to check already booked seats)
      const showKey = buildShowKey(mockMovie.id, mockTheatre.id, mockDate.iso, mockShowtime.id);

      // Get already booked seats for this show
      const booked = getBookedSeatsForShow(showKey);

      // Find 2 free seats from row A
      const allRegular = ['A1', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11'];
      const freeSeats = allRegular.filter((s) => !booked.includes(s)).slice(0, 2);

      // Confirm the booking with 2 free seats
      const record = confirmNewBooking({
        movie: mockMovie,
        theatre: mockTheatre,
        date: mockDate,
        showtime: mockShowtime,
        seats: freeSeats,
      });

      // The returned record should be defined
      expect(record).toBeDefined();

      // Booking ID should follow the BMM-CBE-XXXXXX format
      expect(record.bookingId).toMatch(/^BMM-CBE-[2-9A-Z]{6}$/);
      expect(record.reference).toMatch(/^BMM-CBE-[2-9A-Z]{6}$/);

      // Seats should match what we passed
      expect(record.seats).toEqual(freeSeats);

      // Total amount for 2 Regular seats = 2 x 150 = 300
      expect(record.amount).toBe(300);

      // Movie and theatre info should be saved
      expect(record.movie.title).toBe('Jailer 2');
      expect(record.theatre.name).toBe('KG Cinemas (Multiplex)');
    });

    // Test Case 3: Booking should be saved in localStorage
    it('persists booking in localStorage and retrieves from history', () => {
      const showKey = buildShowKey(mockMovie.id, mockTheatre.id, mockDate.iso, mockShowtime.id);
      const booked = getBookedSeatsForShow(showKey);

      // Find one free seat from row F (Premium)
      const freeSeat = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11'].find(
        (s) => !booked.includes(s)
      );

      // Confirm the booking
      const record = confirmNewBooking({
        movie: mockMovie,
        theatre: mockTheatre,
        date: mockDate,
        showtime: mockShowtime,
        seats: [freeSeat],
      });

      // Get all saved bookings from localStorage
      const history = getAllSavedBookings();

      // At least one booking should exist
      expect(history.length).toBeGreaterThanOrEqual(1);

      // The first booking in history should match our record
      expect(history[0].bookingId).toBe(record.bookingId);
      expect(history[0].seats).toEqual([freeSeat]);
    });

    // Test Case 4: You should NOT be able to book the same seat twice
    it('prevents double-booking the same seats for the same show screening', () => {
      const showKey = buildShowKey(mockMovie.id, mockTheatre.id, mockDate.iso, mockShowtime.id);
      const booked = getBookedSeatsForShow(showKey);

      // Find one free Recliner seat from row J
      const freeSeat = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10', 'J11'].find(
        (s) => !booked.includes(s)
      );

      // First booking - should succeed
      confirmNewBooking({
        movie: mockMovie,
        theatre: mockTheatre,
        date: mockDate,
        showtime: mockShowtime,
        seats: [freeSeat],
      });

      // Second booking for the same seat - should throw an error
      expect(() => {
        confirmNewBooking({
          movie: mockMovie,
          theatre: mockTheatre,
          date: mockDate,
          showtime: mockShowtime,
          seats: [freeSeat],  // same seat as before!
        });
      }).toThrow(new RegExp(`already booked for this show: ${freeSeat}`, 'i'));
    });

  });

  // ==== Section 2: Redux State Tests for Booking ====
  describe('Redux Booking State Confirmation Handlers', () => {

    // Test Case 5: confirmBookingSuccess should set bookingConfirmed = true in Redux
    it('updates state to confirmed with booking reference on confirmBookingSuccess', () => {
      // Start state with booking not confirmed
      const initialState = {
        bookingConfirmed: false,
        bookingReference: null,
        bookingError: 'some old error',
      };

      // Dispatch confirmBookingSuccess with a reference ID
      const nextState = bookingReducer(
        initialState,
        confirmBookingSuccess('BMM-CBE-ABC123')
      );

      // bookingConfirmed should now be true
      expect(nextState.bookingConfirmed).toBe(true);

      // Reference ID should be saved
      expect(nextState.bookingReference).toBe('BMM-CBE-ABC123');

      // Previous error should be cleared
      expect(nextState.bookingError).toBeNull();
    });

    // Test Case 6: setBookingError should save the error message in Redux
    it('sets bookingError on failure', () => {
      const initialState = {
        bookingError: null,
      };

      // Dispatch setBookingError with an error message
      const nextState = bookingReducer(
        initialState,
        setBookingError('Payment gateway timeout')
      );

      // bookingError should now have the message
      expect(nextState.bookingError).toBe('Payment gateway timeout');
    });

    // Test Case 7: clearBooking should reset everything back to default
    it('clears all booking state on clearBooking', () => {
      // Start with a fully filled booking state
      const populatedState = {
        selectedMovie: mockMovie,
        selectedTheatre: mockTheatre,
        selectedSeats: ['A1', 'A2'],
        totalAmount: 300,
        bookingConfirmed: true,
        bookingReference: 'BMM-CBE-XYZ789',
      };

      // Dispatch clearBooking to reset everything
      const resetState = bookingReducer(populatedState, clearBooking());

      // All values should be reset to null/empty/false
      expect(resetState.selectedMovie).toBeNull();
      expect(resetState.selectedTheatre).toBeNull();
      expect(resetState.selectedSeats).toEqual([]);
      expect(resetState.totalAmount).toBe(0);
      expect(resetState.bookingConfirmed).toBe(false);
      expect(resetState.bookingReference).toBeNull();
    });

  });

});
