import React, { useMemo } from 'react';
import useBooking from '../hooks/useBooking';

const TIMINGS = [
  { id: 1, time: '10:00 AM', label: 'Morning' },
  { id: 2, time: '2:00 PM',  label: 'Matinee' },
  { id: 3, time: '6:00 PM',  label: 'Evening' },
  { id: 4, time: '9:00 PM',  label: 'Night'   },
];

// Generate next 7 available dates from today
function getNextDates(count = 7) {
  const dates = [];
  const today = new Date();
  const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      id: i,
      dayName:  i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
      dateNum:  d.getDate(),
      monthStr: months[d.getMonth()],
      full:     d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      iso:      d.toISOString().slice(0, 10),
    });
  }
  return dates;
}

function ShowTiming() {
  const { selectedDate, handleSelectDate, selectedTime, handleSelectTime } = useBooking();
  const DATES = useMemo(() => getNextDates(7), []);

  return (
    <div>
      {/* ── Date Row ── */}
      <div className="timing-section-label">📅 Select Date</div>
      <div className="dates-grid">
        {DATES.map((d) => {
          const isSelected = selectedDate?.iso === d.iso;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => handleSelectDate(d)}
              className={`date-chip ${isSelected ? 'selected' : ''}`}
              title={d.full}
            >
              <span className="date-day">{d.dayName}</span>
              <span className="date-num">{d.dateNum}</span>
              <span className="date-month">{d.monthStr}</span>
            </button>
          );
        })}
      </div>

      {/* ── Time Row ── */}
      <div className="timing-section-label" style={{ marginTop: '16px' }}>⏰ Select Show Time</div>
      <div className="timings-grid">
        {TIMINGS.map((timing) => {
          const isSelected = selectedTime?.id === timing.id;
          return (
            <button
              key={timing.id}
              type="button"
              onClick={() => handleSelectTime(timing)}
              className={`timing-chip ${isSelected ? 'selected' : ''}`}
            >
              <span>{timing.time}</span>
              <span style={{ fontSize: '11px', display: 'block', opacity: 0.8, marginTop: '2px' }}>
                {timing.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ShowTiming;
