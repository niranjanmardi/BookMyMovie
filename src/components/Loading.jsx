import React from 'react';

/**
 * Loading component supporting card skeletons, details skeleton, and a clean cinema spinner.
 *
 * @param {Object} props
 * @param {'skeleton'|'details'|'spinner'} [props.type='skeleton']
 * @param {number} [props.count=8] - Number of skeleton cards to display
 * @param {string} [props.message='Loading cinema titles...']
 */
function Loading({ type = 'skeleton', count = 8, message = 'Loading cinema titles...' }) {
  if (type === 'spinner') {
    return (
      <div className="loading-spinner-container" role="status" aria-live="polite">
        <div className="cinema-spinner" aria-hidden="true"></div>
        <p className="loading-text">{message}</p>
      </div>
    );
  }

  if (type === 'details') {
    return (
      <div className="movie-details-skeleton" role="status" aria-live="polite">
        <div className="skeleton-backdrop"></div>
        <div className="skeleton-details-content">
          <div className="skeleton-poster"></div>
          <div className="skeleton-info">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-pills">
              <div className="skeleton-pill"></div>
              <div className="skeleton-pill"></div>
              <div className="skeleton-pill"></div>
            </div>
            <div className="skeleton-line skeleton-meta"></div>
            <div className="skeleton-line skeleton-desc"></div>
            <div className="skeleton-line skeleton-desc" style={{ width: '80%' }}></div>
            <div className="skeleton-line skeleton-desc" style={{ width: '60%' }}></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Grid of MovieCard skeletons
  return (
    <div className="movies-grid-skeleton" role="status" aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="movie-card-skeleton">
          <div className="skeleton-poster-box"></div>
          <div className="skeleton-card-body">
            <div className="skeleton-line skeleton-card-title"></div>
            <div className="skeleton-line skeleton-card-subtitle"></div>
            <div className="skeleton-line skeleton-card-btn"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Loading;
