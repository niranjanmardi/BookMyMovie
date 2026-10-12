import React from 'react';

/**
 * Reusable EmptyState component for 0 search / filter results
 *
 * @param {Object} props
 * @param {string} [props.title='No Movies Found']
 * @param {string} [props.message='No movies matched your current search or genre criteria.']
 * @param {Function} [props.onReset] - Optional callback to reset filters/search
 * @param {string} [props.resetText='Reset All Filters']
 */
function EmptyState({
  title = 'No Movies Found',
  message = 'We could not find any titles matching your search or selected genre filter.',
  onReset,
  resetText = 'Clear Filters & Search',
}) {
  return (
    <div className="empty-state-card" role="status">
      <div className="empty-state-icon" aria-hidden="true">
        🎬
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{message}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary empty-reset-btn"
        >
          {resetText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
