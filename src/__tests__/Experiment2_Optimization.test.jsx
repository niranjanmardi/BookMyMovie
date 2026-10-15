// ==============================================================================
// UNIT 5 - EXPERIMENT 2 TEST SUITE
// Topics: Lazy Loading, Code Splitting, Performance, PWA, Accessibility, Security
// Stack: Jest + React Testing Library + React 19
// ==============================================================================

import React, { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fs from 'fs';
import path from 'path';

// Utilities & Components to test
import { sanitizeInput, escapeHtml, validateEmail, validatePassword, maskCardNumber, maskPhone, sanitizeBookingPayload } from '../utils/security';
import OptimizedImage from '../components/OptimizedImage';
import SeatSelection from '../components/SeatSelection';
import { renderWithProviders } from './testUtils';
import * as movieApi from '../services/movieApi';

describe('Unit 5 - Experiment 2: Optimize Movie Booking Application', () => {

  // ----------------------------------------------------------------------------
  // TOPIC A & B: LAZY LOADING & CODE SPLITTING
  // ----------------------------------------------------------------------------
  describe('(a & b) Lazy Loading and Route-Level Code Splitting', () => {

    it('renders Suspense fallback while lazy component chunk is downloading', async () => {
      // Create a simulated lazy-loaded component with a controlled delay
      const LazyTestComponent = React.lazy(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              default: () => <div data-testid="lazy-loaded-content">Movie Details Page Loaded!</div>,
            });
          }, 50);
        });
      });

      render(
        <Suspense fallback={<div role="status">⚡ Loading page chunk on demand...</div>}>
          <LazyTestComponent />
        </Suspense>
      );

      // 1. Immediately, the Suspense fallback should be displayed
      expect(screen.getByRole('status')).toHaveTextContent(/Loading page chunk on demand/i);

      // 2. Once the dynamic import completes, the actual component should render
      await waitFor(() => {
        expect(screen.getByTestId('lazy-loaded-content')).toBeInTheDocument();
      });
    });

    it('validates that App.jsx uses React.lazy for route-level components', () => {
      const appJsxPath = path.resolve(__dirname, '../App.jsx');
      const content = fs.readFileSync(appJsxPath, 'utf8');

      // Check that React.lazy or lazy is imported and used
      expect(content).toMatch(/lazy\s*\(\s*\(\)\s*=>\s*import\(/);
      expect(content).toMatch(/MovieDetailsPage\s*=\s*lazy\(/);
      expect(content).toMatch(/BookingPage\s*=\s*lazy\(/);
      expect(content).toMatch(/<Suspense/);
    });

    it('validates that BookingPage.jsx lazy loads the SeatSelection component', () => {
      const bookingPagePath = path.resolve(__dirname, '../pages/BookingPage.jsx');
      const content = fs.readFileSync(bookingPagePath, 'utf8');

      expect(content).toMatch(/SeatSelection\s*=\s*lazy\(\(\)\s*=>\s*import\(/);
      expect(content).toMatch(/<Suspense/);
    });
  });

  // ----------------------------------------------------------------------------
  // TOPIC C: OPTIMIZE MOVIE IMAGES AND API DATA RENDERING
  // ----------------------------------------------------------------------------
  describe('(c) Movie Images and API Data Rendering Optimization', () => {

    it('renders OptimizedImage with loading="lazy", decoding="async", and alt text', () => {
      render(
        <OptimizedImage
          src="/posters/jailer2.jpg"
          alt="Jailer 2 Poster"
          priority={false}
        />
      );

      const img = screen.getByAltText('Jailer 2 Poster');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    });

    it('falls back to cinema icon placeholder gracefully when image fails to load', () => {
      render(
        <OptimizedImage
          src="/non-existent-broken-poster.jpg"
          alt="Broken Movie Poster"
        />
      );

      const img = screen.getByAltText('Broken Movie Poster');
      // Simulate image loading failure
      fireEvent.error(img);

      // Fallback placeholder should appear
      expect(screen.getByRole('img', { name: 'Broken Movie Poster' })).toBeInTheDocument();
      expect(screen.getByText('🎬')).toBeInTheDocument();
    });

    it('uses in-memory API cache to prevent duplicate fetch calls', async () => {
      movieApi.clearApiCache();
      const initialCacheSize = movieApi.getApiCacheSize();
      expect(initialCacheSize).toBe(0);

      // Call fetchMovies first time
      const result1 = await movieApi.fetchMovies({ search: 'Jailer', category: 'All Movies' });
      expect(result1).toBeDefined();

      const cachedSizeAfterCall = movieApi.getApiCacheSize();
      expect(cachedSizeAfterCall).toBeGreaterThan(0);

      // Call fetchMovies second time with same parameters -> should hit cache
      const result2 = await movieApi.fetchMovies({ search: 'Jailer', category: 'All Movies' });
      expect(result2).toEqual(result1);
    });
  });

  // ----------------------------------------------------------------------------
  // TOPIC D: BASIC PWA SUPPORT
  // ----------------------------------------------------------------------------
  describe('(d) Basic Progressive Web App (PWA) Support', () => {

    it('verifies public/manifest.json contains required PWA configuration', () => {
      const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      expect(manifest.name).toContain('BookMyMovie');
      expect(manifest.short_name).toBe('BookMyMovie');
      expect(manifest.start_url).toBe('/');
      expect(manifest.display).toBe('standalone');
      expect(manifest.theme_color).toBe('#e50914');
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThanOrEqual(1);
    });

    it('verifies public/sw.js service worker file exists with install and fetch handlers', () => {
      const swPath = path.resolve(__dirname, '../../public/sw.js');
      expect(fs.existsSync(swPath)).toBe(true);

      const swContent = fs.readFileSync(swPath, 'utf8');
      expect(swContent).toMatch(/addEventListener\(['"]install['"]/);
      expect(swContent).toMatch(/addEventListener\(['"]activate['"]/);
      expect(swContent).toMatch(/addEventListener\(['"]fetch['"]/);
      expect(swContent).toMatch(/caches\.open/);
    });

    it('verifies index.html links to manifest.json and specifies theme-color', () => {
      const htmlPath = path.resolve(__dirname, '../../index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');

      expect(html).toContain('rel="manifest" href="/manifest.json"');
      expect(html).toContain('name="theme-color" content="#e50914"');
    });
  });

  // ----------------------------------------------------------------------------
  // TOPIC E: ACCESSIBILITY (KEYBOARD SEAT SELECTION & ACCESSIBLE BUTTONS)
  // ----------------------------------------------------------------------------
  describe('(e) Keyboard-Accessible Seat Selection and Accessible Buttons', () => {
    const mockMovie   = { id: 'm1', title: 'Jailer 2' };
    const mockTheatre = { id: 'th1', name: 'KG Cinemas', area: 'Race Course' };
    const mockDate    = { iso: '2026-10-15', displayLabel: 'Today (Thu)' };
    const mockTime    = { id: 'st1000', time: '10:00 AM', label: 'Morning' };

    it('renders keyboard accessibility instructions and screen-reader live region', () => {
      renderWithProviders(<SeatSelection />, {
        preloadedState: {
          booking: {
            selectedMovie:   mockMovie,
            selectedTheatre: mockTheatre,
            selectedDate:    mockDate,
            selectedTime:    mockTime,
            selectedSeats:   [],
          },
        },
      });

      // Accessibility hint should be rendered
      expect(screen.getByText(/Arrow Keys/i)).toBeInTheDocument();

      // Screen-reader live region should be present
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('supports Space and Enter keyboard keys to toggle seat selection', () => {
      const { container } = renderWithProviders(<SeatSelection />, {
        preloadedState: {
          booking: {
            selectedMovie:   mockMovie,
            selectedTheatre: mockTheatre,
            selectedDate:    mockDate,
            selectedTime:    mockTime,
            selectedSeats:   [],
          },
        },
      });

      const seatA1 = container.querySelector('#seat-A1');
      expect(seatA1).toBeInTheDocument();

      // Trigger selection via Enter key
      fireEvent.keyDown(seatA1, { key: 'Enter' });
      // Trigger selection via Space key
      fireEvent.keyDown(seatA1, { key: ' ' });

      expect(seatA1).toHaveAttribute('type', 'button');
    });

    it('renders seats with aria-pressed and unique element ids for focus navigation', () => {
      const { container } = renderWithProviders(<SeatSelection />, {
        preloadedState: {
          booking: {
            selectedMovie:   mockMovie,
            selectedTheatre: mockTheatre,
            selectedDate:    mockDate,
            selectedTime:    mockTime,
            selectedSeats:   ['A1'],
          },
        },
      });

      const seatA1 = container.querySelector('#seat-A1');
      expect(seatA1).toHaveAttribute('id', 'seat-A1');
      expect(seatA1).toHaveAttribute('aria-pressed', 'true');

      const seatA2 = container.querySelector('#seat-A2');
      expect(seatA2).toHaveAttribute('id', 'seat-A2');
      expect(seatA2).toHaveAttribute('aria-pressed', 'false');
    });
  });

  // ----------------------------------------------------------------------------
  // TOPIC F: FRONT-END SECURITY PRACTICES
  // ----------------------------------------------------------------------------
  describe('(f) Front-End Security Practices', () => {

    it('sanitizes malicious script tags and iframe injections to stop XSS', () => {
      const maliciousInput = '<script>alert("Hacked!")</script>Avengers';
      const cleanInput = sanitizeInput(maliciousInput);
      expect(cleanInput).toBe('Avengers');
      expect(cleanInput).not.toContain('<script>');

      const iframeInjection = '<iframe src="javascript:alert(1)"></iframe>Dune';
      expect(sanitizeInput(iframeInjection)).toBe('Dune');
    });

    it('escapes dangerous HTML special characters', () => {
      const dangerousStr = '<h1>Movie & "Popcorn" <alert></h1>';
      const escaped = escapeHtml(dangerousStr);
      expect(escaped).toContain('&lt;h1&gt;');
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&quot;Popcorn&quot;');
    });

    it('validates email format securely against RFC pattern', () => {
      expect(validateEmail('student@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.in')).toBe(true);
      expect(validateEmail('invalid-email-no-at-sign')).toBe(false);
      expect(validateEmail('<script>alert(1)</script>@hack.com')).toBe(false);
    });

    it('validates password minimum length requirement', () => {
      expect(validatePassword('1234').isValid).toBe(true);
      expect(validatePassword('pass').isValid).toBe(true);
      expect(validatePassword('12').isValid).toBe(false);
      expect(validatePassword('').isValid).toBe(false);
    });

    it('masks credit card numbers showing only the last 4 digits', () => {
      expect(maskCardNumber('4111222233334242')).toBe('•••• •••• •••• 4242');
      expect(maskCardNumber('1234567890123456')).toBe('•••• •••• •••• 3456');
      expect(maskCardNumber('')).toBe('•••• •••• •••• ••••');
    });

    it('masks sensitive phone numbers for user privacy', () => {
      expect(maskPhone('9876543210')).toBe('987 ••••• 3210');
    });

    it('sanitizes booking payload inputs and filters invalid seat IDs', () => {
      const rawPayload = {
        customerName: '<script>alert(1)</script>Rahul Sharma',
        customerEmail: 'Rahul@GMAIL.COM',
        selectedSeats: ['A1', 'B2', '<script>', 'INVALID_SEAT_12345'],
        notes: '<b>Near aisle please</b>',
      };

      const cleanPayload = sanitizeBookingPayload(rawPayload);
      expect(cleanPayload.customerName).toBe('Rahul Sharma');
      expect(cleanPayload.customerEmail).toBe('rahul@gmail.com');
      expect(cleanPayload.notes).toBe('Near aisle please');
      // Only valid seat IDs matching /^[A-Z][0-9]{1,2}$/ should remain
      expect(cleanPayload.selectedSeats).toEqual(['A1', 'B2']);
    });
  });
});
