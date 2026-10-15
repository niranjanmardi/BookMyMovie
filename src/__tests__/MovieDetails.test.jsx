// ============================================================
// Experiment 1 - Test Case (a)
// Component: MovieDetails (Movie Details Page)
// Tool: Jest + React Testing Library
// What this tests: The movie detail page - loading, data, errors
// ============================================================

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import MovieDetailsPage from '../pages/MovieDetailsPage';
import { renderWithProviders } from './testUtils';
import * as movieApi from '../services/movieApi';

// Fake movie data used for testing the details page
const mockDetailMovie = {
  id: 'fb-tamil-2026-jailer2',
  title: 'Jailer 2',
  category: 'Tamil',
  language: 'Tamil',
  genre: 'Action / Crime / Thriller',
  genres: ['Action', 'Crime', 'Thriller'],
  rating: 8.8,
  year: 2026,
  releaseDate: '2026-08-14',
  releaseDateFormatted: 'August 14, 2026',
  runtime: '165 min',
  status: 'Upcoming',
  isUpcoming: true,
  cast: 'Rajinikanth, Mohanlal, Shiva Rajkumar, Ramya Krishnan',
  director: 'Nelson Dilipkumar',
  description: 'Tiger Muthuvel Pandian returns in an explosive sequel.',
  poster: '/posters/jailer2ogk.jpg',
  backdrop: '/posters/jailer2ogk.jpg',
};

// describe() groups all test cases for MovieDetails page
describe('Experiment 1: MovieDetails Component', () => {

  // After each test, restore all mocked functions to their original state
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test Case 1: Check if a loading spinner shows while data is being fetched
  it('renders loading state initially while fetching movie details', () => {
    // We mock getMovieById to never resolve - simulating a slow network
    jest.spyOn(movieApi, 'getMovieById').mockImplementation(() => new Promise(() => {}));

    // Render the page with a fake URL
    renderWithProviders(<MovieDetailsPage />, {
      initialEntries: ['/movies/fb-tamil-2026-jailer2'],
    });

    // A loading spinner should be shown while waiting for data
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // Test Case 2: Check if movie details appear correctly after data loads
  it('renders movie details correctly after successful fetch', async () => {
    // Mock the API to return our fake movie data
    jest.spyOn(movieApi, 'getMovieById').mockResolvedValue(mockDetailMovie);

    renderWithProviders(<MovieDetailsPage />, {
      initialEntries: ['/movies/fb-tamil-2026-jailer2'],
    });

    // Wait for the data to load and the title to appear
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Jailer 2' })).toBeInTheDocument();
    });

    // Check that the movie description is shown
    expect(screen.getByText('Tiger Muthuvel Pandian returns in an explosive sequel.')).toBeInTheDocument();

    // Check that director name is shown
    expect(screen.getByText('Nelson Dilipkumar')).toBeInTheDocument();

    // Check that cast names are shown
    expect(screen.getByText(/Rajinikanth, Mohanlal/)).toBeInTheDocument();

    // Check that genre badges like Action, Thriller are shown
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Thriller')).toBeInTheDocument();

    // Check that "Book Tickets Now" button exists on the page
    expect(screen.getByRole('button', { name: /Book Tickets Now/i })).toBeInTheDocument();
  });

  // Test Case 3: Check if clicking "Book Tickets Now" saves movie in Redux store
  it('dispatches handleSelectMovie when "Book Tickets Now" is clicked', async () => {
    jest.spyOn(movieApi, 'getMovieById').mockResolvedValue(mockDetailMovie);

    // Get the store to check Redux state later
    const { store } = renderWithProviders(<MovieDetailsPage />, {
      initialEntries: ['/movies/fb-tamil-2026-jailer2'],
    });

    // Wait for the page to finish loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Book Tickets Now/i })).toBeInTheDocument();
    });

    // Click the Book Tickets Now button
    const bookBtn = screen.getByRole('button', { name: /Book Tickets Now/i });
    fireEvent.click(bookBtn);

    // Check that the movie was saved in Redux store as selectedMovie
    const state = store.getState();
    expect(state.booking.selectedMovie).toEqual(mockDetailMovie);
  });

  // Test Case 4: Check if an error message shows when API call fails
  it('renders error message when movie fetching fails', async () => {
    // Mock the API to throw an error (simulate network failure or wrong movie ID)
    jest.spyOn(movieApi, 'getMovieById').mockRejectedValue(new Error('Movie not found in 2026 catalog.'));

    renderWithProviders(<MovieDetailsPage />, {
      initialEntries: ['/movies/invalid-id'],
    });

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Movie not found in 2026 catalog./i)).toBeInTheDocument();
    });

    // A "Try Again" button should also be visible
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

});
