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

const mockTheatre = {
  id: 'th1',
  name: 'KG Cinemas (Multiplex)',
  area: 'Race Course',
  address: 'Bunglaw Road, Race Course, Coimbatore',
  screens: 'Audi 1',
};

const mockDate = {
  iso: '2026-10-15',
  displayLabel: 'Thu, Oct 15',
  full: 'Thursday, 15 October 2026',
};

const mockShowtime = {
  id: 'st1000',
  time: '10:00 AM',
  label: 'Morning Show',
};

describe('Experiment 1: Booking Confirmation & Persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('confirmNewBooking Core Engine', () => {
    it('throws an error if required booking parameters are missing', () => {
      expect(() => {
        confirmNewBooking({
          movie: null,
          theatre: mockTheatre,
          date: mockDate,
          showtime: mockShowtime,
          seats: ['A1'],
        });
      }).toThrow(/Incomplete booking details/i);

      expect(() => {
        confirmNewBooking({
          movie: mockMovie,
          theatre: mockTheatre,
          date: mockDate,
          showtime: mockShowtime,
          seats: [], // empty seats
        });
      }).toThrow(/Incomplete booking details/i);
    });

    it('creates a verified booking record with BMM-CBE- reference format', () => {
      const showKey = buildShowKey(mockMovie.id, mockTheatre.id, mockDate.iso, mockShowtime.id);
      const booked = getBookedSeatsForShow(showKey);
      const allRegular = ['A1', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11'];
      const freeSeats = allRegular.filter((s) => !booked.includes(s)).slice(0, 2);

      const record = confirmNewBooking({
        movie: mockMovie,
        theatre: mockTheatre,
        date: mockDate,
        showtime: mockShowtime,
        seats: freeSeats,
      });

      expect(record).toBeDefined();
      expect(record.bookingId).toMatch(/^BMM-CBE-[2-9A-Z]{6}$/);
      expect(record.reference).toMatch(/^BMM-CBE-[2-9A-Z]{6}$/);
      expect(record.seats).toEqual(freeSeats);
      expect(record.amount).toBe(300);
      expect(record.movie.title).toBe('Jailer 2');
      expect(record.theatre.name).toBe('KG Cinemas (Multiplex)');
    });

    it('persists booking in localStorage and retrieves from history', () => {
      const showKey = buildShowKey(mockMovie.id, mockTheatre.id, mockDate.iso, mockShowtime.id);
      const booked = getBookedSeatsForShow(showKey);
      const freeSeat = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11'].find(
        (s) => !booked.includes(s)
      );

      const record = confirmNewBooking({
        movie: mockMovie,
        theatre: mockTheatre,
        date: mockDate,
        showtime: mockShowtime,
        seats: [freeSeat],
      });

      const history = getAllSavedBookings();
      expect(history.length).toBeGreaterThanOrEqual(1);
      expect(history[0].bookingId).toBe(record.bookingId);
      expect(history[0].seats).toEqual([freeSeat]);
    });

    it('prevents double-booking the same seats for the same show screening', () => {
      const showKey = buildShowKey(mockMovie.id, mockTheatre.id, mockDate.iso, mockShowtime.id);
      const booked = getBookedSeatsForShow(showKey);
      const freeSeat = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10', 'J11'].find(
        (s) => !booked.includes(s)
      );

      // First booking succeeds
      confirmNewBooking({
        movie: mockMovie,
        theatre: mockTheatre,
        date: mockDate,
        showtime: mockShowtime,
        seats: [freeSeat],
      });

      // Attempting to book the same seat again must throw conflict error
      expect(() => {
        confirmNewBooking({
          movie: mockMovie,
          theatre: mockTheatre,
          date: mockDate,
          showtime: mockShowtime,
          seats: [freeSeat],
        });
      }).toThrow(new RegExp(`already booked for this show: ${freeSeat}`, 'i'));
    });
  });

  describe('Redux Booking State Confirmation Handlers', () => {
    it('updates state to confirmed with booking reference on confirmBookingSuccess', () => {
      const initialState = {
        bookingConfirmed: false,
        bookingReference: null,
        bookingError: 'some old error',
      };

      const nextState = bookingReducer(
        initialState,
        confirmBookingSuccess('BMM-CBE-ABC123')
      );

      expect(nextState.bookingConfirmed).toBe(true);
      expect(nextState.bookingReference).toBe('BMM-CBE-ABC123');
      expect(nextState.bookingError).toBeNull();
    });

    it('sets bookingError on failure', () => {
      const initialState = {
        bookingError: null,
      };

      const nextState = bookingReducer(
        initialState,
        setBookingError('Payment gateway timeout')
      );

      expect(nextState.bookingError).toBe('Payment gateway timeout');
    });

    it('clears all booking state on clearBooking', () => {
      const populatedState = {
        selectedMovie: mockMovie,
        selectedTheatre: mockTheatre,
        selectedSeats: ['A1', 'A2'],
        totalAmount: 300,
        bookingConfirmed: true,
        bookingReference: 'BMM-CBE-XYZ789',
      };

      const resetState = bookingReducer(populatedState, clearBooking());

      expect(resetState.selectedMovie).toBeNull();
      expect(resetState.selectedTheatre).toBeNull();
      expect(resetState.selectedSeats).toEqual([]);
      expect(resetState.totalAmount).toBe(0);
      expect(resetState.bookingConfirmed).toBe(false);
      expect(resetState.bookingReference).toBeNull();
    });
  });
});
