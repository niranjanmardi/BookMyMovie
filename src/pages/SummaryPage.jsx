import React from 'react';
import { useNavigate } from 'react-router-dom';
import useBooking from '../hooks/useBooking';
import BookingSummary from '../components/BookingSummary';

function SummaryPage() {
  const navigate = useNavigate();
  const { selectedMovie, bookingConfirmed, handleResetBooking } = useBooking();

  const handleBookAnother = () => {
    handleResetBooking();
    navigate('/movies');
  };

  return (
    <div className="summary-page">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h2 className="page-title">🎟️ Booking Summary & Ticket</h2>
        <p className="page-subtitle">
          Review your cinema tickets and confirm your reservation pass
        </p>
      </div>

      {!selectedMovie ? (
        <div
          className="booking-card"
          style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}
        >
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🎟️</div>
          <h3 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '8px' }}>
            No Active Booking
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
            You haven't selected any tickets yet. Please choose a movie and seats first.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/movies')}
          >
            Browse Movies
          </button>
        </div>
      ) : (
        <div>
          {/* Ticket Card Component */}
          <BookingSummary />

          {/* Navigation Action Buttons below ticket */}
          <div
            style={{
              maxWidth: '580px',
              margin: '24px auto 0',
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {!bookingConfirmed ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/booking')}
              >
                ← Back to Seat Selection
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleBookAnother}
              >
                🍿 Book Another Movie
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryPage;
