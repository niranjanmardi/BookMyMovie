import React from 'react';

/**
 * BookMyMovieIcon Component
 *
 * Renders the custom cinema ticket & clapperboard brand icon for BookMyMovie.
 * Features an authentic movie ticket shape, clapperboard stripes, ticket notches,
 * and a glowing gold play reel.
 *
 * @param {Object} props
 * @param {number} [props.size=34] - Icon width/height in pixels
 * @param {string} [props.className=''] - Additional CSS class names
 */
function BookMyMovieIcon({ size = 34, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={`bmm-brand-icon ${className}`}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id="bmmGradientUnique" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E50914" />
          <stop offset="60%" stopColor="#B20710" />
          <stop offset="100%" stopColor="#700008" />
        </linearGradient>

        {/* Golden Accent Gradient */}
        <linearGradient id="goldGlowUnique" x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Glass Highlights */}
        <linearGradient id="ticketSheenUnique" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Drop Shadow */}
        <filter id="iconShadowUnique" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Outer Rounded Shield / Ticket Container with Shadow */}
      <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#bmmGradientUnique)" filter="url(#iconShadowUnique)" />

      {/* Border Ring */}
      <rect x="6.5" y="6.5" width="51" height="51" rx="13.5" stroke="#FFA3A8" strokeWidth="1.2" strokeOpacity="0.4" />

      {/* Subtle Ticket Cutouts (Notches on Left and Right) */}
      <circle cx="6" cy="32" r="5" fill="#0b0f19" />
      <circle cx="58" cy="32" r="5" fill="#0b0f19" />

      {/* Top Clapperboard Diagonal Stripes */}
      <g opacity="0.95">
        <path d="M12 12 H52 V21 H12 Z" fill="#18181B" rx="3" />
        {/* Stripes */}
        <path d="M15 21 L20 12 H24 L19 21 Z" fill="#F4F4F5" />
        <path d="M28 21 L33 12 H37 L32 21 Z" fill="#F4F4F5" />
        <path d="M41 21 L46 12 H50 L45 21 Z" fill="#F4F4F5" />
      </g>

      {/* Film Perforations / Dashed Divider */}
      <line x1="14" y1="32" x2="50" y2="32" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="2 3" />

      {/* Center Glowing Cinema Reel / Play Badge */}
      <circle cx="32" cy="43" r="10.5" fill="#121218" stroke="url(#goldGlowUnique)" strokeWidth="2" />

      {/* Play Arrow inside Reel */}
      <polygon points="29,38 38,43 29,48" fill="url(#goldGlowUnique)" />

      {/* Little Stars / Sparks */}
      <circle cx="18" cy="43" r="1.5" fill="#FDE047" opacity="0.8" />
      <circle cx="46" cy="43" r="1.5" fill="#FDE047" opacity="0.8" />

      {/* Glass Sheen Overlay Top Half */}
      <path d="M7 16 C7 10.477 11.477 6 17 6 H47 C52.523 6 57 10.477 57 16 V28 H7 Z" fill="url(#ticketSheenUnique)" />
    </svg>
  );
}

export default BookMyMovieIcon;
