// ============================================================
// Experiment 1 - Test Case (f)
// File: BookingComponents.test.jsx
// Tool: Jest + React Testing Library
// What this tests: The BookingSummary (Admission Pass) component
// ============================================================

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import BookingSummary from '../components/BookingSummary';
import { renderWithProviders } from './testUtils';
import * as bookingService from '../services/bookingService';

// Fake booking data for testing
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

// Fake date and time
const mockDate = { iso: '2026-10-15', displayLabel: 'Today (Thu)' };
const mockTime = { id: 'st1000', time: '10:00 AM', label: 'Morning' };

// describe() groups all booking component tests
describe('Experiment 1: Booking Components & Admission Pass', () => {

  // After each test, restore mocked functions to their original state
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test Case 1: Check if the admission pass shows all booking details
  it('renders admission pass ticket structure with movie, theatre, date, time, and seats', () => {
    // Render BookingSummary with all details in Redux store
    renderWithProviders(<BookingSummary />, {
      preloadedState: {
        booking: {
          selectedMovie:   mockMovie,
          selectedTheatre: mockTheatre,
          selectedDate:    mockDate,
          selectedTime:    mockTime,
          selectedSeats:   ['A1', 'A2'],
          totalAmount:     300,
          totalSeats:      2,
          priceBreakdown: {
            Regular:  { count: 2, rate: 150, total: 300, seats: ['A1', 'A2'] },
            Premium:  { count: 0, rate: 200, total: 0,   seats: [] },
            Recliner: { count: 0, rate: 300, total: 0,   seats: [] },
            totalAmount: 300,
            totalSeats:  2,
          },
          bookingConfirmed: false,
        },
      },
    });

    // The ticket header should say "CINEMA ADMISSION PASS"
    expect(screen.getByText('CINEMA ADMISSION PASS')).toBeInTheDocument();

    // Movie title should be visible
    expect(screen.getByText('Jailer 2')).toBeInTheDocument();

    // Theatre name and area should show
    expect(screen.getByText(/KG Cinemas \(Race Course\)/i)).toBeInTheDocument();

    // Date label should appear
    expect(screen.getByText('Today (Thu)')).toBeInTheDocument();

    // Show time and label should appear
    expect(screen.getByText(/10:00 AM \(Morning\)/i)).toBeInTheDocument();

    // Selected seats should be listed
    expect(screen.getByText('A1, A2')).toBeInTheDocument();

    // Total amount Rs.300 should appear somewhere
    expect(screen.getAllByText(/300/).length).toBeGreaterThanOrEqual(1);
  });

  // Test Case 2: Check if the Confirm button is disabled when info is missing
  it('disables confirm button when required booking details are missing', () => {
    // Render with theatre missing (null)
    renderWithProviders(<BookingSummary />, {
      preloadedState: {
        booking: {
          selectedMovie:   mockMovie,
          selectedTheatre: null,     // no theatre selected
          selectedDate:    mockDate,
          selectedTime:    mockTime,
          selectedSeats:   [],       // no seats selected
          totalAmount:     0,
          totalSeats:      0,
          priceBreakdown: {
            Regular:  { count: 0, rate: 150, total: 0, seats: [] },
            Premium:  { count: 0, rate: 200, total: 0, seats: [] },
            Recliner: { count: 0, rate: 300, total: 0, seats: [] },
            totalAmount: 0,
            totalSeats:  0,
          },
          bookingConfirmed: false,
        },
      },
    });

    // Find the "Confirm & Book Tickets" button
    const confirmBtn = screen.getByRole('button', { name: /Confirm & Book Tickets/i });

    // It should be disabled because theatre and seats are missing
    expect(confirmBtn).toBeDisabled();
  });

  // Test Case 3: Check if booking works and shows confirmation message + reference ID
  it('successfully confirms booking and displays confirmation badge and reference code', async () => {
    // Mock the confirmNewBooking service to return a fake booking ID
    jest.spyOn(bookingService, 'confirmNewBooking').mockReturnValue({
      bookingId: 'BMM-CBE-TEST01',
      reference: 'BMM-CBE-TEST01',
    });

    // Render with all booking details filled
    const { store } = renderWithProviders(<BookingSummary />, {
      preloadedState: {
        booking: {
          selectedMovie:   mockMovie,
          selectedTheatre: mockTheatre,
          selectedDate:    mockDate,
          selectedTime:    mockTime,
          selectedSeats:   ['A1'],
          totalAmount:     150,
          totalSeats:      1,
          priceBreakdown: {
            Regular:  { count: 1, rate: 150, total: 150, seats: ['A1'] },
            Premium:  { count: 0, rate: 200, total: 0,   seats: [] },
            Recliner: { count: 0, rate: 300, total: 0,   seats: [] },
            totalAmount: 150,
            totalSeats:  1,
          },
          bookingConfirmed: false,
        },
      },
    });

    // Confirm button should be enabled because all info is filled
    const confirmBtn = screen.getByRole('button', { name: /Confirm & Book Tickets/i });
    expect(confirmBtn).not.toBeDisabled();

    // Click the Confirm button
    fireEvent.click(confirmBtn);

    // Wait for Redux state to update
    await waitFor(() => {
      const state = store.getState();

      // bookingConfirmed should now be true
      expect(state.booking.bookingConfirmed).toBe(true);

      // Booking reference should be saved in Redux
      expect(state.booking.bookingReference).toBe('BMM-CBE-TEST01');
    });

    // Confirmation message should appear on screen
    expect(screen.getByText('Booking Confirmed Successfully!')).toBeInTheDocument();

    // Reference code BMM-CBE-TEST01 should appear
    expect(screen.getAllByText('BMM-CBE-TEST01').length).toBeGreaterThanOrEqual(1);

    // "Book Another Movie" button should appear after confirmation
    expect(screen.getByRole('button', { name: /Book Another Movie/i })).toBeInTheDocument();
  });

  // Test Case 4: Check if "Book Another Movie" resets the booking
  it('resets booking when "Book Another Movie" is clicked', async () => {
    // Render with a confirmed booking already in state
    const { store } = renderWithProviders(<BookingSummary />, {
      preloadedState: {
        booking: {
          selectedMovie:    mockMovie,
          selectedTheatre:  mockTheatre,
          selectedDate:     mockDate,
          selectedTime:     mockTime,
          selectedSeats:    ['A1'],
          totalAmount:      150,
          totalSeats:       1,
          priceBreakdown: {
            Regular:  { count: 1, rate: 150, total: 150, seats: ['A1'] },
            Premium:  { count: 0, rate: 200, total: 0,   seats: [] },
            Recliner: { count: 0, rate: 300, total: 0,   seats: [] },
            totalAmount: 150,
            totalSeats:  1,
          },
          bookingConfirmed: true,             // booking was already confirmed
          bookingReference: 'BMM-CBE-TEST01',
        },
      },
    });

    // Click the "Book Another Movie" button
    const bookAnotherBtn = screen.getByRole('button', { name: /Book Another Movie/i });
    fireEvent.click(bookAnotherBtn);

    // Check Redux state after clicking
    const state = store.getState();

    // bookingConfirmed should be reset to false
    expect(state.booking.bookingConfirmed).toBe(false);

    // selectedMovie should be cleared (null)
    expect(state.booking.selectedMovie).toBeNull();

    // selectedSeats should be empty
    expect(state.booking.selectedSeats).toEqual([]);
  });

});
