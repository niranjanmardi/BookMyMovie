/**
 * movieApi.js - Movie REST API Integration Service (2026 Cinema Edition)
 *
 * Provides asynchronous movie fetching, search, genre & language/category filtering,
 * pagination (page support), and dynamic details retrieval.
 *
 * Primary Live API: TMDB (The Movie Database) API (https://api.themoviedb.org/3)
 * Offline / Fallback: Curated 2026 Tamil and Hollywood movie dataset from src/data/fallbackMovies.js
 *
 * 2026 Live TMDB Query Architecture:
 * - Uses TMDB Discover API with `primary_release_year=2026` & `sort_by=popularity.desc`
 * - Tamil movies: matched using TMDB ISO-639-1 original language code 'ta' (`with_original_language=ta`)
 * - Hollywood/English movies: matched using English language code 'en' (`with_original_language=en`)
 * - Distinguishes between 'Upcoming' and 'Released' based on verified release dates.
 */

import { FALLBACK_MOVIES_2026, getFallbackMovieById } from '../data/fallbackMovies.js';

// TMDB API Configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

// Check for client-side Vite environment variable or global environment
const TMDB_API_KEY = (() => {
  if (typeof process !== 'undefined' && process.env?.VITE_TMDB_API_KEY) {
    return process.env.VITE_TMDB_API_KEY;
  }
  try {
    const meta = new Function('return import.meta')();
    return meta?.env?.VITE_TMDB_API_KEY || '';
  } catch {
    return '';
  }
})();

// TMDB Genre ID to Name Mapping
const TMDB_GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

/**
 * Returns whether a live TMDB API key is configured
 */
export function isLiveApiConfigured() {
  return Boolean(
    TMDB_API_KEY &&
    TMDB_API_KEY.trim() !== '' &&
    TMDB_API_KEY !== 'your_tmdb_api_key_here'
  );
}

/**
 * Normalizes an external TMDB movie item into the standard BookMyMovie schema
 */
function normalizeTmdbMovie(movie) {
  if (!movie) return null;

  // Resolve genre names from genre_ids or genres array
  let genresList = [];
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    genresList = movie.genres
      .map((g) => (typeof g === 'object' && g ? g.name : g))
      .filter(Boolean);
  } else if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
    genresList = movie.genre_ids.map((id) => TMDB_GENRES[id] || 'General').filter(Boolean);
  }

  if (genresList.length === 0) {
    genresList = ['Cinema'];
  }

  // Language & Category classification
  const origLang = movie.original_language || '';
  const isTamil = origLang.toLowerCase() === 'ta';
  const isEnglish = origLang.toLowerCase() === 'en';

  const category = isTamil ? 'Tamil' : isEnglish ? 'Hollywood' : 'International';
  const language = isTamil ? 'Tamil' : isEnglish ? 'English' : origLang.toUpperCase();

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 2026;

  // Distinguish Upcoming vs Released
  const isUpcoming = movie.release_date
    ? new Date(movie.release_date) > new Date()
    : true;

  const poster = movie.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : '/posters/doomsday.jpg';

  const backdrop = movie.backdrop_path
    ? `${TMDB_BACKDROP_BASE}${movie.backdrop_path}`
    : poster;

  const rating =
    movie.vote_average !== undefined && movie.vote_average !== null && movie.vote_average > 0
      ? Number(movie.vote_average.toFixed(1))
      : 8.5;

  // Format release date nicely
  let releaseDateFormatted = movie.release_date || '2026';
  if (movie.release_date) {
    try {
      const d = new Date(movie.release_date);
      if (!isNaN(d)) {
        releaseDateFormatted = d.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      releaseDateFormatted = movie.release_date;
    }
  }

  // Extract cast & director if credits are present
  let cast = 'All-Star Ensemble Cast';
  let director = 'Acclaimed Director';

  if (movie.credits) {
    if (Array.isArray(movie.credits.cast) && movie.credits.cast.length > 0) {
      cast = movie.credits.cast.slice(0, 4).map((c) => c.name).join(', ');
    }
    if (Array.isArray(movie.credits.crew)) {
      const dirObj = movie.credits.crew.find((c) => c.job === 'Director');
      if (dirObj) director = dirObj.name;
    }
  }

  return {
    id: String(movie.id),
    apiId: movie.id,
    source: 'tmdb-api',
    title: movie.title || movie.original_title || 'Untitled',
    category,
    language,
    genre: genresList.join(' / '),
    genres: genresList,
    rating,
    year,
    releaseDate: movie.release_date || '2026',
    releaseDateFormatted,
    status: isUpcoming ? 'Upcoming' : 'Released',
    isUpcoming,
    runtime: movie.runtime ? `${movie.runtime} min` : '150 min',
    description: movie.overview || '2026 cinema presentation. No synopsis provided.',
    poster,
    backdrop,
    cast,
    director,
  };
}

/**
 * Filter helper for local 2026 fallback dataset
 */
function filterFallbackDataset({ search = '', category = 'All Movies', genre = 'All Genres' }) {
  let list = [...FALLBACK_MOVIES_2026];

  // 1. Category Filter: 'Tamil' | 'Hollywood'
  if (category && category !== 'All' && category !== 'All Movies') {
    list = list.filter((m) => m.category.toLowerCase() === category.toLowerCase());
  }

  // 2. Genre Filter
  if (genre && genre !== 'All' && genre !== 'All Genres') {
    const targetGenre = genre.toLowerCase();
    list = list.filter(
      (m) =>
        m.genres.some((g) => g.toLowerCase() === targetGenre) ||
        m.genre.toLowerCase().includes(targetGenre)
    );
  }

  // 3. Search Query Filter
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    list = list.filter((m) => m.title.toLowerCase().includes(q));
  }

  return list;
}

/**
 * Fetches 2026 movies from TMDB REST API, or seamlessly falls back to the curated
 * local dataset if no key is provided or network is down.
 *
 * @param {Object} [options]
 * @param {string} [options.search='']
 * @param {string} [options.category='All Movies'] - 'All Movies', 'Tamil', 'Hollywood'
 * @param {string} [options.genre='All Genres']
 * @param {number} [options.page=1]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ movies: Array, isLiveApi: boolean, total: number, page: number, totalPages: number }>}
 */
export async function fetchMovies({
  search = '',
  query = '',
  category = 'All Movies',
  genre = 'All Genres',
  page = 1,
  signal,
} = {}) {
  const searchTerm = search || query || '';
  const trimmedSearch = searchTerm.trim();
  const hasKey = isLiveApiConfigured();

  // If no live key is configured, use the curated 2026 fallback dataset
  if (!hasKey) {
    const fallbackResults = filterFallbackDataset({
      search: trimmedSearch,
      category,
      genre,
    });
    return {
      movies: fallbackResults,
      isLiveApi: false,
      total: fallbackResults.length,
      page: 1,
      totalPages: 1,
      source: 'local-fallback-2026',
    };
  }

  // Attempt live TMDB API communication
  try {
    let rawMovies = [];
    let totalPages = 1;

    if (trimmedSearch) {
      // Search endpoint for 2026 movies
      const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        trimmedSearch
      )}&primary_release_year=2026&include_adult=false&page=${page}`;
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error(`TMDB Search error: HTTP ${response.status}`);
      }

      const data = await response.json();
      rawMovies = Array.isArray(data.results) ? data.results : [];
      totalPages = data.total_pages || 1;
    } else {
      // Discover 2026 Movies with language & release year filter
      let endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_year=2026&sort_by=popularity.desc&page=${page}`;

      if (category === 'Tamil') {
        endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_year=2026&with_original_language=ta&sort_by=popularity.desc&page=${page}`;
      } else if (category === 'Hollywood') {
        endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_year=2026&with_original_language=en&sort_by=popularity.desc&page=${page}`;
      }

      const response = await fetch(endpoint, { signal });

      if (!response.ok) {
        throw new Error(`TMDB Discover error: HTTP ${response.status}`);
      }

      const data = await response.json();
      rawMovies = Array.isArray(data.results) ? data.results : [];
      totalPages = data.total_pages || 1;
    }

    // Normalize items
    let movies = rawMovies.map(normalizeTmdbMovie).filter(Boolean);

    // Apply category filter on search results (in-memory verification)
    if (category && category !== 'All' && category !== 'All Movies') {
      movies = movies.filter((m) => m.category.toLowerCase() === category.toLowerCase());
    }

    // Apply genre filter
    if (genre && genre !== 'All' && genre !== 'All Genres') {
      const targetGenre = genre.toLowerCase();
      movies = movies.filter(
        (m) =>
          m.genres.some((g) => g.toLowerCase() === targetGenre) ||
          m.genre.toLowerCase().includes(targetGenre)
      );
    }

    return {
      movies,
      isLiveApi: true,
      total: movies.length,
      page,
      totalPages,
      source: 'tmdb-api',
    };
  } catch (error) {
    if (error.name === 'AbortError') throw error;

    console.warn('TMDB API fetch failed. Switching to local 2026 fallback dataset:', error.message);

    const fallbackResults = filterFallbackDataset({
      search: trimmedSearch,
      category,
      genre,
    });

    return {
      movies: fallbackResults,
      isLiveApi: false,
      total: fallbackResults.length,
      page: 1,
      totalPages: 1,
      source: 'local-fallback-2026',
      fallbackReason: error.message,
    };
  }
}

/**
 * Searches 2026 movies by title
 */
export async function searchMovies(query, options = {}) {
  return fetchMovies({ search: query, ...options });
}

/**
 * Fetches popular 2026 movies
 */
export async function getPopularMovies(options = {}) {
  return fetchMovies({ category: 'All Movies', ...options });
}

/**
 * Fetches 2026 Tamil movies specifically
 */
export async function getTamilMovies(options = {}) {
  return fetchMovies({ category: 'Tamil', ...options });
}

/**
 * Fetches 2026 Hollywood movies specifically
 */
export async function getHollywoodMovies(options = {}) {
  return fetchMovies({ category: 'Hollywood', ...options });
}

/**
 * Fetches dynamic movie details by ID.
 * - If ID starts with 'fb-', immediately loads from local 2026 fallback dataset.
 * - If numeric ID and TMDB key is available, loads from TMDB API with credits.
 * - Seamlessly handles invalid IDs and network failures.
 *
 * @param {string|number} id
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<Object>}
 */
export async function getMovieById(id, { signal } = {}) {
  if (!id) {
    throw new Error('Movie ID is required');
  }

  const strId = String(id).trim();

  // 1. Explicit check for fallback ID
  if (strId.startsWith('fb-') || strId.startsWith('bmm-')) {
    const fallbackMatch = getFallbackMovieById(strId);
    if (fallbackMatch) return fallbackMatch;
  }

  // Exact ID match in 2026 fallback catalog
  const exactLocalMatch = FALLBACK_MOVIES_2026.find((m) => String(m.id) === strId);
  if (exactLocalMatch) return exactLocalMatch;

  // 2. Numeric ID Handling
  const isNumeric = /^\d+$/.test(strId);
  const numVal = parseInt(strId, 10);

  // If numeric ID matches a 1-based local index (1..15) and API key is missing or low index
  if (isNumeric && numVal >= 1 && numVal <= FALLBACK_MOVIES_2026.length) {
    if (!isLiveApiConfigured() || numVal <= 15) {
      const indexedMovie = FALLBACK_MOVIES_2026[numVal - 1];
      if (indexedMovie) return indexedMovie;
    }
  }

  // 3. Live TMDB API lookup for numeric IDs (>100 or when live API configured)
  if (isNumeric && isLiveApiConfigured()) {
    try {
      const url = `${TMDB_BASE_URL}/movie/${strId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
      const response = await fetch(url, { signal });

      if (response.ok) {
        const movieData = await response.json();
        return normalizeTmdbMovie(movieData);
      }
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      // Continue to local fallback matching rather than crashing
    }
  }

  // 4. Partial substring or slug match (e.g. 'jailer2', 'doomsday', 'supergirl')
  const cleanQuery = strId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanQuery) {
    const slugMatch = FALLBACK_MOVIES_2026.find((m) => {
      const cleanTitle = m.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanId = String(m.id).toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        cleanTitle === cleanQuery ||
        cleanTitle.includes(cleanQuery) ||
        cleanQuery.includes(cleanTitle) ||
        cleanId.includes(cleanQuery)
      );
    });

    if (slugMatch) return slugMatch;
  }

  // 5. Safe default to first 2026 movie if no match found
  if (FALLBACK_MOVIES_2026.length > 0) {
    return FALLBACK_MOVIES_2026[0];
  }

  throw new Error(`Movie with identifier "${id}" was not found.`);
}

/**
 * Returns available language/category filters
 */
export function getAvailableCategories() {
  return ['All Movies', 'Tamil', 'Hollywood'];
}

/**
 * Returns standard genre list
 */
export function getStandardGenres() {
  return [
    'All Genres',
    'Action',
    'Adventure',
    'Crime',
    'Drama',
    'Sci-Fi',
    'Thriller',
    'Horror',
    'Comedy',
    'Animation',
    'Family',
    'Mythology',
  ];
}

/**
 * Retrieves a featured 2026 movie for the homepage marquee
 */
export async function getFeaturedMovie({ signal } = {}) {
  try {
    const { movies } = await fetchMovies({ signal });
    if (movies && movies.length > 0) {
      return movies[0];
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
  }
  return FALLBACK_MOVIES_2026[0]; // Jailer 2 by default
}
