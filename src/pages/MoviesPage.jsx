import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useBooking from '../hooks/useBooking';
import SearchBar from '../components/SearchBar';
import MovieList from '../components/MovieList';

function MoviesPage() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { searchQuery, handleSearchChange, selectedMovie } = useBooking();

  return (
    <div className="movies-page">
      <div className="page-header">
        <h2 className="page-title">🎬 Movies Selection</h2>
        <p className="page-subtitle">
          Search and select a movie to proceed to booking
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchInputRef={searchInputRef}
      />

      {/* Movies Grid */}
      <MovieList onSelectAndContinue={() => {}} />

      {/* Continue Bar when a movie is selected */}
      {selectedMovie && (
        <div className="continue-bar">
          <div className="continue-bar-info">
            <span style={{ fontSize: '28px' }}>🎟️</span>
            <div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Selected Movie</div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                {selectedMovie.title} <span style={{ color: '#818cf8', fontWeight: 500, fontSize: '14px' }}>({selectedMovie.genre} • {selectedMovie.year})</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/booking')}
          >
            <span>Continue to Booking</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default MoviesPage;
