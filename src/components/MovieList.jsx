import React from 'react';
import useBooking from '../hooks/useBooking';

function MovieList({ onSelectAndContinue }) {
  const { filteredMovies, selectedMovie, handleSelectMovie } = useBooking();

  const handleCardClick = (movie) => {
    handleSelectMovie(movie);
    if (onSelectAndContinue) {
      onSelectAndContinue(movie);
    }
  };

  return (
    <div>
      {filteredMovies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <p style={{ fontSize: '18px' }}>No movies found matching your search.</p>
        </div>
      ) : (
        <div className="movies-grid">
          {filteredMovies.map((movie) => {
            const isSelected = selectedMovie?.id === movie.id;
            return (
              <div
                key={movie.id}
                onClick={() => handleCardClick(movie)}
                className={`movie-card ${isSelected ? 'selected' : ''}`}
              >
                {/* Actual poster image from public/posters */}
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={`${movie.title} poster`}
                    className="movie-poster-img"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="movie-poster-mock"
                  style={{ display: movie.poster ? 'none' : 'flex' }}
                >
                  🎬
                </div>

                <div className="movie-card-info">
                  <h4>{movie.title}</h4>
                  <div className="movie-meta">
                    <span>{movie.genre}</span>
                    <span>{movie.year}</span>
                  </div>
                  {movie.cast && (
                    <div className="movie-cast">🎭 {movie.cast}</div>
                  )}
                  {movie.director && (
                    <div className="movie-director">🎬 {movie.director}</div>
                  )}
                </div>

                <button
                  type="button"
                  className="movie-select-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(movie);
                  }}
                >
                  {isSelected ? '✓ Selected' : 'Select Movie'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MovieList;
