import React from 'react';
import MovieCard from './MovieCard';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';
import useBooking from '../hooks/useBooking';

/**
 * Reusable MovieList component
 * Manages rendering of movie cards, loading skeletons, error states, and empty states.
 *
 * @param {Object} props
 * @param {Array} props.movies - Array of movie objects
 * @param {boolean} [props.isLoading=false] - Whether movies are currently fetching
 * @param {string|null} [props.error=null] - Error message if fetch failed
 * @param {Function} [props.onRetry] - Callback to retry failed request
 * @param {Function} [props.onReset] - Callback to clear search/genre filters
 * @param {Function} [props.onSelectAndContinue] - Optional callback after selecting a movie
 */
function MovieList({
  movies = [],
  isLoading = false,
  error = null,
  onRetry,
  onReset,
  onSelectAndContinue,
}) {
  const { selectedMovie, handleSelectMovie } = useBooking();

  // 1. Loading State
  if (isLoading) {
    return <Loading type="skeleton" count={8} />;
  }

  // 2. Error State with Retry
  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Movies"
        message={error}
        onRetry={onRetry}
        retryText="Retry Loading"
      />
    );
  }

  // 3. Empty State with Reset Filters
  if (!movies || movies.length === 0) {
    return (
      <EmptyState
        title="No Movies Found"
        message="No cinema titles matched your current search query or genre filter. Try adjusting your search."
        onReset={onReset}
      />
    );
  }

  // 4. Movies Grid
  const handleMovieSelect = (movie) => {
    handleSelectMovie(movie);
    if (onSelectAndContinue) {
      onSelectAndContinue(movie);
    }
  };

  return (
    <section className="movie-list-section" aria-label="Movies Collection">
      <div className="movies-grid">
        {movies.map((movie) => {
          const isSelected = selectedMovie && String(selectedMovie.id) === String(movie.id);
          return (
            <MovieCard
              key={movie.id}
              movie={movie}
              isSelected={isSelected}
              onSelect={handleMovieSelect}
            />
          );
        })}
      </div>
    </section>
  );
}

export default MovieList;
