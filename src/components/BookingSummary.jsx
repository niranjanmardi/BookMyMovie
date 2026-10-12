import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBooking from '../hooks/useBooking';

function BookingSummary() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    selectedMovie,
    selectedTheatre,
    selectedDate,
    selectedTime,
    selectedSeats,
    priceBreakdown,
    totalAmount,
    bookingConfirmed,
    activeBookingReference,
    bookingError,
    handleConfirmBooking,
    handleResetBooking,
  } = useBooking();

  const isReady =
    selectedMovie && selectedTheatre && selectedDate && selectedTime && selectedSeats.length > 0;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await handleConfirmBooking();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/booking');
  };

  const handleStartNewBooking = () => {
    handleResetBooking();
    navigate('/movies');
  };

  return (
    <div className="ticket-wrapper">
      <div className="ticket-card coimbatore-ticket">
        {/* ── Ticket Header ── */}
        <div className="ticket-header">
          <div className="ticket-brand-row">
            <span className="ticket-brand-name">🎟️ BookMyMovie</span>
            <span className="ticket-city-badge">Coimbatore Edition</span>
          </div>
          <h3>CINEMA ADMISSION PASS</h3>
          <p className="ticket-subtext">Verified Multiplex Reserved Seating</p>

          {activeBookingReference && (
            <div className="ticket-ref-banner">
              <span className="ref-label">BOOKING REF:</span>
              <span className="ref-code">{activeBookingReference}</span>
            </div>
          )}
        </div>

        {/* ── Ticket Body ── */}
        <div className="ticket-body">
          {/* Movie Details Row */}
          <div className="ticket-movie-row">
            {selectedMovie?.poster && (
              <img
                src={selectedMovie.poster}
                alt={selectedMovie.title}
                className="ticket-movie-poster"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="ticket-movie-info">
              <div className="ticket-movie-title">{selectedMovie?.title || '—'}</div>
              <div className="ticket-movie-meta">
                <span>{selectedMovie?.language}</span>
                {selectedMovie?.category && <span>• {selectedMovie.category} Cinema</span>}
                {selectedMovie?.year && <span>• {selectedMovie.year}</span>}
              </div>
            </div>
          </div>

          <hr className="ticket-divider" />

          {/* Venue & Location Details */}
          <div className="ticket-item">
            <span className="ticket-label">Cinema Venue</span>
            <span className="ticket-val highlight-venue">
              {selectedTheatre ? `${selectedTheatre.name} (${selectedTheatre.area})` : '—'}
            </span>
          </div>

          {selectedTheatre?.address && (
            <div className="ticket-item address-item">
              <span className="ticket-label">Address</span>
              <span className="ticket-val address-val">
                {selectedTheatre.address}
              </span>
            </div>
          )}

          {selectedTheatre?.screens && (
            <div className="ticket-item">
              <span className="ticket-label">Screen Format</span>
              <span className="ticket-val">{selectedTheatre.screens}</span>
            </div>
          )}

          <hr className="ticket-divider" />

          {/* Date & Time */}
          <div className="ticket-meta-grid-2col">
            <div className="ticket-item">
              <span className="ticket-label">Date</span>
              <span className="ticket-val highlight-val">
                {selectedDate ? selectedDate.displayLabel : '—'}
              </span>
            </div>

            <div className="ticket-item">
              <span className="ticket-label">Showtime</span>
              <span className="ticket-val highlight-val">
                {selectedTime ? `${selectedTime.time} (${selectedTime.label})` : '—'}
              </span>
            </div>
          </div>

          <hr className="ticket-divider" />

          {/* Seats Info */}
          <div className="ticket-item">
            <span className="ticket-label">Reserved Seats ({selectedSeats.length})</span>
            <span className="ticket-val seats-highlight">
              {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
            </span>
          </div>

          {/* Detailed Pricing Breakdown by Category */}
          <div className="ticket-item price-breakdown-box">
            <span className="ticket-label">Category Breakdown</span>
            <div className="ticket-pricing-list">
              {priceBreakdown.Regular.count > 0 && (
                <div className="tier-price-line">
                  <span>Regular ({priceBreakdown.Regular.seats.join(', ')})</span>
                  <span>
                    {priceBreakdown.Regular.count} × ₹150 = <strong>₹{priceBreakdown.Regular.total}</strong>
                  </span>
                </div>
              )}
              {priceBreakdown.Premium.count > 0 && (
                <div className="tier-price-line">
                  <span>Premium ({priceBreakdown.Premium.seats.join(', ')})</span>
                  <span>
                    {priceBreakdown.Premium.count} × ₹200 = <strong>₹{priceBreakdown.Premium.total}</strong>
                  </span>
                </div>
              )}
              {priceBreakdown.Recliner.count > 0 && (
                <div className="tier-price-line">
                  <span>Recliner ({priceBreakdown.Recliner.seats.join(', ')})</span>
                  <span>
                    {priceBreakdown.Recliner.count} × ₹300 = <strong>₹{priceBreakdown.Recliner.total}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          <hr className="ticket-divider" />

          {/* Grand Total */}
          <div className="ticket-item grand-total-line">
            <span className="ticket-label total-label">Total Amount Payable</span>
            <span className="ticket-total-val">₹{totalAmount}</span>
          </div>
        </div>

        {/* ── Error Toast if booking conflict occurs ── */}
        {bookingError && (
          <div className="ticket-error-alert" role="alert">
            ⚠️ {bookingError}
          </div>
        )}

        {/* ── Ticket Footer Action ── */}
        <div className="ticket-footer">
          {!bookingConfirmed ? (
            <div className="ticket-action-buttons">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isReady || isSubmitting}
                className="btn-primary confirm-booking-btn"
              >
                {isSubmitting ? (
                  <span>Reserving via POST API...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Book Tickets (POST)</span>
                    <span>(₹{totalAmount})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary cancel-booking-btn"
              >
                ← Back to Modify Seats
              </button>
            </div>
          ) : (
            <div className="confirmed-box">
              <div className="confirmed-icon">✓</div>
              <div className="confirmed-title">Booking Confirmed Successfully!</div>
              <p>Your seats are secured at {selectedTheatre?.name}.</p>
              <div className="confirmed-ref-badge">
                Reference Code: <strong>{activeBookingReference}</strong>
              </div>
              <p style={{ marginTop: '10px', fontSize: '13px', color: '#94a3b8' }}>
                Show this digital pass at the multiplex entrance counter. Enjoy your movie! 🍿
              </p>

              <div className="post-confirm-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleStartNewBooking}
                >
                  🍿 Book Another Movie
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingSummary;
