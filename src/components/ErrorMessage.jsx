import React from 'react';

/**
 * Reusable ErrorMessage component with actionable Retry button
 *
 * @param {Object} props
 * @param {string} props.title - Error heading
 * @param {string} props.message - Error explanation / details
 * @param {Function} [props.onRetry] - Callback invoked when user clicks Retry
 * @param {string} [props.retryText='Try Again']
 */
function ErrorMessage({
  title = 'Unable to Load Content',
  message = 'An unexpected error occurred while communicating with the movie service.',
  onRetry,
  retryText = 'Try Again',
}) {
  return (
    <div className="error-card-container" role="alert">
      <div className="error-icon" aria-hidden="true">
        ⚠️
      </div>
      <h3 className="error-title">{title}</h3>
      <p className="error-message-text">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-retry"
          aria-label={retryText}
        >
          <span className="retry-symbol">↻</span> {retryText}
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
