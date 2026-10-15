import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable MovieCard component (2026 Edition)
 * Displays poster, title, category (Tamil/Hollywood), language, rating, and Upcoming status
 *
 * @param {Object} props
 * @param {Object} props.movie - Movie object
 * @param {boolean} [props.isSelected=false] - Whether this movie is currently selected in BookingContext
 * @param {Function} [props.onSelect] - Callback when user selects movie for booking
 */
function MovieCard({ movie, isSelected = false, onSelect }) {
  const navigate = useNavigate();

  if (!movie) return null;

  const handleCardClick = () => {
    navigate(`/movies/${movie.id}`);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(movie);
    }
  };

  // Format rating display cleanly
  const displayRating =
    movie.rating && movie.rating !== 'N/A'
      ? typeof movie.rating === 'number'
        ? movie.rating.toFixed(1)
        : movie.rating
      : null;

  return (
    <article
      className={`movie-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View details for ${movie.title}`}
    >
      {/* Poster Media Box */}
      <div className="movie-poster-container">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="movie-poster-img"
            loading="lazy"
            decoding="async"
            fetchPriority="auto"
            onError={(e) => {
              // Graceful fallback to cinema placeholder
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="movie-poster-fallback"
          style={{ display: movie.poster ? 'none' : 'flex' }}
        >
          <span className="fallback-cinema-icon">🎬</span>
          <span className="fallback-title-abbr">{movie.title.slice(0, 18)}</span>
        </div>

        {/* Rating Badge */}
        {displayRating && (
          <div className="movie-rating-badge" title={`Rating: ${displayRating} / 10`}>
            <span className="star-icon">★</span>
            <span className="rating-value">{displayRating}</span>
          </div>
        )}

        {/* Category Badge (Tamil / Hollywood) */}
        {movie.category && (
          <div className="movie-category-badge" title={`Industry: ${movie.category}`}>
            {movie.category}
          </div>
        )}

        {/* Upcoming Status Pill */}
        {movie.isUpcoming && (
          <div className="movie-upcoming-badge" title="Scheduled 2026 Cinema Release">
            Upcoming • 2026
          </div>
        )}

        {/* Selected Overlay Pill */}
        {isSelected && (
          <div className="selected-tag">
            ✓ Selected for Booking
          </div>
        )}
      </div>

      {/* Card Info Content */}
      <div className="movie-card-info">
        <h3 className="movie-card-title" title={movie.title}>
          {movie.title}
        </h3>

        <div className="movie-card-genre">
          {movie.genre || (Array.isArray(movie.genres) ? movie.genres.join(' / ') : 'Cinema')}
        </div>

        <div className="movie-card-submeta">
          <span className="submeta-lang">{movie.language}</span>
          {movie.year && <span className="submeta-year">• {movie.year}</span>}
          {movie.runtime && <span className="submeta-runtime">• {movie.runtime}</span>}
        </div>
      </div>

      {/* Card Actions */}
      <div className="movie-card-actions">
        <button
          type="button"
          className="btn-card-details"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/movies/${movie.id}`);
          }}
          title="Read full synopsis and release details"
        >
          View Details
        </button>

        <button
          type="button"
          className={`btn-card-select ${isSelected ? 'active-select' : ''}`}
          onClick={handleBookClick}
          title={isSelected ? 'Selected for booking' : `Book tickets for ${movie.title}`}
        >
          {isSelected ? '✓ Selected' : 'Book Tickets'}
        </button>
      </div>
    </article>
  );
}

export default React.memo(MovieCard);
