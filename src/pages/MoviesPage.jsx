import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useBooking from '../hooks/useBooking';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import GenreFilter from '../components/GenreFilter';
import MovieList from '../components/MovieList';
import { fetchMovies, getStandardGenres, getAvailableCategories } from '../services/movieApi';

function MoviesPage() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { selectedMovie, handleSelectMovie } = useBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Movies');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Available filters from service
  const availableCategories = useMemo(() => getAvailableCategories(), []);
  const availableGenres = useMemo(() => getStandardGenres(), []);

  // Asynchronous movie fetch with AbortController for cleanup & race prevention
  const loadMovies = useCallback(async (search, category, genre, pageNum = 1, signal) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const result = await fetchMovies({
        search,
        category,
        genre,
        page: pageNum,
        signal,
      });

      if (pageNum === 1) {
        setMovies(result.movies);
      } else {
        setMovies((prev) => [...prev, ...result.movies]);
      }
      setIsLiveApi(result.isLiveApi);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Unable to fetch 2026 movies catalog.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Filter change handlers that reset pagination
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setPage(1);
  };

  const handleSearchInputChange = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Effect to load movies whenever search, category, or genre changes (with 280ms debounce)
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      loadMovies(searchQuery, selectedCategory, selectedGenre, 1, controller.signal);
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, selectedCategory, selectedGenre, loadMovies]);

  // Handle retry
  const handleRetry = () => {
    loadMovies(searchQuery, selectedCategory, selectedGenre, page);
  };

  // Handle Load More
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(searchQuery, selectedCategory, selectedGenre, nextPage);
  };

  // Reset all filters & search
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Movies');
    setSelectedGenre('All Genres');
    setPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== 'All Movies' ||
    selectedGenre !== 'All Genres';

  return (
    <div className="movies-page">
      {/* 2026 Movies Banner & Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="year-highlight-badge">
              <span>📅 2026 Cinema Season</span>
            </div>
            <h1 className="page-title">2026 Movies Catalog</h1>
            <p className="page-subtitle">
              Browse recent and upcoming 2026 Tamil and Hollywood blockbusters with TMDB integration
            </p>
          </div>

          {/* API Connection Indicator */}
          <div className="api-status-badge" title="Data Source Mode">
            <span className={`status-dot ${isLiveApi ? 'live' : 'fallback'}`}></span>
            <span className="status-text">
              {isLiveApi ? 'Live TMDB API: Connected' : 'Mode: Local 2026 Demo Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Controls Section */}
      <div className="movies-filter-panel">
        {/* 1. Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchInputChange}
          searchInputRef={searchInputRef}
          placeholder="Search 2026 titles (e.g., Jailer 2, Jana Nayagan, Doomsday, Mario Galaxy)..."
        />

        {/* 2. Industry / Category Filter: Tamil vs Hollywood */}
        <CategoryFilter
          categories={availableCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />

        {/* 3. Genre Filter */}
        <GenreFilter
          genres={availableGenres}
          selectedGenre={selectedGenre}
          onSelectGenre={handleGenreChange}
        />
      </div>

      {/* Results Count & Active Filter Information */}
      <div className="results-meta-bar">
        <span className="results-count">
          {!loading && !error && (
            <>
              Showing <strong>{movies.length}</strong> {movies.length === 1 ? 'movie' : 'movies'}
              {selectedCategory !== 'All Movies' && ` in "${selectedCategory}"`}
              {selectedGenre !== 'All Genres' && ` • Genre: "${selectedGenre}"`}
              {searchQuery.trim() && ` • Matching: "${searchQuery.trim()}"`}
            </>
          )}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            className="clear-all-filters-btn"
            onClick={handleResetFilters}
          >
            Clear All Filters ✕
          </button>
        )}
      </div>

      {/* Movie Collection with Loading, Error & Empty States */}
      <MovieList
        movies={movies}
        isLoading={loading}
        error={error}
        onRetry={handleRetry}
        onReset={handleResetFilters}
      />

      {/* Load More Button for Live API Pagination */}
      {!loading && !error && isLiveApi && page < totalPages && (
        <div className="load-more-container">
          <button
            type="button"
            className="btn-secondary load-more-btn"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading More Movies...' : 'Load More 2026 Movies ↓'}
          </button>
        </div>
      )}

      {/* Persistent Selected Movie Sticky Bottom Bar */}
      {selectedMovie && (
        <div className="continue-bar">
          <div className="continue-bar-info">
            <div className="continue-movie-icon">🎟️</div>
            <div>
              <div className="continue-bar-label">Selected for Booking</div>
              <div className="continue-bar-title">
                {selectedMovie.title}
                <span className="continue-bar-genre">
                  ({selectedMovie.category || selectedMovie.language} • {selectedMovie.genre} {selectedMovie.year ? `• ${selectedMovie.year}` : ''})
                </span>
              </div>
            </div>
          </div>

          <div className="continue-bar-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSelectMovie(null)}
              title="Clear selection"
            >
              Clear Selection
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/booking')}
            >
              <span>Continue to Seat Booking</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoviesPage;
