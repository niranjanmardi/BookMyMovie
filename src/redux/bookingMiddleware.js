/**
 * Custom Redux Middleware for Movie Booking Actions:
 * - Logs action dispatch events with timestamp and state previews.
 * - Validates booking constraints (e.g., maximum 10 seats per transaction).
 * - Synchronizes active booking progress to browser storage for audit and recovery.
 */
export const bookingMiddleware = (store) => (next) => (action) => {
  // 1. Seat limit enforcement rule
  if (action.type === 'booking/toggleSeat') {
    const currentState = store.getState().booking;
    const seatId = action.payload;
    const isAlreadySelected = currentState.selectedSeats.includes(seatId);

    if (!isAlreadySelected && currentState.selectedSeats.length >= 10) {
      alert('Maximum seat limit reached! You can select up to 10 seats per booking.');
      return; // Intercept and block action from reaching the reducer
    }
  }

  // 2. Dispatch action through reducer pipeline
  const result = next(action);

  // 3. Action audit and logging
  if (typeof action.type === 'string' && action.type.startsWith('booking/')) {
    const nextState = store.getState().booking;
    console.group(`[Redux Booking Middleware] Action: ${action.type}`);
    console.log('Timestamp:', new Date().toLocaleTimeString());
    console.log('Action Payload:', action.payload);
    console.log('Selected Seats:', nextState.selectedSeats);
    console.log('Calculated Grand Total: ₹' + nextState.totalAmount);
    console.groupEnd();
  }

  // 4. Persistence handling for confirmed bookings
  if (action.type === 'booking/confirmBookingSuccess') {
    const finalState = store.getState().booking;
    const passData = {
      bookingReference: action.payload,
      movie: finalState.selectedMovie?.title,
      theatre: finalState.selectedTheatre?.name,
      date: finalState.selectedDate?.displayLabel || finalState.selectedDate,
      time: finalState.selectedTime?.time || finalState.selectedTime,
      seats: finalState.selectedSeats,
      totalAmount: finalState.totalAmount,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem('bm_redux_confirmed_pass', JSON.stringify(passData));
    } catch (err) {
      console.warn('Storage sync failed in bookingMiddleware:', err);
    }
  }

  return result;
};

export default bookingMiddleware;
