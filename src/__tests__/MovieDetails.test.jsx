import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import MovieDetailsPage from '../pages/MovieDetailsPage';
import { renderWithProviders } from './testUtils';
import * as movieApi from '../services/movieApi';

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

describe('Experiment 1: MovieDetails Component', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders loading state initially while fetching movie details', () => {
    jest.spyOn(movieApi, 'getMovieById').mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<MovieDetailsPage />, {
      initialEntries: ['/movies/fb-tamil-2026-jailer2'],
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders movie details correctly after successful fetch', async () => {
    jest.spyOn(movieApi, 'getMovieById').mockResolvedValue(mockDetailMovie);

    renderWithProviders(<MovieDetailsPage />, {
      initialEntries: ['/movies/fb-tamil-2026-jailer2'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Jailer 2' })).toBeInTheDocument();
    });

    // Check synopsis description
    expect(screen.getByText('Tiger Muthuvel Pandian returns in an explosive sequel.')).toBeInTheDocument();

    // Check director and cast
    expect(screen.getByText('Nelson Dilipkumar')).toBeInTheDocument();
    expect(screen.getByText(/Rajinikanth, Mohanlal/)).toBeInTheDocument();

    // Check genre badges
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Thriller')).toBeInTheDocument();

    // Check CTA button
    expect(screen.getByRole('button', { name: /Book Tickets Now/i })).toBeInTheDocument();
  });

  it('dispatches handleSelectMovie when "Book Tickets Now" is clicked', async () => {
    jest.spyOn(movieApi, 'getMovieById').mockResolvedValue(mockDetailMovie);

    const { store } = renderWithProviders(<MovieDetailsPage />, {
      initialEntries: ['/movies/fb-tamil-2026-jailer2'],
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Book Tickets Now/i })).toBeInTheDocument();
    });

    const bookBtn = screen.getByRole('button', { name: /Book Tickets Now/i });
    fireEvent.click(bookBtn);

    // Verify movie was saved to Redux store
    const state = store.getState();
    expect(state.booking.selectedMovie).toEqual(mockDetailMovie);
  });

  it('renders error message when movie fetching fails', async () => {
    jest.spyOn(movieApi, 'getMovieById').mockRejectedValue(new Error('Movie not found in 2026 catalog.'));

    renderWithProviders(<MovieDetailsPage />, {
      initialEntries: ['/movies/invalid-id'],
    });

    await waitFor(() => {
      expect(screen.getByText(/Movie not found in 2026 catalog./i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });
});
