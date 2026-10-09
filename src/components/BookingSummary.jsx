import React from 'react';
import useBooking from '../hooks/useBooking';

function BookingSummary() {
  const {
    selectedMovie,
    selectedTheatre,
    selectedDate,
    selectedTime,
    selectedSeats,
    totalAmount,
    bookingConfirmed,
    handleConfirmBooking,
  } = useBooking();

  const isReady = selectedMovie && selectedTheatre && selectedDate && selectedTime && selectedSeats.length > 0;

  return (
    <div className="ticket-wrapper">
      <div className="ticket-card">
        {/* Ticket Header */}
        <div className="ticket-header">
          <h3>🎟️ CINEMA ADMISSION TICKET</h3>
          <p>BookMyMovie Digital Ticket Pass</p>
        </div>

        {/* Ticket Body */}
        <div className="ticket-body">
          <div className="ticket-item">
            <span className="ticket-label">Movie</span>
            <span className="ticket-val" style={{ color: '#818cf8', fontSize: '16px', fontWeight: 700 }}>
              {selectedMovie?.title || '—'}
            </span>
          </div>

          <div className="ticket-item">
            <span className="ticket-label">Theatre</span>
            <span className="ticket-val">
              {selectedTheatre ? `${selectedTheatre.name} (${selectedTheatre.location})` : '—'}
            </span>
          </div>

          <div className="ticket-item">
            <span className="ticket-label">Date</span>
            <span className="ticket-val" style={{ color: '#818cf8', fontWeight: 600 }}>
              {selectedDate ? selectedDate.full : '—'}
            </span>
          </div>

          <div className="ticket-item">
            <span className="ticket-label">Show Time</span>
            <span className="ticket-val">{selectedTime?.time || '—'}</span>
          </div>

          <hr className="ticket-divider" />

          <div className="ticket-item">
            <span className="ticket-label">Seats</span>
            <span className="ticket-val" style={{ color: '#818cf8', fontWeight: 700 }}>
              {selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}
            </span>
          </div>

          <div className="ticket-item">
            <span className="ticket-label">Tickets</span>
            <span className="ticket-val">{selectedSeats.length}</span>
          </div>

          <div className="ticket-item">
            <span className="ticket-label">Ticket Rate</span>
            <span className="ticket-val">Rs. 150 each</span>
          </div>

          <hr className="ticket-divider" />

          <div className="ticket-item">
            <span className="ticket-label" style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
              Total Amount
            </span>
            <span className="ticket-total-val">Rs. {totalAmount}</span>
          </div>
        </div>

        {/* Ticket Footer Action */}
        <div className="ticket-footer">
          {!bookingConfirmed ? (
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={!isReady}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Confirm Booking
            </button>
          ) : (
            <div className="confirmed-box">
              <div className="confirmed-title">✓ Booking Confirmed Successfully!</div>
              <p>Your tickets have been reserved.</p>
              <p style={{ marginTop: '6px', fontWeight: 600 }}>Enjoy the show! 🍿</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingSummary;
