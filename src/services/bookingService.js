/**
 * bookingService.js - Booking & Seat Availability Management Service
 *
 * Responsibilities:
 * 1. Generates deterministic initial pre-booked seats for every show
 *    (combination of movie, theatre, date, and showtime) so they differ across shows
 *    without recalculating randomly on every React render.
 * 2. Merges initial pre-booked seats with user-confirmed bookings in localStorage.
 * 3. Persists new bookings with unique reference codes (e.g. BMM-CBE-7A9B2C).
 * 4. Provides history retrieval for "My Bookings" page.
 */

import { ROW_CONFIG, calculateSeatsPriceBreakdown } from '../data/seatLayout.js';
import { syncCloudBookedSeats, saveCloudBookingRecord } from './cloudSyncService.js';
import { getUser } from './axiosInstance.js';

const STORAGE_KEY_CONFIRMED = 'bmm_confirmed_show_seats';
const STORAGE_KEY_BOOKINGS = 'bmm_my_bookings_list';
const STORAGE_KEY_LEGACY = 'bm_last_booking';

/**
 * Builds a unique identifier for a specific show screening
 */
export function buildShowKey(movieId, theatreId, dateIso, showtimeId) {
  const m = movieId ? String(movieId).replace(/[^a-zA-Z0-9]/g, '') : 'anyMovie';
  const t = theatreId ? String(theatreId).replace(/[^a-zA-Z0-9]/g, '') : 'anyTheatre';
  const d = dateIso ? String(dateIso).replace(/[^a-zA-Z0-9]/g, '') : 'today';
  const s = showtimeId ? String(showtimeId).replace(/[^a-zA-Z0-9]/g, '') : 'st1000';
  return `${m}_${t}_${d}_${s}`;
}

/**
 * Deterministic hash function to generate consistent pre-booked seats
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates initial pre-booked seats deterministically based on the show key
 * Approximately 20-35 seats out of 110 are marked pre-booked.
 */
export function getInitialPreBookedSeats(showKey) {
  const seed = hashString(showKey || 'default_cbe_show');
  const bookedSet = new Set();

  // Pick 24 to 34 seats based on the seed
  const countToBook = 22 + (seed % 12);

  let currentHash = seed;
  let attempts = 0;

  while (bookedSet.size < countToBook && attempts < 200) {
    attempts++;
    currentHash = (currentHash * 9301 + 49297) % 233280;

    const rowIndex = currentHash % ROW_CONFIG.length;
    const rowObj = ROW_CONFIG[rowIndex];

    currentHash = (currentHash * 9301 + 49297) % 233280;
    const seatNum = 1 + (currentHash % rowObj.seatsCount);

    const seatId = `${rowObj.row}${seatNum}`;
    bookedSet.add(seatId);
  }

  // Ensure example requirements seats are booked if seed aligns
  if (bookedSet.size < 20) {
    ['A3', 'A4', 'B2', 'B5', 'C4', 'D1', 'D7', 'E3', 'F2', 'F6', 'G5', 'H1', 'I4', 'J8'].forEach((s) =>
      bookedSet.add(s)
    );
  }

  return Array.from(bookedSet);
}

/**
 * Retrieves user confirmed booked seats from localStorage
 */
function getConfirmedBookingsMap() {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY_CONFIRMED);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Saves user confirmed booked seats to localStorage
 */
function saveConfirmedBookingsMap(map) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_CONFIRMED, JSON.stringify(map));
  } catch (err) {
    console.warn('Failed saving confirmed bookings to storage:', err);
  }
}

/**
 * Returns all currently unavailable (pre-booked + confirmed) seats for a show
 */
export function getBookedSeatsForShow(showKey) {
  const initial = getInitialPreBookedSeats(showKey);
  const confirmedMap = getConfirmedBookingsMap();
  const userBooked = confirmedMap[showKey] || [];

  return Array.from(new Set([...initial, ...userBooked]));
}

/**
 * Generates a unique Coimbatore booking reference code (e.g. BMM-CBE-9A4F2C)
 */
export function generateBookingReference() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let ref = 'BMM-CBE-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

/**
 * Persists a new booking:
 * 1. Generates unique reference code
 * 2. Marks selected seats as confirmed for the showKey
 * 3. Adds record to My Bookings list in localStorage
 * 4. Updates legacy single-booking key for backward compatibility
 */
export function confirmNewBooking(bookingData) {
  const {
    movie,
    theatre,
    date,
    showtime,
    seats = [],
    username: customUsername,
  } = bookingData || {};

  if (!movie || !theatre || !date || !showtime || seats.length === 0) {
    throw new Error('Incomplete booking details. Movie, theatre, date, showtime, and seats are required.');
  }

  const showKey = buildShowKey(movie.id, theatre.id, date.iso, showtime.id);
  const currentBooked = getBookedSeatsForShow(showKey);

  // Validate no selected seat has been double-booked
  const conflicts = seats.filter((s) => currentBooked.includes(s));
  if (conflicts.length > 0) {
    throw new Error(`The following seats are already booked for this show: ${conflicts.join(', ')}`);
  }

  const bookingReference = generateBookingReference();
  const pricing = calculateSeatsPriceBreakdown(seats);

  const currentUser = getUser();
  const username = currentUser?.username || customUsername || 'guest';

  const bookingRecord = {
    bookingId: bookingReference,
    reference: bookingReference,
    username,
    showKey,
    movie: {
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      category: movie.category,
      language: movie.language,
      year: movie.year,
      rating: movie.rating,
      runtime: movie.runtime,
    },
    theatre: {
      id: theatre.id,
      name: theatre.name,
      area: theatre.area,
      address: theatre.address,
      screens: theatre.screens,
      formats: theatre.formats,
    },
    date: {
      iso: date.iso,
      displayLabel: date.displayLabel,
      full: date.full,
    },
    showtime: {
      id: showtime.id,
      time: showtime.time,
      label: showtime.label,
    },
    seats: [...seats].sort(),
    totalSeats: seats.length,
    pricing,
    amount: pricing.totalAmount,
    createdAt: new Date().toISOString(),
    confirmedAt: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };

  // 1. Update show seats availability in persistent storage
  const confirmedMap = getConfirmedBookingsMap();
  const previousShowSeats = confirmedMap[showKey] || [];
  confirmedMap[showKey] = Array.from(new Set([...previousShowSeats, ...seats]));
  saveConfirmedBookingsMap(confirmedMap);

  // 2. Append to My Bookings list in persistent storage (deduplicating by bookingId)
  try {
    if (typeof localStorage !== 'undefined') {
      const rawList = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      const existingList = rawList ? JSON.parse(rawList) : [];
      const seen = new Set();
      const updatedList = [bookingRecord, ...existingList].filter((b) => {
        const id = b.bookingId || b.reference;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updatedList));

      // Also update legacy single-record key
      localStorage.setItem(STORAGE_KEY_LEGACY, JSON.stringify(bookingRecord));
    }
  } catch (err) {
    console.warn('Failed saving booking history record:', err);
  }

  // 3. Commit to central cloud database so any other user sees these seats as BOOKED immediately
  saveCloudBookingRecord(bookingRecord, showKey, seats).catch((err) => {
    console.warn('[bookingService] Deferred cloud seat push:', err.message);
  });

  return bookingRecord;
}

/**
 * Asynchronously synchronizes seats for a show with the cloud database
 */
export async function syncShowBookedSeats(showKey) {
  if (!showKey) return [];
  const initial = getInitialPreBookedSeats(showKey);
  const cloudSeats = await syncCloudBookedSeats(showKey);
  return Array.from(new Set([...initial, ...cloudSeats]));
}

/**
 * Retrieves all saved bookings for the user.
 * If filterUsername is passed, returns only bookings associated with that user.
 * Always deduplicates by unique booking reference.
 */
export function getAllSavedBookings(filterUsername) {
  try {
    if (typeof localStorage === 'undefined') return [];
    const rawList = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    let list = [];
    if (rawList) {
      list = JSON.parse(rawList);
    } else {
      // Fallback to legacy single booking if list is empty
      const legacy = localStorage.getItem(STORAGE_KEY_LEGACY);
      if (legacy) {
        list = [JSON.parse(legacy)];
      }
    }

    const seen = new Set();
    const uniqueList = list.filter((b) => {
      const id = b.bookingId || b.reference;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    if (!filterUsername) {
      return uniqueList;
    }

    return uniqueList.filter(
      (b) => Boolean(b.username && b.username.toLowerCase() === filterUsername.toLowerCase())
    );
  } catch (err) {
    console.warn('Error reading saved bookings:', err);
    return [];
  }
}
