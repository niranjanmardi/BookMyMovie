import React from 'react';
import useBooking from '../hooks/useBooking';
import BookingSummary from '../components/BookingSummary';
import BookingHistory from '../components/BookingHistory';

function SummaryPage() {
  const { selectedMovie } = useBooking();
  const hasActiveSelection = Boolean(selectedMovie);

  return (
    <div className="summary-page">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="coimbatore-tag-badge">
          <span>🏛️ Coimbatore Multiplex Cinema Reservations</span>
        </div>
        <h1 className="page-title">Cinema Admission &amp; Booking Management</h1>
        <p className="page-subtitle">
          {hasActiveSelection
            ? 'Review your selected seats, theatre venue, and pricing before final confirmation'
            : 'Manage your verified digital passes and ticket history with REST API CRUD operations'}
        </p>
      </div>

      {hasActiveSelection && (
        <div className="active-summary-container" style={{ marginBottom: '40px' }}>
          <BookingSummary />
        </div>
      )}

      {/* REST API CRUD Booking History (GET, PUT, DELETE) */}
      <BookingHistory />
    </div>
  );
}

export default SummaryPage;
