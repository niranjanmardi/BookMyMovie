import React, { createContext, useState, useMemo, useCallback } from 'react';
import { COIMBATORE_THEATRES } from '../data/theatres.js';
import { getAvailableBookingDates } from '../data/showtimes.js';
import { calculateSeatsPriceBreakdown, SEAT_PRICES, ROW_CONFIG, TOTAL_SEATS_PER_SCREEN } from '../data/seatLayout.js';
import {
  buildShowKey,
  getBookedSeatsForShow,
  confirmNewBooking,
  getAllSavedBookings,
} from '../services/bookingService.js';
import { FALLBACK_MOVIES_2026 } from '../data/fallbackMovies.js';

// Create Context
const BookingContext = createContext();

// Default 2026 Movie line-up for reference
const MOVIES = FALLBACK_MOVIES_2026;

function BookingProvider({ children }) {
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedMovie, setSelectedMovie]       = useState(null);
  const [selectedTheatre, setSelectedTheatre]   = useState(null);

  // Available 8 days (Today + 7 days)
  const availableDates = useMemo(() => getAvailableBookingDates(7), []);

  // Default to today's date
  const [selectedDate, setSelectedDate]         = useState(() => availableDates[0]);
  const [selectedTime, setSelectedTime]         = useState(null);
  const [selectedSeats, setSelectedSeats]       = useState([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [activeBookingReference, setActiveBookingReference] = useState(null);
  const [bookingError, setBookingError]         = useState(null);

  // Coimbatore Theatres filter & search state
  const [theatreAreaFilter, setTheatreAreaFilter]   = useState('All Areas');
  const [theatreSearchQuery, setTheatreSearchQuery] = useState('');

  // Persisted bookings list
  const [allBookings, setAllBookings] = useState(() => getAllSavedBookings());

  const lastBooking = useMemo(() => {
    return allBookings.length > 0 ? allBookings[0] : null;
  }, [allBookings]);

  // Unique show screening key based on currently selected options
  const currentShowKey = useMemo(() => {
    if (!selectedMovie || !selectedTheatre || !selectedDate || !selectedTime) {
      return null;
    }
    return buildShowKey(selectedMovie.id, selectedTheatre.id, selectedDate.iso, selectedTime.id);
  }, [selectedMovie, selectedTheatre, selectedDate, selectedTime]);

  // Booked seats for current show (combines initial pre-booked seats + user confirmed bookings)
  const bookedSeatsForCurrentShow = useMemo(() => {
    if (!currentShowKey) return [];
    // Re-evaluates whenever currentShowKey changes or bookingConfirmed updates
    const isConfirmed = Boolean(bookingConfirmed);
    return getBookedSeatsForShow(currentShowKey, isConfirmed);
  }, [currentShowKey, bookingConfirmed]);

  // Filter movies based on search query
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return MOVIES;
    const q = searchQuery.toLowerCase();
    return MOVIES.filter((movie) =>
      movie.title.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Dynamic price breakdown across Regular (Rs.150), Premium (Rs.200), and Recliner (Rs.300)
  const priceBreakdown = useMemo(() => {
    return calculateSeatsPriceBreakdown(selectedSeats);
  }, [selectedSeats]);

  const totalAmount = priceBreakdown.totalAmount;

  // Select movie handler
  const handleSelectMovie = useCallback((movie) => {
    setSelectedMovie(movie);
    setSelectedTheatre(null);
    setSelectedDate(availableDates[0]);
    setSelectedTime(null);
    setSelectedSeats([]);
    setBookingConfirmed(false);
    setActiveBookingReference(null);
    setBookingError(null);
  }, [availableDates]);

  // Select date handler
  const handleSelectDate = useCallback((date) => {
    setSelectedDate(date);
    // Reset showtime and seats when date changes
    setSelectedTime(null);
    setSelectedSeats([]);
    setBookingConfirmed(false);
    setActiveBookingReference(null);
    setBookingError(null);
  }, []);

  // Select theatre handler
  const handleSelectTheatre = useCallback((theatre) => {
    setSelectedTheatre(theatre);
    // Reset showtime and seats when theatre changes
    setSelectedTime(null);
    setSelectedSeats([]);
    setBookingConfirmed(false);
    setActiveBookingReference(null);
    setBookingError(null);
  }, []);

  // Select show time handler
  const handleSelectTime = useCallback((timing) => {
    setSelectedTime(timing);
    // Reset seats when showtime changes
    setSelectedSeats([]);
    setBookingConfirmed(false);
    setActiveBookingReference(null);
    setBookingError(null);
  }, []);

  // Toggle seat selection
  const handleToggleSeat = useCallback((seatId) => {
    // If the seat is already booked for this show, disallow selection
    if (bookedSeatsForCurrentShow.includes(seatId)) {
      return false;
    }

    setSelectedSeats((prevSeats) => {
      if (prevSeats.includes(seatId)) {
        return prevSeats.filter((s) => s !== seatId);
      } else {
        return [...prevSeats, seatId];
      }
    });

    setBookingConfirmed(false);
    setBookingError(null);
    return true;
  }, [bookedSeatsForCurrentShow]);

  // Search input handler for movies
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  // Confirm booking handler
  const handleConfirmBooking = useCallback(() => {
    setBookingError(null);

    if (!selectedMovie || !selectedTheatre || !selectedDate || !selectedTime || selectedSeats.length === 0) {
      setBookingError('Please complete all booking steps (Theatre, Date, Showtime, and at least 1 Seat).');
      return false;
    }

    try {
      const record = confirmNewBooking({
        movie: selectedMovie,
        theatre: selectedTheatre,
        date: selectedDate,
        showtime: selectedTime,
        seats: selectedSeats,
      });

      setBookingConfirmed(true);
      setActiveBookingReference(record.bookingId);
      setAllBookings(getAllSavedBookings());
      return true;
    } catch (err) {
      setBookingError(err.message || 'Unable to confirm booking. Please try again.');
      return false;
    }
  }, [selectedMovie, selectedTheatre, selectedDate, selectedTime, selectedSeats]);

  // Reset booking handler
  const handleResetBooking = useCallback(() => {
    setSelectedMovie(null);
    setSelectedTheatre(null);
    setSelectedDate(availableDates[0]);
    setSelectedTime(null);
    setSelectedSeats([]);
    setBookingConfirmed(false);
    setActiveBookingReference(null);
    setBookingError(null);
  }, [availableDates]);

  const contextValue = {
    // State
    searchQuery,
    selectedMovie,
    selectedTheatre,
    selectedDate,
    selectedTime,
    selectedSeats,
    bookingConfirmed,
    activeBookingReference,
    bookingError,
    lastBooking,
    allBookings,
    theatres: COIMBATORE_THEATRES,
    theatreAreaFilter,
    theatreSearchQuery,
    availableDates,
    currentShowKey,
    bookedSeatsForCurrentShow,
    filteredMovies,
    priceBreakdown,
    totalAmount,
    seatPrices: SEAT_PRICES,
    ticketPrice: SEAT_PRICES.Regular, // Default regular seat price
    rowConfig: ROW_CONFIG,
    totalSeatsPerScreen: TOTAL_SEATS_PER_SCREEN,
    // Handlers
    handleSearchChange,
    handleSelectMovie,
    handleSelectTheatre,
    handleSelectDate,
    handleSelectTime,
    handleToggleSeat,
    handleConfirmBooking,
    handleResetBooking,
    setTheatreAreaFilter,
    setTheatreSearchQuery,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export { BookingContext, BookingProvider };
