import React, { useState, useEffect, useCallback } from 'react';
import {
  getBookingHistory,
  updateBooking,
  cancelBooking,
} from '../services/bookingApiService';

const SHOWTIMED_OPTIONS = [
  { id: 'st1000', time: '10:00 AM', label: 'Morning Show' },
  { id: 'st1330', time: '1:30 PM',  label: 'Matinee Show' },
  { id: 'st1630', time: '4:30 PM',  label: 'Evening Show' },
  { id: 'st1930', time: '7:30 PM',  label: 'Night Show' },
  { id: 'st2215', time: '10:15 PM', label: 'Late Night' },
];

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State (PUT)
  const [editingBooking, setEditingBooking] = useState(null);
  const [editShowtime, setEditShowtime] = useState('');
  const [editSeatsInput, setEditSeatsInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState(null);

  // Cancellation State (DELETE)
  const [cancellingId, setCancellingId] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // 1. GET: Fetch Booking History
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookingHistory();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to load booking history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Open Edit Modal (PUT)
  const handleOpenEdit = (booking) => {
    setEditingBooking(booking);
    setEditShowtime(booking.showtime?.time || '');
    setEditSeatsInput((booking.seats || []).join(', '));
    setEditError(null);
  };

  const handleCloseEdit = () => {
    setEditingBooking(null);
    setEditError(null);
  };

  // 2. PUT: Submit Booking Modifications
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;

    const parsedSeats = editSeatsInput
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (parsedSeats.length === 0) {
      setEditError('Booking must have at least 1 seat.');
      return;
    }

    setIsUpdating(true);
    setEditError(null);

    try {
      const selectedTimeObj = SHOWTIMED_OPTIONS.find((t) => t.time === editShowtime) || {
        id: 'mod',
        time: editShowtime,
        label: 'Selected Show',
      };

      const updated = await updateBooking(editingBooking.bookingId, {
        showtime: selectedTimeObj,
        seats: parsedSeats,
      });

      // Update local state with modified record
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === updated.bookingId ? updated : b))
      );

      setActionSuccessMsg(`Booking ${updated.bookingId} modified successfully!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      handleCloseEdit();
    } catch (err) {
      setEditError(err.message || 'Unable to update booking.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. DELETE: Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel booking ${bookingId}? This action cannot be undone.`
    );
    if (!confirmCancel) return;

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);

      // Update local list to show CANCELLED status
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId
            ? { ...b, status: 'CANCELLED', cancelledAt: new Date().toISOString() }
            : b
        )
      );

      setActionSuccessMsg(`Booking ${bookingId} has been cancelled.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      alert(`Failed to cancel booking: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="booking-history-container">
      <div className="history-header-toolbar">
        <div>
          <h2 className="history-title">My Booking History (REST API CRUD)</h2>
          <p className="history-subtitle">
            View, modify, or cancel movie ticket reservations using GET, PUT, and DELETE APIs
          </p>
        </div>
        <button
          type="button"
          onClick={fetchBookings}
          className="btn-secondary refresh-btn"
          disabled={loading}
          title="Refresh booking list (GET)"
        >
          {loading ? 'Fetching...' : '🔄 Refresh List (GET)'}
        </button>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMsg && (
        <div className="api-toast-success" role="alert">
          ✓ {actionSuccessMsg}
        </div>
      )}

      {/* 1. Loading State */}
      {loading && (
        <div className="api-loading-panel">
          <div className="spinner"></div>
          <p>Retrieving booking records from API...</p>
        </div>
      )}

      {/* 2. Error State */}
      {error && !loading && (
        <div className="api-error-panel" role="alert">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h4>API Request Failed</h4>
            <p>{error}</p>
            <button type="button" onClick={fetchBookings} className="btn-secondary">
              Retry GET Request
            </button>
          </div>
        </div>
      )}

      {/* 3. Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="empty-history-card">
          <div className="empty-icon">🎟️</div>
          <h3>No Bookings Found</h3>
          <p>You haven't made any cinema ticket reservations yet.</p>
        </div>
      )}

      {/* 4. Bookings List Grid */}
      {!loading && !error && bookings.length > 0 && (
        <div className="bookings-grid">
          {bookings.map((b) => {
            const isCancelled = b.status === 'CANCELLED';
            const isModified = b.status === 'MODIFIED';

            return (
              <div
                key={b.bookingId || b.reference}
                className={`history-card ${isCancelled ? 'card-cancelled' : ''}`}
              >
                <div className="history-card-top">
                  <div>
                    <span className="ref-tag">{b.bookingId || b.reference}</span>
                    <span
                      className={`status-pill status-${(b.status || 'confirmed').toLowerCase()}`}
                    >
                      {b.status || 'CONFIRMED'}
                    </span>
                  </div>
                  <span className="history-time-stamp">
                    {b.confirmedAt ? `Booked: ${b.confirmedAt}` : 'Today'}
                  </span>
                </div>

                <div className="history-card-content">
                  {b.movie?.poster && (
                    <img
                      src={b.movie.poster}
                      alt={b.movie.title}
                      className="history-movie-thumb"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="history-card-details">
                    <h4 className="history-movie-name">{b.movie?.title || 'Movie Title'}</h4>
                    <p className="history-theatre-name">
                      🏛️ {b.theatre?.name} ({b.theatre?.area})
                    </p>
                    <div className="history-meta-row">
                      <span>📅 {b.date?.displayLabel || b.date?.full || 'Date'}</span>
                      <span>⏰ {b.showtime?.time || 'Showtime'}</span>
                    </div>
                    <div className="history-seats-row">
                      <span>💺 Seats ({b.seats?.length || 0}):</span>
                      <strong className="history-seats-val">
                        {b.seats?.join(', ') || 'None'}
                      </strong>
                    </div>
                    <div className="history-amount-row">
                      <span>Total Amount:</span>
                      <span className="history-amount-val">₹{b.amount}</span>
                    </div>
                  </div>
                </div>

                {/* CRUD Action Buttons */}
                <div className="history-card-actions">
                  {!isCancelled ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(b)}
                        className="btn-secondary modify-btn"
                        title="Modify booking via PUT API"
                      >
                        ✏️ Modify Booking (PUT)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b.bookingId)}
                        disabled={cancellingId === b.bookingId}
                        className="btn-danger cancel-btn"
                        title="Cancel booking via DELETE API"
                      >
                        {cancellingId === b.bookingId ? 'Cancelling...' : '✕ Cancel (DELETE)'}
                      </button>
                    </>
                  ) : (
                    <span className="cancelled-notice">
                      🚫 Booking Cancelled • Seats Released
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal for Modifying Booking Details (PUT API) ── */}
      {editingBooking && (
        <div className="modal-backdrop" onClick={handleCloseEdit}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Modify Booking Details (PUT API)</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseEdit}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="modal-info-bar">
                <span>Ref: <strong>{editingBooking.bookingId}</strong></span>
                <span>Movie: <strong>{editingBooking.movie?.title}</strong></span>
              </div>

              {editError && (
                <div className="modal-error-alert" role="alert">
                  ⚠️ {editError}
                </div>
              )}

              {/* Modify Showtime */}
              <div className="form-group">
                <label htmlFor="edit-showtime-select">Select New Showtime:</label>
                <select
                  id="edit-showtime-select"
                  className="form-control"
                  value={editShowtime}
                  onChange={(e) => setEditShowtime(e.target.value)}
                  required
                >
                  {SHOWTIMED_OPTIONS.map((st) => (
                    <option key={st.id} value={st.time}>
                      {st.time} — {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modify Seats */}
              <div className="form-group">
                <label htmlFor="edit-seats-input">
                  Modify Seats (Comma separated, e.g., A1, A2, B4):
                </label>
                <input
                  id="edit-seats-input"
                  type="text"
                  className="form-control"
                  value={editSeatsInput}
                  onChange={(e) => setEditSeatsInput(e.target.value)}
                  placeholder="e.g. A1, A2"
                  required
                />
                <small className="form-hint">
                  Pricing will automatically update dynamically across Regular (₹150), Premium (₹200), and Recliner (₹300).
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseEdit}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving Updates (PUT)...' : 'Save Changes (PUT)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingHistory;
