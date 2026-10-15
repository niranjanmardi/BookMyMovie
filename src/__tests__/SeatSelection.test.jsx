// ============================================================
// Experiment 1 - Test Case (c)
// Component: SeatSelection
// Tool: Jest + React Testing Library
// What this tests: Seat layout rendering and clicking seats
// ============================================================

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import SeatSelection from '../components/SeatSelection';
import { renderWithProviders } from './testUtils';

// Fake data for movie, theatre, date and time
const mockMovie   = { id: 'm1', title: 'Jailer 2' };
const mockTheatre = { id: 'th1', name: 'KG Cinemas (Multiplex)', area: 'Race Course' };
const mockDate    = { iso: '2026-10-15', displayLabel: 'Today (Thu)' };
const mockTime    = { id: 'st1000', time: '10:00 AM', label: 'Morning' };

// describe() groups all SeatSelection component tests
describe('Experiment 1: SeatSelection Component', () => {

  // Test Case 1: Check if instructions appear when no movie/theatre/time is selected yet
  it('displays instructions when screening info is incomplete', () => {
    // Render SeatSelection with nothing selected
    renderWithProviders(<SeatSelection />, {
      preloadedState: {
        booking: {
          selectedMovie:   null,  // no movie selected
          selectedTheatre: null,  // no theatre selected
          selectedDate:    null,
          selectedTime:    null,  // no showtime selected
          selectedSeats:   [],
          bookedSeatsForCurrentShow: [],
        },
      },
    });

    // The component should tell the user to select theatre, date and showtime first
    expect(
      screen.getByText(/Please choose a Theatre, Date, and Showtime above before picking your seats/i)
    ).toBeInTheDocument();
  });

  // Test Case 2: Check if all 110 seats and the screen banner are rendered
  it('renders 110 seats across rows A to J with aisle and screen banner', () => {
    // Render with all required selections made
    renderWithProviders(<SeatSelection />, {
      preloadedState: {
        booking: {
          selectedMovie:   mockMovie,
          selectedTheatre: mockTheatre,
          selectedDate:    mockDate,
          selectedTime:    mockTime,
          selectedSeats:   [],  // no seats selected yet
        },
      },
    });

    // The cinema screen banner text should be visible
    expect(screen.getByText(/4K LASER CINEMA SCREEN/i)).toBeInTheDocument();

    // All row letters A to J must be visible in the seat grid
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((row) => {
      const rowElements = screen.getAllByText(row);
      expect(rowElements.length).toBeGreaterThanOrEqual(1);
    });

    // The seat legend (price guide) should show all 3 categories
    expect(screen.getByText(/Regular \(A–E\) • ₹150/i)).toBeInTheDocument();
    expect(screen.getByText(/Premium \(F–H\) • ₹200/i)).toBeInTheDocument();
    expect(screen.getByText(/Recliner \(I–J\) • ₹300/i)).toBeInTheDocument();

    // Specific seat buttons should exist - checking A1, A5, A6, J11
    expect(screen.getByRole('button', { name: /^Seat A1,/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Seat A5,/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Seat A6,/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Seat J11,/i })).toBeInTheDocument();
  });

  // Test Case 3: Check if selected seats show as chips with price breakdown
  it('displays selected seats in summary chips and calculates subtotal', () => {
    // Render with 3 seats already selected: A1 (Regular), F1 (Premium), J1 (Recliner)
    renderWithProviders(<SeatSelection />, {
      preloadedState: {
        booking: {
          selectedMovie:   mockMovie,
          selectedTheatre: mockTheatre,
          selectedDate:    mockDate,
          selectedTime:    mockTime,
          selectedSeats:   ['A1', 'F1', 'J1'],
          totalAmount:     650, // 150 + 200 + 300 = 650
          priceBreakdown: {
            Regular:  { count: 1, rate: 150, total: 150, seats: ['A1'] },
            Premium:  { count: 1, rate: 200, total: 200, seats: ['F1'] },
            Recliner: { count: 1, rate: 300, total: 300, seats: ['J1'] },
            totalAmount: 650,
            totalSeats: 3,
          },
        },
      },
    });

    // It should show "Chosen Seats (3)"
    expect(screen.getByText(/Chosen Seats \(3\)/i)).toBeInTheDocument();

    // Total should show Rs.650
    expect(screen.getByText('₹650')).toBeInTheDocument();

    // Price breakdown for each category should be visible
    expect(screen.getByText(/Regular: 1 × ₹150 = ₹150/i)).toBeInTheDocument();
    expect(screen.getByText(/Premium: 1 × ₹200 = ₹200/i)).toBeInTheDocument();
    expect(screen.getByText(/Recliner: 1 × ₹300 = ₹300/i)).toBeInTheDocument();
  });

  // Test Case 4: Check if clicking a seat adds it to Redux store
  it('dispatches toggleSeat action when an available seat is clicked', () => {
    // Get store to check Redux state after clicking
    const { store } = renderWithProviders(<SeatSelection />, {
      preloadedState: {
        booking: {
          selectedMovie:   mockMovie,
          selectedTheatre: mockTheatre,
          selectedDate:    mockDate,
          selectedTime:    mockTime,
          selectedSeats:   [],  // start with no seats selected
        },
      },
    });

    // Find seat A1 button
    const seatA1 = screen.getByRole('button', { name: /^Seat A1,/i });

    // Click on seat A1
    fireEvent.click(seatA1);

    // Check Redux store - A1 should now be in selectedSeats
    const state = store.getState();
    expect(state.booking.selectedSeats).toContain('A1');

    // Total amount should now be Rs.150 (Regular seat price)
    expect(state.booking.totalAmount).toBe(150);
  });

});
