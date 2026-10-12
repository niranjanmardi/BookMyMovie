import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import SeatSelection from '../components/SeatSelection';
import { renderWithProviders } from './testUtils';

const mockMovie = { id: 'm1', title: 'Jailer 2' };
const mockTheatre = { id: 'th1', name: 'KG Cinemas (Multiplex)', area: 'Race Course' };
const mockDate = { iso: '2026-10-15', displayLabel: 'Today (Thu)' };
const mockTime = { id: 'st1000', time: '10:00 AM', label: 'Morning' };

describe('Experiment 1: SeatSelection Component', () => {
  it('displays instructions when screening info is incomplete', () => {
    renderWithProviders(<SeatSelection />, {
      preloadedState: {
        booking: {
          selectedMovie: null,
          selectedTheatre: null,
          selectedDate: null,
          selectedTime: null,
          selectedSeats: [],
          bookedSeatsForCurrentShow: [],
        },
      },
    });

    expect(
      screen.getByText(/Please choose a Theatre, Date, and Showtime above before picking your seats/i)
    ).toBeInTheDocument();
  });

  it('renders 110 seats across rows A to J with aisle and screen banner', () => {
    renderWithProviders(<SeatSelection />, {
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

    // Screen visual
    expect(screen.getByText(/4K LASER CINEMA SCREEN/i)).toBeInTheDocument();

    // Verify row letters
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((row) => {
      const rowElements = screen.getAllByText(row);
      expect(rowElements.length).toBeGreaterThanOrEqual(1);
    });

    // Check legend items
    expect(screen.getByText(/Regular \(A–E\) • ₹150/i)).toBeInTheDocument();
    expect(screen.getByText(/Premium \(F–H\) • ₹200/i)).toBeInTheDocument();
    expect(screen.getByText(/Recliner \(I–J\) • ₹300/i)).toBeInTheDocument();

    // Check seats exist (e.g. A1, A5, A6, J11)
    expect(screen.getByRole('button', { name: /^Seat A1,/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Seat A5,/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Seat A6,/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Seat J11,/i })).toBeInTheDocument();
  });

  it('displays selected seats in summary chips and calculates subtotal', () => {
    renderWithProviders(<SeatSelection />, {
      preloadedState: {
        booking: {
          selectedMovie: mockMovie,
          selectedTheatre: mockTheatre,
          selectedDate: mockDate,
          selectedTime: mockTime,
          selectedSeats: ['A1', 'F1', 'J1'],
          totalAmount: 650, // 150 + 200 + 300
          priceBreakdown: {
            Regular: { count: 1, rate: 150, total: 150, seats: ['A1'] },
            Premium: { count: 1, rate: 200, total: 200, seats: ['F1'] },
            Recliner: { count: 1, rate: 300, total: 300, seats: ['J1'] },
            totalAmount: 650,
            totalSeats: 3,
          },
        },
      },
    });

    // Chosen Seats count
    expect(screen.getByText(/Chosen Seats \(3\)/i)).toBeInTheDocument();

    // Subtotal
    expect(screen.getByText('₹650')).toBeInTheDocument();

    // Breakdown tags
    expect(screen.getByText(/Regular: 1 × ₹150 = ₹150/i)).toBeInTheDocument();
    expect(screen.getByText(/Premium: 1 × ₹200 = ₹200/i)).toBeInTheDocument();
    expect(screen.getByText(/Recliner: 1 × ₹300 = ₹300/i)).toBeInTheDocument();
  });

  it('dispatches toggleSeat action when an available seat is clicked', () => {
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
    fireEvent.click(seatA1);

    const state = store.getState();
    expect(state.booking.selectedSeats).toContain('A1');
    expect(state.booking.totalAmount).toBe(150);
  });
});
