import React from 'react';
import { useNavigate } from 'react-router-dom';
import useBooking from '../hooks/useBooking';
import TheatreList from '../components/TheatreList';
import ShowTiming from '../components/ShowTiming';
import SeatSelection from '../components/SeatSelection';

function BookingPage() {
  const navigate = useNavigate();
  const {
    selectedMovie,
    selectedTheatre,
    selectedDate,
    selectedTime,
    selectedSeats,
    totalAmount,
    ticketPrice,
  } = useBooking();

  // Condition to allow continuing to summary
  const canProceed =
    selectedMovie && selectedTheatre && selectedDate && selectedTime && selectedSeats.length > 0;

  // Validation message helper
  const getValidationMessage = () => {
    if (!selectedMovie)             return 'Please select a movie from the Movies page first.';
    if (!selectedTheatre)           return '👉 Please choose a theatre above to continue.';
    if (!selectedDate)              return '👉 Please choose a show date to continue.';
    if (!selectedTime)              return '👉 Please choose a show time to continue.';
    if (selectedSeats.length === 0) return '👉 Please select at least 1 seat to continue.';
    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="booking-page">
      <div className="page-header">
        <h2 className="page-title">🎟️ Seat & Show Booking</h2>
        <p className="page-subtitle">
          Select your theatre, preferred show timing, and choose your cinema seats
        </p>
      </div>

      {!selectedMovie ? (
        <div className="booking-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🎬</div>
          <h3 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '8px' }}>
            No Movie Selected
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
            Please select a movie before choosing theatre and seats.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/movies')}
          >
            Browse Movies Now
          </button>
        </div>
      ) : (
        <div className="booking-layout">
          {/* 1. Selected Movie Section */}
          <div className="booking-card">
            <div className="booking-card-header">
              <span>🎬</span>
              <span>1. Selected Movie</span>
            </div>
            <div className="selected-movie-badge">
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  {selectedMovie.title}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>
                  {selectedMovie.genre} • {selectedMovie.year}
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

          {/* 2. Theatre Selection Section */}
          <div className="booking-card">
            <div className="booking-card-header">
              <span>🏛️</span>
              <span>2. Choose Theatre</span>
            </div>
            <TheatreList />
          </div>

          {/* 3. Show Timing Section */}
          <div className="booking-card">
            <div className="booking-card-header">
              <span>⏰</span>
              <span>3. Choose Date &amp; Show Time</span>
            </div>
            <ShowTiming />
          </div>

          {/* 4. Seat Selection Section */}
          <div className="booking-card">
            <div className="booking-card-header">
              <span>💺</span>
              <span>4. Select Seats (Rs. {ticketPrice} per seat)</span>
            </div>
            <SeatSelection />
          </div>

          {/* 5. Price Details & Continue */}
          <div className="booking-card">
            <div className="booking-card-header">
              <span>💳</span>
              <span>5. Price Details</span>
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Selected Seats:</span>
                <span style={{ color: selectedSeats.length > 0 ? '#a78bfa' : '#64748b', fontWeight: 600 }}>
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </span>
              </div>
              <div className="price-row">
                <span>Tickets:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>
                  {selectedSeats.length}
                </span>
              </div>
              <div className="price-row">
                <span>Price per Ticket:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>
                  Rs. {ticketPrice}
                </span>
              </div>
              <div className="price-row total-row">
                <span>Total:</span>
                <span className="total-amount">Rs. {totalAmount}</span>
              </div>
            </div>

            {validationMessage && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {validationMessage}
              </div>
            )}

            <button
              type="button"
              className="btn-primary"
              disabled={!canProceed}
              onClick={() => navigate('/summary')}
              style={{ width: '100%' }}
            >
              <span>Continue to Summary</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPage;
