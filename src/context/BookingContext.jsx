import React, { createContext, useState, useMemo, useCallback } from 'react';

// Create Context
const BookingContext = createContext();

// Movie data – Upcoming blockbusters
const MOVIES = [
  {
    id: 1,
    title: 'Avengers: Doomsday',
    genre: 'Action / Superhero',
    year: 2026,
    cast: 'Robert Downey Jr., Pedro Pascal',
    director: 'Russo Brothers',
    poster: '/posters/avengers_doomsday.jpg',
  },
  {
    id: 2,
    title: 'Ramayana: Part 1',
    genre: 'Mythology / Epic',
    year: 2026,
    cast: 'Ranbir Kapoor, Yash, Sai Pallavi',
    director: 'Nitesh Tiwari',
    poster: '/posters/ramayanapart1.jpg',
  },
  {
    id: 3,
    title: 'The Hunger Games: Sunrise on the Reaping',
    genre: 'Sci-Fi / Adventure',
    year: 2026,
    cast: 'TBA',
    director: 'Francis Lawrence',
    poster: '/posters/hungergames_sunrise.jpg',
  },
  {
    id: 4,
    title: 'Jailer 2',
    genre: 'Action / Thriller',
    year: 2026,
    cast: 'Rajinikanth',
    director: 'Nelson Dilipkumar',
    poster: '/posters/jailer2.jpg',
  },
  {
    id: 5,
    title: 'The Mandalorian & Grogu',
    genre: 'Sci-Fi / Adventure',
    year: 2026,
    cast: 'Pedro Pascal',
    director: 'Jon Favreau',
    poster: '/posters/themandaloriangrogu.jpg',
  },
  {
    id: 6,
    title: 'Supergirl: Woman of Tomorrow',
    genre: 'Superhero / Sci-Fi',
    year: 2026,
    cast: 'Milly Alcock',
    director: 'Craig Gillespie',
    poster: '/posters/supergirl.jpg',
  },
  {
    id: 7,
    title: 'Michael',
    genre: 'Biographical Drama',
    year: 2025,
    cast: 'Jaafar Jackson',
    director: 'Antoine Fuqua',
    poster: '/posters/micheal.jpg',
  },
  {
    id: 8,
    title: 'Scream 7',
    genre: 'Horror / Thriller',
    year: 2025,
    cast: 'Neve Campbell, Courteney Cox',
    director: 'Kevin Williamson',
    poster: '/posters/stream7.jpg',
  },
  {
    id: 9,
    title: 'Dune: Part Three',
    genre: 'Sci-Fi / Epic',
    year: 2026,
    cast: 'Timothée Chalamet, Zendaya',
    director: 'Denis Villeneuve',
    poster: '/posters/dunepartthree.jpg',
  },
  {
    id: 10,
    title: 'The Cat in the Hat',
    genre: 'Animation / Family',
    year: 2026,
    cast: 'All-Star Voice Cast',
    director: 'TBA',
    poster: '/posters/thecatinthehat.jpg',
  },
];

const TICKET_PRICE = 150;

function BookingProvider({ children }) {
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedMovie, setSelectedMovie]       = useState(null);
  const [selectedTheatre, setSelectedTheatre]   = useState(null);
  const [selectedDate, setSelectedDate]         = useState(null);
  const [selectedTime, setSelectedTime]         = useState(null);
  const [selectedSeats, setSelectedSeats]       = useState([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Filter movies based on search query
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return MOVIES;
    return MOVIES.filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Total amount calculation
  const totalAmount = useMemo(() => {
    return selectedSeats.length * TICKET_PRICE;
  }, [selectedSeats]);

  // Select movie handler
  const handleSelectMovie = useCallback((movie) => {
    setSelectedMovie(movie);
    setSelectedTheatre(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedSeats([]);
    setBookingConfirmed(false);
  }, []);

  // Select date handler
  const handleSelectDate = useCallback((date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSelectedSeats([]);
    setBookingConfirmed(false);
  }, []);

  // Select theatre handler
  const handleSelectTheatre = useCallback((theatre) => {
    setSelectedTheatre(theatre);
    setSelectedTime(null);
    setSelectedSeats([]);
    setBookingConfirmed(false);
  }, []);

  // Select show time handler
  const handleSelectTime = useCallback((timing) => {
    setSelectedTime(timing);
    setSelectedSeats([]);
    setBookingConfirmed(false);
  }, []);

  // Toggle seat selection
  const handleToggleSeat = useCallback((seat) => {
    setSelectedSeats((prevSeats) => {
      if (prevSeats.includes(seat)) {
        return prevSeats.filter((s) => s !== seat);
      } else {
        return [...prevSeats, seat];
      }
    });
    setBookingConfirmed(false);
  }, []);

  // Search input handler
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  // Confirm booking handler
  const handleConfirmBooking = useCallback(() => {
    setBookingConfirmed(true);
  }, []);

  // Reset booking handler
  const handleResetBooking = useCallback(() => {
    setSelectedMovie(null);
    setSelectedTheatre(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedSeats([]);
    setBookingConfirmed(false);
  }, []);

  const contextValue = {
    // State
    searchQuery,
    selectedMovie,
    selectedTheatre,
    selectedDate,
    selectedTime,
    selectedSeats,
    bookingConfirmed,
    filteredMovies,
    totalAmount,
    ticketPrice: TICKET_PRICE,
    // Handlers
    handleSearchChange,
    handleSelectMovie,
    handleSelectTheatre,
    handleSelectDate,
    handleSelectTime,
    handleToggleSeat,
    handleConfirmBooking,
    handleResetBooking,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export { BookingContext, BookingProvider };
