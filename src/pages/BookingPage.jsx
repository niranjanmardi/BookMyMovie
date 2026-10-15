import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import useBooking from '../hooks/useBooking';
import TheatreList from '../components/TheatreList';
import ShowTiming from '../components/ShowTiming';

// ==============================================================================
// Experiment 2: Lazy Loading for Seat Selection Page / Component (Requirement a)
// Code-splits the heavy 110-seat interactive auditorium layout
// ==============================================================================
const SeatSelection = lazy(() => import('../components/SeatSelection'));

function BookingPage() {
  const navigate = useNavigate();
  const {
    selectedMovie,
    selectedTheatre,
    selectedDate,
    selectedTime,
    selectedSeats,
    totalAmount,
    priceBreakdown,
  } = useBooking();

  // Condition to allow continuing to summary pass
  const canProceed =
    selectedMovie && selectedTheatre && selectedDate && selectedTime && selectedSeats.length > 0;

  // Validation message helper
  const getValidationMessage = () => {
    if (!selectedMovie)             return '👉 Please select a movie from the Movies page first.';
    if (!selectedTheatre)           return '👉 Step 2: Please choose a Coimbatore cinema venue above to continue.';
    if (!selectedDate)              return '👉 Step 3: Please choose your preferred booking date.';
    if (!selectedTime)              return '👉 Step 3: Please choose a showtime to view available seats.';
    if (selectedSeats.length === 0) return '👉 Step 4: Please pick at least 1 cinema seat to continue.';
    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="booking-page">
      {/* ── Page Header & Step Indicator ── */}
      <div className="page-header">
        <div className="coimbatore-tag-badge">
          <span>🏛️ Coimbatore Multiplex Reserved Seating</span>
        </div>
        <h1 className="page-title">Cinema Ticket &amp; Seat Booking</h1>
        <p className="page-subtitle">
          Select verified Coimbatore theatres, show dates, showtimes, and reserved seats across 110-seat screens
        </p>

        {/* Step Progress Tracker */}
        <div className="booking-step-tracker" aria-label="Booking steps">
          <div className={`step-item ${selectedMovie ? 'done' : 'active'}`}>
            <span className="step-circle">{selectedMovie ? '✓' : '1'}</span>
            <span className="step-label">1. Movie</span>
          </div>
          <div className="step-connector"></div>

          <div className={`step-item ${selectedTheatre ? 'done' : selectedMovie ? 'active' : ''}`}>
            <span className="step-circle">{selectedTheatre ? '✓' : '2'}</span>
            <span className="step-label">2. Theatre</span>
          </div>
          <div className="step-connector"></div>

          <div className={`step-item ${selectedDate && selectedTime ? 'done' : selectedTheatre ? 'active' : ''}`}>
            <span className="step-circle">{selectedDate && selectedTime ? '✓' : '3'}</span>
            <span className="step-label">3. Date &amp; Time</span>
          </div>
          <div className="step-connector"></div>

          <div className={`step-item ${selectedSeats.length > 0 ? 'done' : selectedTime ? 'active' : ''}`}>
            <span className="step-circle">{selectedSeats.length > 0 ? '✓' : '4'}</span>
            <span className="step-label">4. Seats</span>
          </div>
          <div className="step-connector"></div>

          <div className={`step-item ${canProceed ? 'active' : ''}`}>
            <span className="step-circle">5</span>
            <span className="step-label">5. Summary</span>
          </div>
        </div>
      </div>

      {!selectedMovie ? (
        <div className="booking-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🎬</div>
          <h3 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '8px' }}>
            No Movie Selected
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
            Please pick a 2026 blockbuster movie before choosing your theatre and seats.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/movies')}
          >
            Browse Movies Catalog
          </button>
        </div>
      ) : (
        <div className="booking-layout">
          {/* ── 1. Selected Movie Bar ── */}
          <div className="booking-card">
            <div className="booking-card-header">
              <span>🎬</span>
              <span>1. Selected Movie</span>
            </div>
            <div className="selected-movie-badge">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {selectedMovie.poster && (
                  <img
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    style={{
                      width: '46px',
                      height: '64px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid #2e3440',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f3f4f6' }}>
                    {selectedMovie.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '3px' }}>
                    {selectedMovie.category && <span>{selectedMovie.category} Cinema • </span>}
                    {selectedMovie.language && <span>{selectedMovie.language} • </span>}
                    {selectedMovie.year && <span>{selectedMovie.year}</span>}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/movies')}
              >
                Change Movie
              </button>
            </div>
          </div>

          {/* ── 2. Coimbatore Theatre Selection Section ── */}
          <div className="booking-card">
            <div className="booking-card-header">
              <span>🏛️</span>
              <span>2. Choose Coimbatore Theatre Venue (10 Verified Cinemas)</span>
            </div>
            <TheatreList />
          </div>

          {/* ── 3. Date & Showtime Selection Section ── */}
          <div className="booking-card">
            <div className="booking-card-header">
              <span>⏰</span>
              <span>3. Choose Booking Date &amp; Showtime</span>
            </div>
            <ShowTiming />
          </div>

          {/* ── 4. Interactive 110-Seat Auditorium Layout ── */}
          <div className="booking-card">
            <div className="booking-card-header">
              <span>💺</span>
              <span>4. Reserve Your Seats (110 Seats Screen Layout)</span>
            </div>
            <Suspense
              fallback={
                <div className="seat-lazy-loading" role="status" aria-label="Loading interactive seat layout">
                  <div className="loading-spinner"></div>
                  <p style={{ marginTop: '12px', color: '#94a3b8' }}>
                    ⚡ Lazy loading interactive 110-seat auditorium...
                  </p>
                </div>
              }
            >
              <SeatSelection />
            </Suspense>
          </div>

          {/* ── 5. Real-Time Price Details & Checkout ── */}
          <div className="booking-card">
            <div className="booking-card-header">
              <span>💳</span>
              <span>5. Pricing Details &amp; Summary</span>
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Selected Seats:</span>
                <span style={{ color: selectedSeats.length > 0 ? '#f87171' : '#64748b', fontWeight: 700 }}>
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </span>
              </div>
              <div className="price-row">
                <span>Total Tickets:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>
                  {selectedSeats.length}
                </span>
              </div>

              {priceBreakdown.Regular.count > 0 && (
                <div className="price-row">
                  <span>Regular Seats (A–E):</span>
                  <span>{priceBreakdown.Regular.count} × ₹150 = ₹{priceBreakdown.Regular.total}</span>
                </div>
              )}

              {priceBreakdown.Premium.count > 0 && (
                <div className="price-row">
                  <span>Premium Seats (F–H):</span>
                  <span>{priceBreakdown.Premium.count} × ₹200 = ₹{priceBreakdown.Premium.total}</span>
                </div>
              )}

              {priceBreakdown.Recliner.count > 0 && (
                <div className="price-row">
                  <span>Recliner Seats (I–J):</span>
                  <span>{priceBreakdown.Recliner.count} × ₹300 = ₹{priceBreakdown.Recliner.total}</span>
                </div>
              )}

              <div className="price-row total-row">
                <span>Grand Total:</span>
                <span className="total-amount">₹{totalAmount}</span>
              </div>
            </div>

            {validationMessage && (
              <div className="booking-validation-alert" role="alert">
                {validationMessage}
              </div>
            )}

            <button
              type="button"
              className="btn-primary checkout-continue-btn"
              disabled={!canProceed}
              onClick={() => navigate('/summary')}
            >
              <span>Continue to Booking Summary</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPage;
