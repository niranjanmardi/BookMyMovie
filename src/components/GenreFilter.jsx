import React from 'react';

/**
 * GenreFilter component allowing users to filter movies by genre.
 * Includes "All Genres" and standard cinema genres.
 *
 * @param {Object} props
 * @param {string[]} props.genres - List of genre strings to display
 * @param {string} props.selectedGenre - Currently selected genre
 * @param {Function} props.onSelectGenre - Callback when a genre is selected
 */
function GenreFilter({
  genres = [],
  selectedGenre = 'All Genres',
  onSelectGenre,
}) {
  return (
    <div className="genre-filter-wrapper" role="toolbar" aria-label="Genre Filters">
      <span className="genre-filter-label">Filter Genre:</span>
      <div className="genre-pills-list">
        {genres.map((genre) => {
          const isSelected =
            selectedGenre.toLowerCase() === genre.toLowerCase() ||
            (selectedGenre === '' && (genre === 'All' || genre === 'All Genres'));

          return (
            <button
              key={genre}
              type="button"
              className={`genre-pill-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectGenre(genre)}
              aria-pressed={isSelected}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GenreFilter;
