import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <span className="hero-pill">🎬 React Router Navigation • Unit 3 Experiment 3</span>
        <h1 className="hero-title">
          Book Your <span>Movie Experience</span>
        </h1>
        <p className="hero-desc">
          Discover movies, choose your theatre, select your seats and enjoy the show.
          Fast, effortless cinema ticket booking at your fingertips.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/movies')}
        >
          <span>Explore Movies</span>
          <span>→</span>
        </button>
      </section>

      {/* Feature Cards */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🎬</div>
          <h3 className="feature-title">Latest Movies</h3>
          <p className="feature-text">
            Browse blockbuster titles with live search and detailed showtimes across genres.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🏛️</div>
          <h3 className="feature-title">Best Theatres</h3>
          <p className="feature-text">
            Choose from top multiplexes including PVR Cinemas, INOX, and Sathyam Cinemas.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💺</div>
          <h3 className="feature-title">Easy Seat Booking</h3>
          <p className="feature-text">
            Interactive seat map to pick your favorite spots with instant price calculation.
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
