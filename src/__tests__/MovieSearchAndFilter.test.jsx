// ============================================================
// Experiment 1 - Test Case (b)
// Component: SearchBar, CategoryFilter, GenreFilter
// Tool: Jest + React Testing Library
// What this tests: Movie search and filtering feature
// ============================================================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import GenreFilter from '../components/GenreFilter';
import { fetchMovies } from '../services/movieApi';
import { FALLBACK_MOVIES_2026 } from '../data/fallbackMovies';

// describe() groups all search and filter related tests
describe('Experiment 1: Movie Search and Filtering', () => {

  // ---- SearchBar Tests ----
  describe('SearchBar Component Unit Tests', () => {

    // Test Case 1: Check if search input shows the placeholder and current value
    it('renders input with placeholder and reflects provided query', () => {
      // Render SearchBar with searchQuery = "Batman" already typed
      render(
        <SearchBar
          searchQuery="Batman"
          onSearchChange={jest.fn()}
          placeholder="Search movie titles..."
        />
      );

      // Find the input by its placeholder text
      const input = screen.getByPlaceholderText('Search movie titles...');

      // Input should be on the page
      expect(input).toBeInTheDocument();

      // Input value should show "Batman"
      expect(input.value).toBe('Batman');
    });

    // Test Case 2: Check if typing in search calls the onChange function
    it('triggers onSearchChange when user types in the search bar', () => {
      // Create a fake onChange function to track calls
      const handleSearchChange = jest.fn();

      render(<SearchBar searchQuery="" onSearchChange={handleSearchChange} />);

      // Find the search input box
      const input = screen.getByRole('textbox', { name: /Search movies by title/i });

      // Simulate user typing "Jailer" in the input
      fireEvent.change(input, { target: { value: 'Jailer' } });

      // The onChange function should have been called once
      expect(handleSearchChange).toHaveBeenCalledTimes(1);

      // It should have been called with the typed value
      expect(handleSearchChange).toHaveBeenCalledWith('Jailer');
    });

    // Test Case 3: Check if clear button appears and works
    it('displays clear button when query is not empty and resets on click', () => {
      const handleSearchChange = jest.fn();

      // Render with "Dune" already typed
      render(<SearchBar searchQuery="Dune" onSearchChange={handleSearchChange} />);

      // Clear button should be visible because there is text in the input
      const clearBtn = screen.getByRole('button', { name: /Clear search input/i });
      expect(clearBtn).toBeInTheDocument();

      // Click the clear button
      fireEvent.click(clearBtn);

      // onChange should be called with empty string to clear the search
      expect(handleSearchChange).toHaveBeenCalledWith('');
    });

  });

  // ---- CategoryFilter Tests ----
  describe('CategoryFilter Component Unit Tests', () => {

    // Test Case 4: Check if category buttons are shown and active state works
    it('renders category options (All Movies, Tamil, Hollywood) with correct active state', () => {
      render(
        <CategoryFilter
          categories={['All Movies', 'Tamil', 'Hollywood']}
          selectedCategory="Tamil"   // Tamil is the currently selected category
          onSelectCategory={jest.fn()}
        />
      );

      // Tamil button should have "active" class because it is selected
      const tamilBtn = screen.getByRole('button', { name: /Tamil/i });
      expect(tamilBtn).toHaveClass('active');

      // Tamil button should have aria-pressed="true"
      expect(tamilBtn).toHaveAttribute('aria-pressed', 'true');

      // Hollywood button should NOT have active class
      const hwBtn = screen.getByRole('button', { name: /Hollywood/i });
      expect(hwBtn).not.toHaveClass('active');
    });

    // Test Case 5: Check if clicking a category calls the handler
    it('calls onSelectCategory when clicking category pills', () => {
      const handleSelectCategory = jest.fn();

      render(
        <CategoryFilter
          categories={['All Movies', 'Tamil', 'Hollywood']}
          selectedCategory="All Movies"
          onSelectCategory={handleSelectCategory}
        />
      );

      // Click the Hollywood button
      const hwBtn = screen.getByRole('button', { name: /Hollywood/i });
      fireEvent.click(hwBtn);

      // Handler should be called once with "Hollywood"
      expect(handleSelectCategory).toHaveBeenCalledTimes(1);
      expect(handleSelectCategory).toHaveBeenCalledWith('Hollywood');
    });

  });

  // ---- GenreFilter Tests ----
  describe('GenreFilter Component Unit Tests', () => {

    // Test Case 6: Check if genre pills are shown and clicking them works
    it('renders genre pills and calls onSelectGenre on click', () => {
      const handleSelectGenre = jest.fn();

      render(
        <GenreFilter
          genres={['All Genres', 'Action', 'Drama', 'Sci-Fi']}
          selectedGenre="Action"   // Action is currently selected
          onSelectGenre={handleSelectGenre}
        />
      );

      // Action button should have "active" class
      const actionBtn = screen.getByRole('button', { name: 'Action' });
      expect(actionBtn).toHaveClass('active');

      // Click on Drama button
      const dramaBtn = screen.getByRole('button', { name: 'Drama' });
      fireEvent.click(dramaBtn);

      // Handler should be called with "Drama"
      expect(handleSelectGenre).toHaveBeenCalledWith('Drama');
    });

  });

  // ---- Integrated Search + Filter Tests ----
  describe('Integrated Movie Catalog Search & Filter Logic', () => {

    // Test Case 7: No filters = all movies should be returned
    it('returns all movies when search query and filters are blank / default', async () => {
      const result = await fetchMovies({
        search: '',
        category: 'All Movies',
        genre: 'All Genres',
      });

      // Result count should match the total number of fallback movies
      expect(result.movies.length).toBe(FALLBACK_MOVIES_2026.length);
    });

    // Test Case 8: Searching by title should filter correctly (case-insensitive)
    it('filters movie catalog by title search query case-insensitively', async () => {
      // Search with lowercase "jailer" - should still find "Jailer 2"
      const result = await fetchMovies({
        search: 'jailer',
        category: 'All Movies',
        genre: 'All Genres',
      });

      // At least one movie should be found
      expect(result.movies.length).toBeGreaterThan(0);

      // Every returned movie must have "jailer" in its title
      result.movies.forEach((movie) => {
        expect(movie.title.toLowerCase()).toContain('jailer');
      });
    });

    // Test Case 9: Filtering by Tamil category
    it('filters movie catalog by Tamil category', async () => {
      const result = await fetchMovies({
        search: '',
        category: 'Tamil',
        genre: 'All Genres',
      });

      expect(result.movies.length).toBeGreaterThan(0);

      // Every returned movie must be Tamil
      result.movies.forEach((movie) => {
        expect(movie.category.toLowerCase()).toBe('tamil');
      });
    });

    // Test Case 10: Filtering by Hollywood category
    it('filters movie catalog by Hollywood category', async () => {
      const result = await fetchMovies({
        search: '',
        category: 'Hollywood',
        genre: 'All Genres',
      });

      expect(result.movies.length).toBeGreaterThan(0);

      // Every returned movie must be Hollywood
      result.movies.forEach((movie) => {
        expect(movie.category.toLowerCase()).toBe('hollywood');
      });
    });

    // Test Case 11: Filtering by genre
    it('filters movie catalog by genre accurately', async () => {
      const result = await fetchMovies({
        search: '',
        category: 'All Movies',
        genre: 'Action',
      });

      expect(result.movies.length).toBeGreaterThan(0);

      // Every returned movie must have "Action" as a genre
      result.movies.forEach((movie) => {
        const matchesGenre =
          movie.genres.some((g) => g.toLowerCase() === 'action') ||
          movie.genre.toLowerCase().includes('action');
        expect(matchesGenre).toBe(true);
      });
    });

    // Test Case 12: Using both search and category filter together
    it('applies combined search query and category filtering', async () => {
      const result = await fetchMovies({
        search: 'Av',           // search for "Av" (like Avengers)
        category: 'Hollywood',  // only Hollywood movies
        genre: 'All Genres',
      });

      // Every result must match both conditions
      result.movies.forEach((movie) => {
        expect(movie.title.toLowerCase()).toContain('av');
        expect(movie.category.toLowerCase()).toBe('hollywood');
      });
    });

  });

});
