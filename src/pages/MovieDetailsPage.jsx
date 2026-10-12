import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMovieById } from '../services/movieApi';
import useBooking from '../hooks/useBooking';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedMovie, handleSelectMovie } = useBooking();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function fetchDetails() {
      setLoading(true);
      setError(null);

      try {
        const data = await getMovieById(id, { signal: controller.signal });
        if (!ignore) {
          setMovie(data);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (!ignore) {
          setError(err.message || 'Unable to retrieve movie details.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [id, retryTrigger]);

  const handleBookNow = () => {
    if (movie) {
      handleSelectMovie(movie);
      navigate('/booking');
    }
  };

  const isCurrentSelection = selectedMovie && movie && String(selectedMovie.id) === String(movie.id);

  // Safely normalize genres list whether strings, objects, or single slash-separated string
  const genreList = Array.isArray(movie?.genres) && movie.genres.length > 0
    ? movie.genres.map((g) => (typeof g === 'object' && g ? g.name : String(g))).filter(Boolean)
    : typeof movie?.genre === 'string'
      ? movie.genre.split(/[/,•]/).map((s) => s.trim()).filter(Boolean)
      : [];

  const backdropUrl = movie?.backdrop || movie?.poster || '';

  return (
    <div className="movie-details-page">
      {/* Navigation Top Bar */}
      <div className="details-nav-bar">
        <button
          type="button"
          onClick={() => navigate('/movies')}
          className="btn-back-link"
        >
          ← Back to Movies
        </button>

        <div className="details-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="crumb-sep">/</span>
          <Link to="/movies">Movies</Link>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{movie?.title || 'Details'}</span>
        </div>
      </div>

      {/* Loading state */}
      {loading && <Loading type="details" />}

      {/* Error state */}
      {!loading && error && (
        <div className="details-error-wrapper">
          <ErrorMessage
            title="Movie Not Found"
            message={error}
            onRetry={() => setRetryTrigger((c) => c + 1)}
            retryText="Try Again"
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/movies')}
            style={{ marginTop: '16px' }}
          >
            ← Return to Movies Catalog
          </button>
        </div>
      )}

      {/* Movie Details Content */}
      {!loading && !error && movie && (
        <div className="movie-details-card">
          {/* Backdrop Banner Header with real backdrop image */}
          <div
            className="details-hero-banner"
            style={{
              backgroundImage: backdropUrl ? `url("${backdropUrl}")` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center 25%',
            }}
          >
            <div className="details-hero-overlay"></div>
          </div>

          <div className="details-main-content">
            {/* Poster Column */}
            <div className="details-poster-col">
              <div className="details-poster-wrap">
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={`${movie.title} poster`}
                    className="details-poster-img"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="details-poster-fallback"
                  style={{ display: movie.poster ? 'none' : 'flex' }}
                >
                  🎬
                </div>
              </div>

              {/* Booking CTA button under poster for easy access */}
              <div className="details-poster-actions">
                <button
                  type="button"
                  className="btn-primary details-book-btn"
                  onClick={handleBookNow}
                >
                  <span>🎟️</span>
                  <span>{isCurrentSelection ? 'Proceed to Seat Selection' : 'Book Tickets Now'}</span>
                </button>

                {isCurrentSelection && (
                  <div className="selected-active-note">
                    ✓ Currently selected for your booking
                  </div>
                )}
              </div>
            </div>

            {/* Information Column */}
            <div className="details-info-col">
              <div className="details-header-row">
                <h1 className="details-movie-title">{movie.title}</h1>
                {movie.year && (
                  <span className="details-year-tag">({movie.year})</span>
                )}
                {movie.category && (
                  <span className="details-category-pill">{movie.category} Cinema</span>
                )}
                {movie.isUpcoming && (
                  <span className="details-upcoming-tag">
                    ● Upcoming (2026 Release)
                  </span>
                )}
              </div>

              {/* Genre Pills */}
              {genreList.length > 0 && (
                <div className="details-genres-list">
                  {genreList.map((g, idx) => (
                    <span key={`${g}-${idx}`} className="details-genre-badge">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta specifications: Rating, Runtime, Language, Release Date */}
              <div className="details-meta-grid">
                {movie.rating && movie.rating !== 'N/A' && (
                  <div className="meta-spec-item">
                    <span className="spec-label">Rating</span>
                    <span className="spec-value highlight-rating">
                      ★ {typeof movie.rating === 'number' ? movie.rating.toFixed(1) : movie.rating} / 10
                    </span>
                  </div>
                )}

                {movie.runtime && (
                  <div className="meta-spec-item">
                    <span className="spec-label">Duration</span>
                    <span className="spec-value">{movie.runtime}</span>
                  </div>
                )}

                {movie.language && (
                  <div className="meta-spec-item">
                    <span className="spec-label">Language</span>
                    <span className="spec-value">{movie.language}</span>
                  </div>
                )}

                {(movie.releaseDateFormatted || movie.releaseDate) && (
                  <div className="meta-spec-item">
                    <span className="spec-label">Release Date</span>
                    <span className="spec-value">
                      {movie.releaseDateFormatted || movie.releaseDate}
                    </span>
                  </div>
                )}
              </div>

              {/* Synopsis Section */}
              <div className="details-section">
                <h3 className="section-heading">Synopsis</h3>
                <p className="details-synopsis-text">
                  {movie.description || 'No detailed synopsis provided.'}
                </p>
              </div>

              {/* Cast & Crew Section */}
              {(movie.cast || movie.director) && (
                <div className="details-section details-credits-section">
                  {movie.director && (
                    <div className="credit-item">
                      <span className="credit-label">Director / Creator:</span>
                      <span className="credit-value">{movie.director}</span>
                    </div>
                  )}
                  {movie.cast && (
                    <div className="credit-item">
                      <span className="credit-label">Cast & Presentation:</span>
                      <span className="credit-value">{movie.cast}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Booking Step CTA */}
              <div className="details-bottom-bar">
                <div className="ticket-rate-info">
                  <span className="rate-label">Ticket Admission:</span>
                  <span className="rate-amount">Rs. 150</span>
                  <span className="rate-sub">per seat • Multiplex screen</span>
                </div>

                <button
                  type="button"
                  className="btn-primary details-book-btn"
                  onClick={handleBookNow}
                >
                  <span>Select Theatres & Seats</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetailsPage;
