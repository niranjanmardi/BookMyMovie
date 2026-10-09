import React from 'react';

function SearchBar({ searchQuery, onSearchChange, searchInputRef }) {
  return (
    <div className="search-wrapper">
      <input
        ref={searchInputRef}
        type="text"
        className="search-input-box"
        placeholder="🔍  Search movie by title..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchQuery && (
        <button
          className="btn-secondary"
          onClick={() => onSearchChange('')}
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default SearchBar;
