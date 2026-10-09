import React from 'react';
import useBooking from '../hooks/useBooking';

// 30 seats across 3 rows
const ROWS = [
  { row: 'A', seats: ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10'] },
  { row: 'B', seats: ['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10'] },
  { row: 'C', seats: ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10'] },
];

function SeatSelection() {
  const { selectedSeats, handleToggleSeat, ticketPrice } = useBooking();

  return (
    <div>
      {/* Cinema Screen Indicator */}
      <div className="screen-container">
        <div className="screen-curve"></div>
        <span className="screen-text">ALL EYES THIS WAY • CINEMA SCREEN</span>
      </div>

      {/* Seats Grid – 3 rows × 10 seats = 30 seats */}
      <div className="seats-rows">
        {ROWS.map(({ row, seats }) => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            <div className="seats-grid">
              {seats.map((seat) => {
                const isSelected = selectedSeats.includes(seat);
                return (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => handleToggleSeat(seat)}
                    className={`seat-box ${isSelected ? 'selected' : ''}`}
                    title={`Seat ${seat} – Rs. ${ticketPrice}`}
                  >
                    {seat.slice(1)} {/* show only number inside button */}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="seats-legend">
        <div className="legend-item">
          <span className="legend-dot available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot selected"></span>
          <span>Selected</span>
        </div>
      </div>

      {/* Selected count */}
      {selectedSeats.length > 0 && (
        <div className="seats-selected-info">
          ✅ {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected:&nbsp;
          <strong>{selectedSeats.join(', ')}</strong>
        </div>
      )}
    </div>
  );
}

export default SeatSelection;
