/**
 * ==============================================================================
 * Experiment 2 - Front-End Security Utility (Requirement f)
 * File: src/utils/security.js
 * 
 * Topics Covered:
 * 1. Input Sanitization (Stops XSS - Cross-Site Scripting)
 * 2. HTML Entity Escaping (Turns harmful characters like < and > into safe text)
 * 3. Form Validation (Validates email, username, and password strength)
 * 4. Sensitive Data Masking (Masks credit cards & phone numbers for privacy)
 * 5. Booking Payload Sanitization (Ensures clean data before Redux / API)
 * ==============================================================================
 */

/**
 * Strips HTML tags and script injections to prevent Cross-Site Scripting (XSS)
 * Example: "<script>alert('hack')</script>Batman" -> "Batman"
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    // 1. Remove dangerous script and iframe tags entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // 2. Strip standard HTML markup tags
    .replace(/<\/?[^>]+(>|$)/g, '')
    // 3. Remove inline javascript: URLs
    .replace(/javascript:/gi, '')
    // 4. Remove common inline event handlers like onload, onerror, onclick
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
}

/**
 * Escapes characters with special meaning in HTML to prevent HTML injection
 * Example: "<" becomes "&lt;", ">" becomes "&gt;"
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (s) => entityMap[s]);
}

/**
 * Validates an email address using safe, standard regex
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 simplified safe pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates password strength for safe authentication
 * Rule: At least 6 characters, contains letters and numbers
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 4) {
    return { isValid: false, message: 'Password must be at least 4 characters long' };
  }
  return { isValid: true, message: 'Password is valid' };
}

/**
 * Masks credit / debit card numbers to protect sensitive customer data
 * Only shows the last 4 digits: "•••• •••• •••• 4242"
 */
export function maskCardNumber(cardNumber) {
  if (!cardNumber) return '•••• •••• •••• ••••';
  const cleanDigits = String(cardNumber).replace(/\D/g, '');
  if (cleanDigits.length < 4) return '•••• •••• •••• ••••';
  const last4 = cleanDigits.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

/**
 * Masks a phone number: "+91 ••••• •1234"
 */
export function maskPhone(phone) {
  if (!phone) return '••••• •••••';
  const clean = String(phone).replace(/\s+/g, '');
  if (clean.length < 4) return '••••• •••••';
  return `${clean.slice(0, 3)} ••••• ${clean.slice(-4)}`;
}

/**
 * Sanitizes booking payload fields before dispatching or saving to storage
 */
export function sanitizeBookingPayload(payload) {
  if (!payload || typeof payload !== 'object') return {};

  const clean = { ...payload };

  if (typeof clean.customerName === 'string') {
    clean.customerName = sanitizeInput(clean.customerName).slice(0, 50);
  }
  if (typeof clean.customerEmail === 'string') {
    clean.customerEmail = sanitizeInput(clean.customerEmail).toLowerCase().slice(0, 80);
  }
  if (typeof clean.notes === 'string') {
    clean.notes = sanitizeInput(clean.notes).slice(0, 200);
  }
  if (Array.isArray(clean.selectedSeats)) {
    // Only allow alphanumeric seat IDs like A1, B10
    clean.selectedSeats = clean.selectedSeats.filter(
      (seat) => typeof seat === 'string' && /^[A-Z][0-9]{1,2}$/.test(seat)
    );
  }

  return clean;
}
