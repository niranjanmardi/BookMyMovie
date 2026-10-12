import React from 'react';

/**
 * Reusable SearchBar component with clean icon and clear button
 *
 * @param {Object} props
 * @param {string} props.searchQuery - Current search text
 * @param {Function} props.onSearchChange - Callback when search text changes
 * @param {React.RefObject} [props.searchInputRef] - Optional ref to focus input
 * @param {string} [props.placeholder='Search movies by title...']
 */
function SearchBar({
  searchQuery = '',
  onSearchChange,
  searchInputRef,
  placeholder = 'Search movie titles (e.g. Dune, Batman, Avengers)...',
}) {
  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search movies by title"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search input"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
