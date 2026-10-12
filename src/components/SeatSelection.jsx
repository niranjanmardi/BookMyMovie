import React, { useState } from 'react';
import useBooking from '../hooks/useBooking';
import { ROW_CONFIG, getSeatCategory, getSeatPrice } from '../data/seatLayout.js';

function SeatSelection() {
  const {
    selectedSeats,
    handleToggleSeat,
    handleRemoveSeat,
    bookedSeatsForCurrentShow,
    priceBreakdown,
    totalAmount,
    selectedMovie,
    selectedTheatre,
    selectedDate,
    selectedTime,
  } = useBooking();

  const [blockedSeatWarning, setBlockedSeatWarning] = useState(null);

  const handleSeatClick = (seatId) => {
    if (bookedSeatsForCurrentShow.includes(seatId)) {
      setBlockedSeatWarning(`⚠️ Seat ${seatId} is already booked for this screening. Please select another seat.`);
      setTimeout(() => setBlockedSeatWarning(null), 3000);
      return;
    }

    setBlockedSeatWarning(null);
    handleToggleSeat(seatId);
  };

  const isSelectionDisabled = !selectedMovie || !selectedTheatre || !selectedDate || !selectedTime;

  return (
    <div className="seat-selection-container">
      {/* ── Context reminder header ── */}
      <div className="seat-selection-header-banner">
        <div className="screening-meta-summary">
          <span className="meta-point">🎬 <strong>{selectedMovie?.title || 'Selected Movie'}</strong></span>
          <span className="meta-sep">•</span>
          <span className="meta-point">🏛️ <strong>{selectedTheatre?.name || 'Selected Theatre'}</strong></span>
          <span className="meta-sep">•</span>
          <span className="meta-point">📅 <strong>{selectedDate?.displayLabel || 'Date'}</strong></span>
          <span className="meta-sep">•</span>
          <span className="meta-point">⏰ <strong>{selectedTime?.time || 'Showtime'}</strong></span>
        </div>
      </div>

      {isSelectionDisabled && (
        <div className="seat-disabled-notice">
          👉 <em>Please choose a Theatre, Date, and Showtime above before picking your seats.</em>
        </div>
      )}

      {/* ── Warning Toast when clicking a booked seat ── */}
      {blockedSeatWarning && (
        <div className="seat-warning-toast" role="alert">
          {blockedSeatWarning}
        </div>
      )}

      {/* ── Cinema Screen Visual ── */}
      <div className="screen-container">
        <div className="screen-curve"></div>
        <div className="screen-text">
          <span>ALL EYES THIS WAY • 4K LASER CINEMA SCREEN</span>
        </div>
      </div>

      {/* ── 110-Seat Grid (10 Rows × 11 Seats) ── */}
      <div className="cinema-auditorium">
        {ROW_CONFIG.map(({ row, category, price, seatsCount }) => (
          <div key={row} className="seat-row-wrapper">
            {/* Category tag on the far left for row clusters */}
            <span className={`row-tier-pill tier-${category.toLowerCase()}`}>
              {category.slice(0, 3)}
            </span>

            {/* Row Letter (A–J) */}
            <span className="row-letter-label">{row}</span>

            {/* Seats Row with Aisle */}
            <div className="seat-row-seats">
              {/* Left Block: Seats 1 to 5 */}
              <div className="seats-block left-block">
                {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => {
                  const seatId = `${row}${num}`;
                  const isBooked = bookedSeatsForCurrentShow.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      type="button"
                      onClick={() => handleSeatClick(seatId)}
                      disabled={isBooked || isSelectionDisabled}
                      className={`seat-box tier-${category.toLowerCase()} ${
                        isBooked ? 'booked' : isSelected ? 'selected' : 'available'
                      }`}
                      title={
                        isBooked
                          ? `Seat ${seatId} (${category}) – Already Booked`
                          : `Seat ${seatId} (${category}) – Rs. ${price}`
                      }
                      aria-label={`Seat ${seatId}, ${category}, Rs. ${price}, ${
                        isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'
                      }`}
                    >
                      <span className="seat-inner-num">{num}</span>
                    </button>
                  );
                })}
              </div>

              {/* Central Walking Aisle */}
              <div className="aisle-spacer" aria-hidden="true">
                <span className="aisle-label">AISLE</span>
              </div>

              {/* Right Block: Seats 6 to 11 */}
              <div className="seats-block right-block">
                {Array.from({ length: seatsCount - 5 }, (_, i) => i + 6).map((num) => {
                  const seatId = `${row}${num}`;
                  const isBooked = bookedSeatsForCurrentShow.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      type="button"
                      onClick={() => handleSeatClick(seatId)}
                      disabled={isBooked || isSelectionDisabled}
                      className={`seat-box tier-${category.toLowerCase()} ${
                        isBooked ? 'booked' : isSelected ? 'selected' : 'available'
                      }`}
                      title={
                        isBooked
                          ? `Seat ${seatId} (${category}) – Already Booked`
                          : `Seat ${seatId} (${category}) – Rs. ${price}`
                      }
                      aria-label={`Seat ${seatId}, ${category}, Rs. ${price}, ${
                        isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'
                      }`}
                    >
                      <span className="seat-inner-num">{num}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row Letter repeated on right for ease of scanning */}
            <span className="row-letter-label right-side">{row}</span>
          </div>
        ))}
      </div>

      {/* ── Status & Category Legend ── */}
      <div className="seats-legend-panel">
        <div className="legend-group">
          <span className="legend-group-title">Status:</span>
          <div className="legend-item">
            <span className="legend-box sample-available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-box sample-selected"></span>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <span className="legend-box sample-booked">✕</span>
            <span>Booked</span>
          </div>
        </div>

        <div className="legend-group">
          <span className="legend-group-title">Categories:</span>
          <div className="legend-item">
            <span className="category-dot tier-regular"></span>
            <span>Regular (A–E) • ₹150</span>
          </div>
          <div className="legend-item">
            <span className="category-dot tier-premium"></span>
            <span>Premium (F–H) • ₹200</span>
          </div>
          <div className="legend-item">
            <span className="category-dot tier-recliner"></span>
            <span>Recliner (I–J) • ₹300</span>
          </div>
        </div>
      </div>

      {/* ── Real-Time Dynamic Selection Breakdown ── */}
      {selectedSeats.length > 0 && (
        <div className="seat-selection-summary-card">
          <div className="selection-summary-top">
            <div className="selected-seats-chip-list">
              <span className="chips-title">Chosen Seats ({selectedSeats.length}):</span>
              {selectedSeats.map((seatId) => (
                <span key={seatId} className={`chosen-seat-chip chip-${getSeatCategory(seatId).toLowerCase()}`}>
                  <span>{seatId} <small>({getSeatCategory(seatId)} ₹{getSeatPrice(seatId)})</small></span>
                  <button
                    type="button"
                    className="remove-seat-btn"
                    title={`Remove seat ${seatId}`}
                    onClick={() => handleRemoveSeat(seatId)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="selection-grand-total">
              <span className="grand-total-label">Subtotal</span>
              <span className="grand-total-amount">₹{totalAmount}</span>
            </div>
          </div>

          {/* Category-by-category pricing line */}
          <div className="category-pricing-breakdown-row">
            {priceBreakdown.Regular.count > 0 && (
              <span className="tier-breakdown-tag">
                Regular: {priceBreakdown.Regular.count} × ₹150 = ₹{priceBreakdown.Regular.total}
              </span>
            )}
            {priceBreakdown.Premium.count > 0 && (
              <span className="tier-breakdown-tag">
                Premium: {priceBreakdown.Premium.count} × ₹200 = ₹{priceBreakdown.Premium.total}
              </span>
            )}
            {priceBreakdown.Recliner.count > 0 && (
              <span className="tier-breakdown-tag">
                Recliner: {priceBreakdown.Recliner.count} × ₹300 = ₹{priceBreakdown.Recliner.total}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatSelection;
