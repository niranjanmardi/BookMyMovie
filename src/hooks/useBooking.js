import { useContext } from 'react';
import { BookingContext } from '../context/BookingContext';

// Custom Hook - useBooking
// Any component can call this hook to get booking data and functions
// Instead of writing useContext(BookingContext) in every component,
// we just call useBooking() - that's the benefit of a custom hook!

function useBooking() {
  const context = useContext(BookingContext);
  return context;
}

export default useBooking;
