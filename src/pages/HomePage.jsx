import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useBooking from '../hooks/useBooking';
import { getFeaturedMovie, fetchMovies } from '../services/movieApi';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';

function HomePage() {
  const navigate = useNavigate();
  const { handleSelectMovie } = useBooking();

  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadHomeData() {
      try {
        const [featured, moviesResult] = await Promise.all([
          getFeaturedMovie({ signal: controller.signal }),
          fetchMovies({ signal: controller.signal }),
        ]);

        if (isMounted) {
          setFeaturedMovie(featured);
          // Show top 4 trending movies on home
          setTopMovies(moviesResult.movies.slice(0, 4));
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('Error loading home movies:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleBookFeatured = () => {
    if (featuredMovie) {
      handleSelectMovie(featuredMovie);
      navigate('/booking');
    }
  };

  return (
    <div className="home-page">
      {/* 1. Cinema Hero Section */}
      <section className="hero-section" aria-label="Featured Movie">
        <div className="hero-content">
          <div className="hero-text-side">
            <div className="hero-pill-badge">
              <span className="hero-badge-dot">●</span>
              <span>Featured Cinema • Tamil &amp; Hollywood Blockbusters</span>
            </div>

            <h1 className="hero-title">
              {featuredMovie ? featuredMovie.title : 'Discover Premium Cinema'}
            </h1>

            <div className="hero-meta-row">
              {featuredMovie?.rating && featuredMovie.rating !== 'N/A' && (
                <span className="hero-rating">
                  ★ {typeof featuredMovie.rating === 'number' ? featuredMovie.rating.toFixed(1) : featuredMovie.rating} / 10
                </span>
              )}
              {featuredMovie?.year && (
                <span className="hero-year">{featuredMovie.year}</span>
              )}
              {featuredMovie?.genre && (
                <span className="hero-genre">{featuredMovie.genre}</span>
              )}
              {featuredMovie?.runtime && (
                <span className="hero-runtime">{featuredMovie.runtime}</span>
              )}
            </div>

            <p className="hero-desc">
              {featuredMovie?.description
                ? featuredMovie.description.slice(0, 220) + '...'
                : 'Experience the latest blockbusters with crystal clear audio, 4K laser projection, and effortless seat reservation.'}
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn-primary hero-btn-main"
                onClick={() => navigate('/movies')}
              >
                <span>Browse All Movies</span>
                <span className="btn-arrow">→</span>
              </button>

              {featuredMovie && (
                <button
                  type="button"
                  className="btn-secondary hero-btn-sub"
                  onClick={handleBookFeatured}
                >
                  <span>Book Featured Movie</span>
                </button>
              )}
            </div>
          </div>

          {/* Hero Featured Visual */}
          {featuredMovie?.poster && (
            <div className="hero-visual-side">
              <div
                className="hero-poster-frame"
                onClick={() => navigate(`/movies/${featuredMovie.id}`)}
                role="button"
                tabIndex={0}
                title={`View ${featuredMovie.title}`}
              >
                <img
                  src={featuredMovie.poster}
                  alt={`${featuredMovie.title} Featured Banner`}
                  className="hero-poster-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="hero-poster-overlay">
                  <span className="poster-peek-label">View Details ↗</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. 2026 Cinema Lineup Preview */}
      <section className="home-preview-section" aria-label="2026 Cinema Movies">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">2026 Cinema Lineup</h2>
            <p className="section-subtitle">
              Recent 2026 Tamil &amp; Hollywood releases with TMDB API integration and seat booking
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary-link"
            onClick={() => navigate('/movies')}
          >
            Explore All 2026 Titles →
          </button>
        </div>

        {loading ? (
          <Loading type="skeleton" count={4} />
        ) : (
          <div className="movies-grid">
            {topMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={(m) => {
                  handleSelectMovie(m);
                  navigate('/booking');
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Cinema Booking Features */}
      <section className="features-grid" aria-label="BookMyMovie Features">
        <div className="feature-card">
          <div className="feature-icon">🎬</div>
          <h3 className="feature-title">Live REST API Titles</h3>
          <p className="feature-text">
            Search, filter by genre, and retrieve dynamic synopsis, cast, and ratings asynchronously.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🏛️</div>
          <h3 className="feature-title">Premium Multiplexes</h3>
          <p className="feature-text">
            Choose from leading theatres like PVR IMAX 4K, INOX Dolby Atmos, and Sathyam RGB Laser.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💺</div>
          <h3 className="feature-title">Real-Time Seat Booking</h3>
          <p className="feature-text">
            Interactive seat map layout with dynamic pricing calculations and digital reservation passes.
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
