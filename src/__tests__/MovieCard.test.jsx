import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import MovieCard from '../components/MovieCard';
import { renderWithProviders } from './testUtils';

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

describe('Experiment 1: MovieCard Component', () => {
  it('renders movie title, rating badge, category badge, and metadata accurately', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    // Title
    expect(screen.getByRole('heading', { level: 3, name: 'Jailer 2' })).toBeInTheDocument();

    // Rating
    expect(screen.getByText('8.8')).toBeInTheDocument();

    // Category (Tamil) badge
    expect(screen.getByTitle('Industry: Tamil')).toHaveTextContent('Tamil');

    // Upcoming status
    expect(screen.getByText(/Upcoming • 2026/i)).toBeInTheDocument();

    // Language and Year
    expect(screen.getAllByText(/Tamil/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/165 min/)).toBeInTheDocument();
  });

  it('renders poster image with proper alt text', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);
    const posterImg = screen.getByAltText('Jailer 2 poster');
    expect(posterImg).toBeInTheDocument();
    expect(posterImg).toHaveAttribute('src', '/posters/jailer2ogk.jpg');
  });

  it('shows selected overlay badge and active button style when isSelected is true', () => {
    const { rerender } = renderWithProviders(
      <MovieCard movie={mockMovie} isSelected={false} />
    );

    expect(screen.getByRole('button', { name: /Book Tickets/i })).toBeInTheDocument();
    expect(screen.queryByText('✓ Selected for Booking')).not.toBeInTheDocument();

    // Re-render as selected
    rerender(<MovieCard movie={mockMovie} isSelected={true} />);
    expect(screen.getByText('✓ Selected for Booking')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /✓ Selected/i })).toHaveClass('active-select');
  });

  it('calls onSelect handler with movie payload when "Book Tickets" button is clicked', () => {
    const handleSelect = jest.fn();
    renderWithProviders(
      <MovieCard movie={mockMovie} onSelect={handleSelect} />
    );

    const bookBtn = screen.getByRole('button', { name: /Book Tickets/i });
    fireEvent.click(bookBtn);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockMovie);
  });

  it('handles keyboard accessibility with Enter and Space keys on card', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);
    const cardElement = screen.getByRole('button', { name: /View details for Jailer 2/i });

    expect(cardElement).toHaveAttribute('tabIndex', '0');

    // Keydown Enter should not throw
    fireEvent.keyDown(cardElement, { key: 'Enter', code: 'Enter' });
    // Keydown Space should not throw
    fireEvent.keyDown(cardElement, { key: ' ', code: 'Space' });
  });

  it('returns null gracefully when movie is undefined', () => {
    const { container } = renderWithProviders(<MovieCard movie={null} />);
    expect(container.firstChild).toBeNull();
  });
});
