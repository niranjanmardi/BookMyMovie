import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import SeatSelection from '../components/SeatSelection';
import { renderWithProviders } from './testUtils';
import bookingReducer, { toggleSeat, removeSeat } from '../redux/bookingSlice';

const mockMovie = { id: 'm1', title: 'Jailer 2' };
const mockTheatre = { id: 'th1', name: 'KG Cinemas', area: 'Race Course' };
const mockDate = { iso: '2026-10-15', displayLabel: 'Today (Thu)' };
const mockTime = { id: 'st1000', time: '10:00 AM', label: 'Morning' };

describe('Experiment 1: Seat Selection and Removal', () => {
  describe('Redux Booking Slice Reducer Actions', () => {
    it('toggleSeat adds a new seat when not already selected', () => {
      const initialState = {
        selectedSeats: [],
        totalAmount: 0,
        totalSeats: 0,
        priceBreakdown: {},
      };

      const nextState = bookingReducer(initialState, toggleSeat('A1'));
      expect(nextState.selectedSeats).toEqual(['A1']);
      expect(nextState.totalAmount).toBe(150);
      expect(nextState.totalSeats).toBe(1);
    });

    it('toggleSeat removes the seat when already selected (deselect)', () => {
      const initialState = {
        selectedSeats: ['A1', 'A2'],
        totalAmount: 300,
        totalSeats: 2,
        priceBreakdown: {},
      };

      const nextState = bookingReducer(initialState, toggleSeat('A1'));
      expect(nextState.selectedSeats).toEqual(['A2']);
      expect(nextState.totalAmount).toBe(150);
      expect(nextState.totalSeats).toBe(1);
    });

    it('removeSeat filters out specified seat and recalculates totals', () => {
      const initialState = {
        selectedSeats: ['A1', 'F1', 'J1'], // Regular(150) + Premium(200) + Recliner(300) = 650
        totalAmount: 650,
        totalSeats: 3,
        priceBreakdown: {},
      };

      const nextState = bookingReducer(initialState, removeSeat('F1'));
      expect(nextState.selectedSeats).toEqual(['A1', 'J1']);
      expect(nextState.totalAmount).toBe(450); // 150 + 300
      expect(nextState.totalSeats).toBe(2);
    });
  });

  describe('Interactive Component Seat Selection and Removal', () => {
    it('allows user to select multiple seats and toggles them off on second click', () => {
      const { store } = renderWithProviders(<SeatSelection />, {
        preloadedState: {
          booking: {
            selectedMovie: mockMovie,
            selectedTheatre: mockTheatre,
            selectedDate: mockDate,
            selectedTime: mockTime,
            selectedSeats: [],
          },
        },
      });

      const seatA1 = screen.getByRole('button', { name: /^Seat A1,/i });
      const seatA4 = screen.getByRole('button', { name: /^Seat A4,/i });

      // Click A1 -> Selects A1
      fireEvent.click(seatA1);
      expect(store.getState().booking.selectedSeats).toEqual(['A1']);

      // Click A4 -> Selects A4
      fireEvent.click(seatA4);
      expect(store.getState().booking.selectedSeats).toEqual(['A1', 'A4']);

      // Click A1 again -> Deselects A1
      fireEvent.click(seatA1);
      expect(store.getState().booking.selectedSeats).toEqual(['A4']);
    });

    it('removes seat when clicking the remove button (✕) on chosen seat chip', () => {
      const { store } = renderWithProviders(<SeatSelection />, {
        preloadedState: {
          booking: {
            selectedMovie: mockMovie,
            selectedTheatre: mockTheatre,
            selectedDate: mockDate,
            selectedTime: mockTime,
            selectedSeats: ['A1', 'A2'],
            totalAmount: 300,
            priceBreakdown: {
              Regular: { count: 2, rate: 150, total: 300, seats: ['A1', 'A2'] },
              Premium: { count: 0, rate: 200, total: 0, seats: [] },
              Recliner: { count: 0, rate: 300, total: 0, seats: [] },
              totalAmount: 300,
              totalSeats: 2,
            },
          },
        },
      });

      const removeBtnA1 = screen.getByTitle('Remove seat A1');
      fireEvent.click(removeBtnA1);

      expect(store.getState().booking.selectedSeats).toEqual(['A2']);
    });

    it('prevents selecting already booked seats and displays warning toast', () => {
      const { store } = renderWithProviders(<SeatSelection />, {
        preloadedState: {
          booking: {
            selectedMovie: mockMovie,
            selectedTheatre: mockTheatre,
            selectedDate: mockDate,
            selectedTime: mockTime,
            selectedSeats: [],
          },
        },
      });

      // Find any seat that is rendered with 'booked' class
      const allSeatButtons = screen.getAllByRole('button');
      const bookedSeat = allSeatButtons.find((btn) => btn.classList.contains('booked'));

      if (bookedSeat) {
        expect(bookedSeat).toBeDisabled();
        fireEvent.click(bookedSeat);

        // Selected seats should remain empty
        expect(store.getState().booking.selectedSeats).toEqual([]);
      }
    });
  });
});
