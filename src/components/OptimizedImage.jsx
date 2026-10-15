import React, { useState } from 'react';

/**
 * ==============================================================================
 * Experiment 2 - Optimized Image Component (Requirement c)
 * File: src/components/OptimizedImage.jsx
 * 
 * Features:
 * 1. Native Lazy Loading: Uses loading="lazy" for off-screen images (saves bandwidth)
 * 2. Async Decoding: Uses decoding="async" to prevent blocking the main rendering thread
 * 3. Shimmer Skeleton: Displays a smooth placeholder skeleton while the image loads
 * 4. Graceful Fallback: Shows a clean cinema icon fallback if the image fails to load
 * 5. CLS Prevention: Preserves aspect-ratio to prevent layout shift
 * ==============================================================================
 */
function OptimizedImage({
  src,
  alt = 'Movie Poster',
  className = '',
  priority = false,
  fallbackText = '🎬',
  aspectRatio = '2/3',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // If no source provided, show the fallback directly
  if (!src || hasError) {
    return (
      <div
        className={`optimized-image-fallback ${className}`}
        style={{ aspectRatio }}
        role="img"
        aria-label={alt}
      >
        <span className="fallback-emoji">{fallbackText}</span>
        <span className="fallback-caption">{alt.slice(0, 20)}</span>
      </div>
    );
  }

  return (
    <div
      className={`optimized-image-wrapper ${className}`}
      style={{ aspectRatio, position: 'relative', overflow: 'hidden' }}
    >
      {/* Shimmer Skeleton Placeholder while loading */}
      {!isLoaded && (
        <div
          className="image-shimmer-skeleton"
          aria-hidden="true"
        />
      )}

      {/* Optimized Image element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
        {...props}
      />
    </div>
  );
}

export default React.memo(OptimizedImage);
