import React, { useMemo } from 'react';
import useBooking from '../hooks/useBooking';
import { COIMBATORE_THEATRES, getCoimbatoreAreas } from '../data/theatres.js';

function TheatreList() {
  const {
    selectedTheatre,
    handleSelectTheatre,
    theatreAreaFilter,
    setTheatreAreaFilter,
    theatreSearchQuery,
    setTheatreSearchQuery,
  } = useBooking();

  const areas = useMemo(() => getCoimbatoreAreas(), []);

  // Filter theatres by search term and selected area
  const filteredTheatres = useMemo(() => {
    return COIMBATORE_THEATRES.filter((theatre) => {
      const matchesArea =
        theatreAreaFilter === 'All Areas' || theatre.area.toLowerCase() === theatreAreaFilter.toLowerCase();

      const q = theatreSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        theatre.name.toLowerCase().includes(q) ||
        theatre.area.toLowerCase().includes(q) ||
        theatre.address.toLowerCase().includes(q) ||
        theatre.landmark.toLowerCase().includes(q);

      return matchesArea && matchesSearch;
    });
  }, [theatreAreaFilter, theatreSearchQuery]);

  return (
    <div className="theatre-selection-container">
      {/* ── Filter & Search Toolbar ── */}
      <div className="theatre-filter-toolbar">
        {/* Search input */}
        <div className="theatre-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="theatre-search-input"
            value={theatreSearchQuery}
            onChange={(e) => setTheatreSearchQuery(e.target.value)}
            placeholder="Search Coimbatore theatres by name, area, or road..."
            aria-label="Search Coimbatore theatres"
          />
          {theatreSearchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setTheatreSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Area Filter Pills */}
        <div className="theatre-area-pills" role="tablist" aria-label="Filter by Coimbatore area">
          {areas.map((area) => {
            const isActive = theatreAreaFilter === area;
            return (
              <button
                key={area}
                type="button"
                className={`area-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => setTheatreAreaFilter(area)}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Coimbatore Theatres Grid (10 Venues) ── */}
      {filteredTheatres.length === 0 ? (
        <div className="theatres-empty-state">
          <span className="empty-icon">🏛️</span>
          <p>No Coimbatore theatres found matching "{theatreSearchQuery}".</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setTheatreSearchQuery('');
              setTheatreAreaFilter('All Areas');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="theatres-grid">
          {filteredTheatres.map((theatre) => {
            const isSelected = selectedTheatre?.id === theatre.id;
            return (
              <div
                key={theatre.id}
                onClick={() => handleSelectTheatre(theatre)}
                className={`theatre-card ${isSelected ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectTheatre(theatre);
                  }
                }}
                aria-pressed={isSelected}
              >
                {/* Header: Name + Area Pill */}
                <div className="theatre-card-top">
                  <div className="theatre-name">{theatre.name}</div>
                  <span className="theatre-area-badge">{theatre.area}</span>
                </div>

                {/* Full Address */}
                <div className="theatre-address-text">
                  📍 {theatre.address}
                </div>

                {/* Landmark Note */}
                {theatre.landmark && (
                  <div className="theatre-landmark-note">
                    Near: {theatre.landmark}
                  </div>
                )}

                {/* Screens & Formats */}
                <div className="theatre-specs-row">
                  <span className="theatre-screen-spec">{theatre.screens}</span>
                  {theatre.formats && theatre.formats.slice(0, 2).map((fmt) => (
                    <span key={fmt} className="theatre-format-badge">
                      {fmt}
                    </span>
                  ))}
                </div>

                {/* Active Selection Indicator */}
                <div className="theatre-card-footer">
                  {isSelected ? (
                    <div className="selected-theatre-indicator">
                      ✓ Selected Venue
                    </div>
                  ) : (
                    <span className="select-theatre-prompt">Click to Select</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TheatreList;
