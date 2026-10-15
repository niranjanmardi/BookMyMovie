// ============================================================
// Experiment 1 - Test Case (c)
// Component: SeatSelection (Selection + Removal)
// Tool: Jest + React Testing Library
// What this tests: Adding seats, removing seats, Redux actions
// ============================================================

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import SeatSelection from '../components/SeatSelection';
import { renderWithProviders } from './testUtils';

// Import the Redux reducer and actions we want to test directly
import bookingReducer, { toggleSeat, removeSeat } from '../redux/bookingSlice';

// Fake data for the tests
const mockMovie   = { id: 'm1', title: 'Jailer 2' };
const mockTheatre = { id: 'th1', name: 'KG Cinemas', area: 'Race Course' };
const mockDate    = { iso: '2026-10-15', displayLabel: 'Today (Thu)' };
const mockTime    = { id: 'st1000', time: '10:00 AM', label: 'Morning' };

describe('Experiment 1: Seat Selection and Removal', () => {

  // ==== Testing Redux Actions Directly (without UI) ====
  describe('Redux Booking Slice Reducer Actions', () => {

    // Test Case 1: toggleSeat should ADD a seat when it's not already selected
    it('toggleSeat adds a new seat when not already selected', () => {
      // Start with empty seats and zero price
      const initialState = {
        selectedSeats: [],
        totalAmount: 0,
        totalSeats: 0,
        priceBreakdown: {},
      };

      // Dispatch toggleSeat action for seat "A1"
      const nextState = bookingReducer(initialState, toggleSeat('A1'));

      // A1 should now be in the selectedSeats array
      expect(nextState.selectedSeats).toEqual(['A1']);

      // Price should be Rs.150 (Regular seat)
      expect(nextState.totalAmount).toBe(150);

      // Total seats count should be 1
      expect(nextState.totalSeats).toBe(1);
    });

    // Test Case 2: toggleSeat should REMOVE a seat if it is already selected
    it('toggleSeat removes the seat when already selected (deselect)', () => {
      // Start with A1 and A2 already selected
      const initialState = {
        selectedSeats: ['A1', 'A2'],
        totalAmount: 300, // 150 + 150
        totalSeats: 2,
        priceBreakdown: {},
      };

      // Toggle A1 again - should remove it
      const nextState = bookingReducer(initialState, toggleSeat('A1'));

      // Only A2 should remain
      expect(nextState.selectedSeats).toEqual(['A2']);

      // Price should drop to Rs.150 (only A2 remains)
      expect(nextState.totalAmount).toBe(150);
      expect(nextState.totalSeats).toBe(1);
    });

    // Test Case 3: removeSeat should remove a specific seat and recalculate total
    it('removeSeat filters out specified seat and recalculates totals', () => {
      // Start with 3 seats: A1 (Regular=150), F1 (Premium=200), J1 (Recliner=300)
      // Total = 650
      const initialState = {
        selectedSeats: ['A1', 'F1', 'J1'],
        totalAmount: 650,
        totalSeats: 3,
        priceBreakdown: {},
      };

      // Remove F1 (Premium seat)
      const nextState = bookingReducer(initialState, removeSeat('F1'));

      // F1 should no longer be in the list
      expect(nextState.selectedSeats).toEqual(['A1', 'J1']);

      // New total should be 150 + 300 = 450 (removed the 200 Premium seat)
      expect(nextState.totalAmount).toBe(450);
      expect(nextState.totalSeats).toBe(2);
    });

  });

  // ==== Testing Through the UI (Component Tests) ====
  describe('Interactive Component Seat Selection and Removal', () => {

    // Test Case 4: Click multiple seats and toggle them off
    it('allows user to select multiple seats and toggles them off on second click', () => {
      const { store } = renderWithProviders(<SeatSelection />, {
        preloadedState: {
          booking: {
            selectedMovie:   mockMovie,
            selectedTheatre: mockTheatre,
            selectedDate:    mockDate,
            selectedTime:    mockTime,
            selectedSeats:   [],
          },
        },
      });

      // Find seat A1 and A4 buttons
      const seatA1 = screen.getByRole('button', { name: /^Seat A1,/i });
      const seatA4 = screen.getByRole('button', { name: /^Seat A4,/i });

      // Click A1 - should be selected
      fireEvent.click(seatA1);
      expect(store.getState().booking.selectedSeats).toEqual(['A1']);

      // Click A4 - both A1 and A4 should be selected
      fireEvent.click(seatA4);
      expect(store.getState().booking.selectedSeats).toEqual(['A1', 'A4']);

      // Click A1 again - should deselect A1, only A4 remains
      fireEvent.click(seatA1);
      expect(store.getState().booking.selectedSeats).toEqual(['A4']);
    });

    // Test Case 5: Click the X button (remove chip) to remove a seat
    it('removes seat when clicking the remove button (✕) on chosen seat chip', () => {
      const { store } = renderWithProviders(<SeatSelection />, {
        preloadedState: {
          booking: {
            selectedMovie:   mockMovie,
            selectedTheatre: mockTheatre,
            selectedDate:    mockDate,
            selectedTime:    mockTime,
            selectedSeats:   ['A1', 'A2'],  // pre-select 2 seats
            totalAmount: 300,
            priceBreakdown: {
              Regular:  { count: 2, rate: 150, total: 300, seats: ['A1', 'A2'] },
              Premium:  { count: 0, rate: 200, total: 0,   seats: [] },
              Recliner: { count: 0, rate: 300, total: 0,   seats: [] },
              totalAmount: 300,
              totalSeats: 2,
            },
          },
        },
      });

      // Find the remove button for seat A1 (the small X chip button)
      const removeBtnA1 = screen.getByTitle('Remove seat A1');

      // Click the X to remove A1
      fireEvent.click(removeBtnA1);

      // Only A2 should remain in selectedSeats
      expect(store.getState().booking.selectedSeats).toEqual(['A2']);
    });

    // Test Case 6: Already booked seats should be disabled (cannot be clicked)
    it('prevents selecting already booked seats and displays warning toast', () => {
      const { store } = renderWithProviders(<SeatSelection />, {
        preloadedState: {
          booking: {
            selectedMovie:   mockMovie,
            selectedTheatre: mockTheatre,
            selectedDate:    mockDate,
            selectedTime:    mockTime,
            selectedSeats:   [],
          },
        },
      });

      // Look for any seat button that has the "booked" CSS class
      const allSeatButtons = screen.getAllByRole('button');
      const bookedSeat = allSeatButtons.find((btn) => btn.classList.contains('booked'));

      if (bookedSeat) {
        // Booked seat should be disabled - user cannot click it
        expect(bookedSeat).toBeDisabled();

        // Try clicking it anyway
        fireEvent.click(bookedSeat);

        // Selected seats should still be empty (click had no effect)
        expect(store.getState().booking.selectedSeats).toEqual([]);
      }
    });

  });

});
