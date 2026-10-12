import React, { useMemo } from 'react';
import useBooking from '../hooks/useBooking';
import { getShowtimesForTheatre } from '../data/showtimes.js';

function ShowTiming() {
  const {
    selectedTheatre,
    selectedDate,
    handleSelectDate,
    selectedTime,
    handleSelectTime,
    availableDates,
  } = useBooking();

  // Dynamic showtimes for selected theatre & date
  const showtimes = useMemo(() => {
    return getShowtimesForTheatre(selectedTheatre?.id, selectedDate?.iso);
  }, [selectedTheatre, selectedDate]);

  return (
    <div className="show-timing-container">
      {/* ── 1. Date Selection Section ── */}
      <div className="timing-block">
        <div className="timing-section-header">
          <div className="timing-section-label">
            <span>📅</span>
            <span>1. Select Date (Today up to 7 Days Ahead)</span>
          </div>
          {selectedDate && (
            <span className="current-date-pill">
              Selected: {selectedDate.displayLabel}
            </span>
          )}
        </div>

        <div className="dates-grid" role="radiogroup" aria-label="Select booking date">
          {availableDates.map((d) => {
            const isSelected = selectedDate?.iso === d.iso;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => handleSelectDate(d)}
                className={`date-chip ${isSelected ? 'selected' : ''}`}
                title={d.full}
                aria-checked={isSelected}
                role="radio"
              >
                <span className="date-day">{d.dayName}</span>
                <span className="date-num">{d.dayNum}</span>
                <span className="date-month">{d.monthStr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Showtime Selection Section ── */}
      <div className="timing-block" style={{ marginTop: '22px' }}>
        <div className="timing-section-header">
          <div className="timing-section-label">
            <span>⏰</span>
            <span>2. Select Showtime</span>
          </div>
          {selectedTime && (
            <span className="current-time-pill">
              Selected: {selectedTime.time} ({selectedTime.label})
            </span>
          )}
        </div>

        <div className="timings-grid" role="radiogroup" aria-label="Select show timing">
          {showtimes.map((timing) => {
            const isSelected = selectedTime?.id === timing.id;
            const isAvailable = timing.isAvailable;

            return (
              <button
                key={timing.id}
                type="button"
                onClick={() => isAvailable && handleSelectTime(timing)}
                disabled={!isAvailable}
                className={`timing-pill ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled-time' : ''}`}
                title={
                  !isAvailable
                    ? `${timing.time} – Show time has passed for today`
                    : `${timing.time} (${timing.label})`
                }
                aria-checked={isSelected}
                role="radio"
              >
                <span className="time-display">{timing.time}</span>
                <span className="time-label">{isAvailable ? timing.label : 'Past Show'}</span>
                {isSelected && <span className="time-selected-check">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Demo schedule disclaimer */}
        <div className="schedule-disclaimer-note">
          ℹ️ <em>Demo Coimbatore schedule: Showtimes differ by date &amp; venue. Past shows for today are automatically disabled.</em>
        </div>
      </div>
    </div>
  );
}

export default ShowTiming;
