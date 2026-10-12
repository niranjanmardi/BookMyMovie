import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import BookingSummary from '../components/BookingSummary';
import { renderWithProviders } from './testUtils';
import * as bookingService from '../services/bookingService';

const mockMovie = {
  id: 'm1',
  title: 'Jailer 2',
  category: 'Tamil',
  language: 'Tamil',
  year: 2026,
  poster: '/posters/jailer2.jpg',
};
const mockTheatre = {
  id: 'th1',
  name: 'KG Cinemas',
  area: 'Race Course',
  address: 'Bunglaw Road, Race Course, Coimbatore',
  screens: 'Audi 1 (4K RGB Laser - Dolby Atmos)',
};
const mockDate = { iso: '2026-10-15', displayLabel: 'Today (Thu)' };
const mockTime = { id: 'st1000', time: '10:00 AM', label: 'Morning' };

describe('Experiment 1: Booking Components & Admission Pass', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders admission pass ticket structure with movie, theatre, date, time, and seats', () => {
    renderWithProviders(<BookingSummary />, {
      preloadedState: {
        booking: {
          selectedMovie: mockMovie,
          selectedTheatre: mockTheatre,
          selectedDate: mockDate,
          selectedTime: mockTime,
          selectedSeats: ['A1', 'A2'],
          totalAmount: 300,
          totalSeats: 2,
          priceBreakdown: {
            Regular: { count: 2, rate: 150, total: 300, seats: ['A1', 'A2'] },
            Premium: { count: 0, rate: 200, total: 0, seats: [] },
            Recliner: { count: 0, rate: 300, total: 0, seats: [] },
            totalAmount: 300,
            totalSeats: 2,
          },
          bookingConfirmed: false,
        },
      },
    });

    expect(screen.getByText('CINEMA ADMISSION PASS')).toBeInTheDocument();
    expect(screen.getByText('Jailer 2')).toBeInTheDocument();
    expect(screen.getByText(/KG Cinemas \(Race Course\)/i)).toBeInTheDocument();
    expect(screen.getByText('Today (Thu)')).toBeInTheDocument();
    expect(screen.getByText(/10:00 AM \(Morning\)/i)).toBeInTheDocument();
    expect(screen.getByText('A1, A2')).toBeInTheDocument();
    expect(screen.getAllByText(/300/).length).toBeGreaterThanOrEqual(1);
  });

  it('disables confirm button when required booking details are missing', () => {
    renderWithProviders(<BookingSummary />, {
      preloadedState: {
        booking: {
          selectedMovie: mockMovie,
          selectedTheatre: null, // missing theatre
          selectedDate: mockDate,
          selectedTime: mockTime,
          selectedSeats: [],
          totalAmount: 0,
          totalSeats: 0,
          priceBreakdown: {
            Regular: { count: 0, rate: 150, total: 0, seats: [] },
            Premium: { count: 0, rate: 200, total: 0, seats: [] },
            Recliner: { count: 0, rate: 300, total: 0, seats: [] },
            totalAmount: 0,
            totalSeats: 0,
          },
          bookingConfirmed: false,
        },
      },
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirm & Book Tickets/i });
    expect(confirmBtn).toBeDisabled();
  });

  it('successfully confirms booking and displays confirmation badge and reference code', async () => {
    jest.spyOn(bookingService, 'confirmNewBooking').mockReturnValue({
      bookingId: 'BMM-CBE-TEST01',
      reference: 'BMM-CBE-TEST01',
    });

    const { store } = renderWithProviders(<BookingSummary />, {
      preloadedState: {
        booking: {
          selectedMovie: mockMovie,
          selectedTheatre: mockTheatre,
          selectedDate: mockDate,
          selectedTime: mockTime,
          selectedSeats: ['A1'],
          totalAmount: 150,
          totalSeats: 1,
          priceBreakdown: {
            Regular: { count: 1, rate: 150, total: 150, seats: ['A1'] },
            Premium: { count: 0, rate: 200, total: 0, seats: [] },
            Recliner: { count: 0, rate: 300, total: 0, seats: [] },
            totalAmount: 150,
            totalSeats: 1,
          },
          bookingConfirmed: false,
        },
      },
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirm & Book Tickets/i });
    expect(confirmBtn).not.toBeDisabled();

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      const state = store.getState();
      expect(state.booking.bookingConfirmed).toBe(true);
      expect(state.booking.bookingReference).toBe('BMM-CBE-TEST01');
    });

    expect(screen.getByText('Booking Confirmed Successfully!')).toBeInTheDocument();
    expect(screen.getAllByText('BMM-CBE-TEST01').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /Book Another Movie/i })).toBeInTheDocument();
  });

  it('resets booking when "Book Another Movie" is clicked', async () => {
    const { store } = renderWithProviders(<BookingSummary />, {
      preloadedState: {
        booking: {
          selectedMovie: mockMovie,
          selectedTheatre: mockTheatre,
          selectedDate: mockDate,
          selectedTime: mockTime,
          selectedSeats: ['A1'],
          totalAmount: 150,
          totalSeats: 1,
          priceBreakdown: {
            Regular: { count: 1, rate: 150, total: 150, seats: ['A1'] },
            Premium: { count: 0, rate: 200, total: 0, seats: [] },
            Recliner: { count: 0, rate: 300, total: 0, seats: [] },
            totalAmount: 150,
            totalSeats: 1,
          },
          bookingConfirmed: true,
          bookingReference: 'BMM-CBE-TEST01',
        },
      },
    });

    const bookAnotherBtn = screen.getByRole('button', { name: /Book Another Movie/i });
    fireEvent.click(bookAnotherBtn);

    const state = store.getState();
    expect(state.booking.bookingConfirmed).toBe(false);
    expect(state.booking.selectedMovie).toBeNull();
    expect(state.booking.selectedSeats).toEqual([]);
  });
});
