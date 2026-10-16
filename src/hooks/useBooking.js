import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setMovie,
  setTheatre,
  setShowDate,
  setShowTime,
  toggleSeat,
  removeSeat,
  setSearchQuery,
  setTheatreAreaFilter as setReduxTheatreAreaFilter,
  setTheatreSearchQuery as setReduxTheatreSearchQuery,
  confirmBookingSuccess,
  setBookingError,
  clearBooking,
} from '../redux/bookingSlice';
import { COIMBATORE_THEATRES } from '../data/theatres.js';
import { getAvailableBookingDates } from '../data/showtimes.js';
import { ROW_CONFIG, SEAT_PRICES, TOTAL_SEATS_PER_SCREEN } from '../data/seatLayout.js';
import {
  buildShowKey,
  getBookedSeatsForShow,
  syncShowBookedSeats,
  confirmNewBooking,
  getAllSavedBookings,
} from '../services/bookingService.js';
import { broadcastChannel } from '../services/cloudSyncService.js';
import { createBooking } from '../services/bookingApiService.js';
import { FALLBACK_MOVIES_2026 } from '../data/fallbackMovies.js';

export function useBooking() {
  const dispatch = useDispatch();
  const bookingState = useSelector((state) => state.booking);
  const authState = useSelector((state) => state.auth);
  const currentUsername = authState?.user?.username;

  // Available 8 days (Today + 7 days)
  const availableDates = useMemo(() => getAvailableBookingDates(7), []);
  const selectedDate = bookingState.selectedDate || availableDates[0];

  // Saved bookings for the active user (reactive state)
  const [allBookings, setAllBookings] = useState(() => getAllSavedBookings(currentUsername));

  useEffect(() => {
    setAllBookings(getAllSavedBookings(currentUsername));
  }, [currentUsername]);

  const lastBooking = useMemo(() => {
    return allBookings && allBookings.length > 0 ? allBookings[0] : null;
  }, [allBookings]);

  // Current screening key based on Redux selection
  const currentShowKey = useMemo(() => {
    if (
      !bookingState.selectedMovie ||
      !bookingState.selectedTheatre ||
      !selectedDate ||
      !bookingState.selectedTime
    ) {
      return null;
    }
    return buildShowKey(
      bookingState.selectedMovie.id,
      bookingState.selectedTheatre.id,
      selectedDate.iso || selectedDate,
      bookingState.selectedTime.id || bookingState.selectedTime.time
    );
  }, [
    bookingState.selectedMovie,
    bookingState.selectedTheatre,
    selectedDate,
    bookingState.selectedTime,
  ]);

  // Reactive cloud-synced booked seats state
  const [cloudSeats, setCloudSeats] = useState([]);

  // Fetch latest booked seats from cloud whenever screening showKey changes
  useEffect(() => {
    if (!currentShowKey) {
      setCloudSeats([]);
      return;
    }

    let isSubscribed = true;
    syncShowBookedSeats(currentShowKey)
      .then((seats) => {
        if (isSubscribed && Array.isArray(seats)) {
          setCloudSeats(seats);
        }
      })
      .catch(() => {});

    // Listen for local DOM seat updates
    const handleSeatsUpdated = (e) => {
      if (e.detail?.showKey === currentShowKey && Array.isArray(e.detail?.bookedSeats)) {
        setCloudSeats((prev) => Array.from(new Set([...prev, ...e.detail.bookedSeats])));
      }
    };
    window.addEventListener('bmm_seats_updated', handleSeatsUpdated);

    // Listen for cross-tab / cross-window broadcast updates
    const handleBroadcast = (e) => {
      if (e.data?.type === 'SEATS_BOOKED' && e.data?.showKey === currentShowKey && Array.isArray(e.data?.seats)) {
        setCloudSeats((prev) => Array.from(new Set([...prev, ...e.data.seats])));
      }
    };
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }

    return () => {
      isSubscribed = false;
      window.removeEventListener('bmm_seats_updated', handleSeatsUpdated);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
    };
  }, [currentShowKey]);

  // Combined booked seats: deterministic pre-booked + local user confirmed + cloud-synced seats
  const bookedSeatsForCurrentShow = useMemo(() => {
    if (!currentShowKey) return [];
    const local = getBookedSeatsForShow(currentShowKey, bookingState.bookingConfirmed);
    return Array.from(new Set([...local, ...cloudSeats]));
  }, [currentShowKey, bookingState.bookingConfirmed, cloudSeats]);

  // Filter movies by search query
  const filteredMovies = useMemo(() => {
    const q = (bookingState.searchQuery || '').trim().toLowerCase();
    if (!q) return FALLBACK_MOVIES_2026;
    return FALLBACK_MOVIES_2026.filter((movie) =>
      movie.title.toLowerCase().includes(q)
    );
  }, [bookingState.searchQuery]);

  // Redux Action Dispatchers
  const handleSelectMovie = useCallback(
    (movie) => {
      dispatch(setMovie(movie));
    },
    [dispatch]
  );

  const handleSelectTheatre = useCallback(
    (theatre) => {
      dispatch(setTheatre(theatre));
    },
    [dispatch]
  );

  const handleSelectDate = useCallback(
    (date) => {
      dispatch(setShowDate(date));
    },
    [dispatch]
  );

  const handleSelectTime = useCallback(
    (timing) => {
      dispatch(setShowTime(timing));
    },
    [dispatch]
  );

  const handleToggleSeat = useCallback(
    (seatId) => {
      if (bookedSeatsForCurrentShow.includes(seatId)) {
        return false;
      }
      dispatch(toggleSeat(seatId));
      return true;
    },
    [dispatch, bookedSeatsForCurrentShow]
  );

  const handleRemoveSeat = useCallback(
    (seatId) => {
      dispatch(removeSeat(seatId));
    },
    [dispatch]
  );

  const handleSearchChange = useCallback(
    (value) => {
      dispatch(setSearchQuery(value));
    },
    [dispatch]
  );

  const setTheatreAreaFilter = useCallback(
    (area) => {
      dispatch(setReduxTheatreAreaFilter(area));
    },
    [dispatch]
  );

  const setTheatreSearchQuery = useCallback(
    (query) => {
      dispatch(setReduxTheatreSearchQuery(query));
    },
    [dispatch]
  );

  const handleConfirmBooking = useCallback(async () => {
    if (
      !bookingState.selectedMovie ||
      !bookingState.selectedTheatre ||
      !selectedDate ||
      !bookingState.selectedTime ||
      bookingState.selectedSeats.length === 0
    ) {
      dispatch(
        setBookingError('Please complete all booking steps (Theatre, Date, Showtime, and at least 1 Seat).')
      );
      return false;
    }

    try {
      const record = confirmNewBooking({
        movie: bookingState.selectedMovie,
        theatre: bookingState.selectedTheatre,
        date: selectedDate,
        showtime: bookingState.selectedTime,
        seats: bookingState.selectedSeats,
      });

      // POST: Send new booking to REST API
      try {
        await createBooking(record);
      } catch (apiErr) {
        console.info('POST /api/bookings fallback synced:', apiErr.message);
      }

      dispatch(confirmBookingSuccess(record.bookingId));
      setAllBookings(getAllSavedBookings(currentUsername));
      return true;
    } catch (err) {
      dispatch(
        setBookingError(err.message || 'Unable to confirm booking. Please try again.')
      );
      return false;
    }
  }, [
    dispatch,
    currentUsername,
    bookingState.selectedMovie,
    bookingState.selectedTheatre,
    selectedDate,
    bookingState.selectedTime,
    bookingState.selectedSeats,
  ]);

  const handleResetBooking = useCallback(() => {
    dispatch(clearBooking());
  }, [dispatch]);

  return {
    // Redux State
    selectedMovie: bookingState.selectedMovie,
    selectedTheatre: bookingState.selectedTheatre,
    selectedDate,
    selectedTime: bookingState.selectedTime,
    selectedSeats: bookingState.selectedSeats,
    totalAmount: bookingState.totalAmount,
    totalSeats: bookingState.totalSeats,
    priceBreakdown: bookingState.priceBreakdown,
    bookingConfirmed: bookingState.bookingConfirmed,
    activeBookingReference: bookingState.bookingReference,
    bookingError: bookingState.bookingError,
    searchQuery: bookingState.searchQuery,
    theatreAreaFilter: bookingState.theatreAreaFilter || 'All Areas',
    theatreSearchQuery: bookingState.theatreSearchQuery || '',

    // Static & Derived
    theatres: COIMBATORE_THEATRES,
    availableDates,
    currentShowKey,
    bookedSeatsForCurrentShow,
    filteredMovies,
    seatPrices: SEAT_PRICES,
    ticketPrice: SEAT_PRICES.Regular,
    rowConfig: ROW_CONFIG,
    totalSeatsPerScreen: TOTAL_SEATS_PER_SCREEN,
    allBookings,
    lastBooking,

    // Dispatch Handlers
    handleSelectMovie,
    handleSelectTheatre,
    handleSelectDate,
    handleSelectTime,
    handleToggleSeat,
    handleRemoveSeat,
    handleSearchChange,
    handleConfirmBooking,
    handleResetBooking,
    setTheatreAreaFilter,
    setTheatreSearchQuery,
  };
}

export default useBooking;
