// ============================================================
// Experiment 1 - Test Case (a)
// Component: MovieCard
// Tool: Jest + React Testing Library
// What this tests: How the movie card looks and behaves
// ============================================================

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import MovieCard from '../components/MovieCard';
import { renderWithProviders } from './testUtils';

// This is a fake movie object we use for testing
// Instead of using real data, we create dummy data
const mockMovie = {
  id: 'fb-tamil-2026-jailer2',
  title: 'Jailer 2',
  category: 'Tamil',
  language: 'Tamil',
  genre: 'Action / Crime / Thriller',
  genres: ['Action', 'Crime', 'Thriller'],
  rating: 8.8,
  year: 2026,
  runtime: '165 min',
  poster: '/posters/jailer2ogk.jpg',
  isUpcoming: true,
};

// describe() groups all test cases related to MovieCard
describe('Experiment 1: MovieCard Component', () => {

  // Test Case 1: Check if title, rating, category, year, runtime are shown
  it('renders movie title, rating badge, category badge, and metadata accurately', () => {
    // Render the MovieCard component with our fake movie
    renderWithProviders(<MovieCard movie={mockMovie} />);

    // Check if the movie title "Jailer 2" is shown as a heading
    expect(screen.getByRole('heading', { level: 3, name: 'Jailer 2' })).toBeInTheDocument();

    // Check if rating 8.8 is shown on the card
    expect(screen.getByText('8.8')).toBeInTheDocument();

    // Check if the Tamil category badge is shown
    expect(screen.getByTitle('Industry: Tamil')).toHaveTextContent('Tamil');

    // Check if the "Upcoming 2026" badge is shown
    expect(screen.getByText(/Upcoming • 2026/i)).toBeInTheDocument();

    // Check if Tamil language text and runtime 165 min are shown
    expect(screen.getAllByText(/Tamil/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/165 min/)).toBeInTheDocument();
  });

  // Test Case 2: Check if the poster image loads with correct alt text
  it('renders poster image with proper alt text', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    // Find the poster image using its alt text
    const posterImg = screen.getByAltText('Jailer 2 poster');

    // Check the image is on the page
    expect(posterImg).toBeInTheDocument();

    // Check the image src path is correct
    expect(posterImg).toHaveAttribute('src', '/posters/jailer2ogk.jpg');
  });

  // Test Case 3: Check selected state - when user selects a movie
  it('shows selected overlay badge and active button style when isSelected is true', () => {
    // First render with isSelected = false (not selected)
    const { rerender } = renderWithProviders(
      <MovieCard movie={mockMovie} isSelected={false} />
    );

    // "Book Tickets" button should be visible when not selected
    expect(screen.getByRole('button', { name: /Book Tickets/i })).toBeInTheDocument();

    // "Selected for Booking" badge should NOT be visible
    expect(screen.queryByText('✓ Selected for Booking')).not.toBeInTheDocument();

    // Now re-render with isSelected = true (user has selected this movie)
    rerender(<MovieCard movie={mockMovie} isSelected={true} />);

    // Now the selected badge should appear
    expect(screen.getByText('✓ Selected for Booking')).toBeInTheDocument();

    // Button should now show "Selected" with active class
    expect(screen.getByRole('button', { name: /✓ Selected/i })).toHaveClass('active-select');
  });

  // Test Case 4: Check if clicking "Book Tickets" calls the handler function
  it('calls onSelect handler with movie payload when "Book Tickets" button is clicked', () => {
    // jest.fn() creates a fake function to track if it was called
    const handleSelect = jest.fn();

    renderWithProviders(
      <MovieCard movie={mockMovie} onSelect={handleSelect} />
    );

    // Find the Book Tickets button
    const bookBtn = screen.getByRole('button', { name: /Book Tickets/i });

    // Simulate a click on the button
    fireEvent.click(bookBtn);

    // Check that our fake function was called exactly 1 time
    expect(handleSelect).toHaveBeenCalledTimes(1);

    // Check that it was called with the correct movie data
    expect(handleSelect).toHaveBeenCalledWith(mockMovie);
  });

  // Test Case 5: Check keyboard accessibility (Enter and Space keys)
  it('handles keyboard accessibility with Enter and Space keys on card', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    // Find the card element by its aria-label
    const cardElement = screen.getByRole('button', { name: /View details for Jailer 2/i });

    // Card should have tabIndex=0 so keyboard users can focus it
    expect(cardElement).toHaveAttribute('tabIndex', '0');

    // Pressing Enter should work without throwing any error
    fireEvent.keyDown(cardElement, { key: 'Enter', code: 'Enter' });

    // Pressing Space should also work without error
    fireEvent.keyDown(cardElement, { key: ' ', code: 'Space' });
  });

  // Test Case 6: Check that the component handles null/undefined movie safely
  it('returns null gracefully when movie is undefined', () => {
    // Pass null instead of a movie object
    const { container } = renderWithProviders(<MovieCard movie={null} />);

    // The component should render nothing (no crash)
    expect(container.firstChild).toBeNull();
  });

});
