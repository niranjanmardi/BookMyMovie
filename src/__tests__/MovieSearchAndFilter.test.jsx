import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import GenreFilter from '../components/GenreFilter';
import { fetchMovies } from '../services/movieApi';
import { FALLBACK_MOVIES_2026 } from '../data/fallbackMovies';

describe('Experiment 1: Movie Search and Filtering', () => {
  describe('SearchBar Component Unit Tests', () => {
    it('renders input with placeholder and reflects provided query', () => {
      render(
        <SearchBar
          searchQuery="Batman"
          onSearchChange={jest.fn()}
          placeholder="Search movie titles..."
        />
      );

      const input = screen.getByPlaceholderText('Search movie titles...');
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('Batman');
    });

    it('triggers onSearchChange when user types in the search bar', () => {
      const handleSearchChange = jest.fn();
      render(<SearchBar searchQuery="" onSearchChange={handleSearchChange} />);

      const input = screen.getByRole('textbox', { name: /Search movies by title/i });
      fireEvent.change(input, { target: { value: 'Jailer' } });

      expect(handleSearchChange).toHaveBeenCalledTimes(1);
      expect(handleSearchChange).toHaveBeenCalledWith('Jailer');
    });

    it('displays clear button when query is not empty and resets on click', () => {
      const handleSearchChange = jest.fn();
      render(<SearchBar searchQuery="Dune" onSearchChange={handleSearchChange} />);

      const clearBtn = screen.getByRole('button', { name: /Clear search input/i });
      expect(clearBtn).toBeInTheDocument();

      fireEvent.click(clearBtn);
      expect(handleSearchChange).toHaveBeenCalledWith('');
    });
  });

  describe('CategoryFilter Component Unit Tests', () => {
    it('renders category options (All Movies, Tamil, Hollywood) with correct active state', () => {
      render(
        <CategoryFilter
          categories={['All Movies', 'Tamil', 'Hollywood']}
          selectedCategory="Tamil"
          onSelectCategory={jest.fn()}
        />
      );

      const tamilBtn = screen.getByRole('button', { name: /Tamil/i });
      expect(tamilBtn).toHaveClass('active');
      expect(tamilBtn).toHaveAttribute('aria-pressed', 'true');

      const hwBtn = screen.getByRole('button', { name: /Hollywood/i });
      expect(hwBtn).not.toHaveClass('active');
    });

    it('calls onSelectCategory when clicking category pills', () => {
      const handleSelectCategory = jest.fn();
      render(
        <CategoryFilter
          categories={['All Movies', 'Tamil', 'Hollywood']}
          selectedCategory="All Movies"
          onSelectCategory={handleSelectCategory}
        />
      );

      const hwBtn = screen.getByRole('button', { name: /Hollywood/i });
      fireEvent.click(hwBtn);

      expect(handleSelectCategory).toHaveBeenCalledTimes(1);
      expect(handleSelectCategory).toHaveBeenCalledWith('Hollywood');
    });
  });

  describe('GenreFilter Component Unit Tests', () => {
    it('renders genre pills and calls onSelectGenre on click', () => {
      const handleSelectGenre = jest.fn();
      render(
        <GenreFilter
          genres={['All Genres', 'Action', 'Drama', 'Sci-Fi']}
          selectedGenre="Action"
          onSelectGenre={handleSelectGenre}
        />
      );

      const actionBtn = screen.getByRole('button', { name: 'Action' });
      expect(actionBtn).toHaveClass('active');

      const dramaBtn = screen.getByRole('button', { name: 'Drama' });
      fireEvent.click(dramaBtn);

      expect(handleSelectGenre).toHaveBeenCalledWith('Drama');
    });
  });

  describe('Integrated Movie Catalog Search & Filter Logic', () => {
    it('returns all movies when search query and filters are blank / default', async () => {
      const result = await fetchMovies({
        search: '',
        category: 'All Movies',
        genre: 'All Genres',
      });

      expect(result.movies.length).toBe(FALLBACK_MOVIES_2026.length);
    });

    it('filters movie catalog by title search query case-insensitively', async () => {
      const result = await fetchMovies({
        search: 'jailer',
        category: 'All Movies',
        genre: 'All Genres',
      });

      expect(result.movies.length).toBeGreaterThan(0);
      result.movies.forEach((movie) => {
        expect(movie.title.toLowerCase()).toContain('jailer');
      });
    });

    it('filters movie catalog by Tamil category', async () => {
      const result = await fetchMovies({
        search: '',
        category: 'Tamil',
        genre: 'All Genres',
      });

      expect(result.movies.length).toBeGreaterThan(0);
      result.movies.forEach((movie) => {
        expect(movie.category.toLowerCase()).toBe('tamil');
      });
    });

    it('filters movie catalog by Hollywood category', async () => {
      const result = await fetchMovies({
        search: '',
        category: 'Hollywood',
        genre: 'All Genres',
      });

      expect(result.movies.length).toBeGreaterThan(0);
      result.movies.forEach((movie) => {
        expect(movie.category.toLowerCase()).toBe('hollywood');
      });
    });

    it('filters movie catalog by genre accurately', async () => {
      const result = await fetchMovies({
        search: '',
        category: 'All Movies',
        genre: 'Action',
      });

      expect(result.movies.length).toBeGreaterThan(0);
      result.movies.forEach((movie) => {
        const matchesGenre =
          movie.genres.some((g) => g.toLowerCase() === 'action') ||
          movie.genre.toLowerCase().includes('action');
        expect(matchesGenre).toBe(true);
      });
    });

    it('applies combined search query and category filtering', async () => {
      const result = await fetchMovies({
        search: 'Av',
        category: 'Hollywood',
        genre: 'All Genres',
      });

      result.movies.forEach((movie) => {
        expect(movie.title.toLowerCase()).toContain('av');
        expect(movie.category.toLowerCase()).toBe('hollywood');
      });
    });
  });
});
