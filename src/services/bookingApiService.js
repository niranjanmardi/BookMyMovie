import axiosInstance, { getUser } from './axiosInstance';
import { calculateSeatsPriceBreakdown } from '../data/seatLayout.js';

const API_BASE = '/api/bookings';
const STORAGE_KEY_BOOKINGS = 'bmm_my_bookings_list';

// Helper: Read local persistent bookings
function getLocalBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper: Save local persistent bookings (deduplicating by bookingId)
function saveLocalBookings(list) {
  try {
    const seen = new Set();
    const unique = [];
    for (const item of list || []) {
      const id = item?.bookingId || item?.reference;
      if (id && !seen.has(id)) {
        seen.add(id);
        unique.push(item);
      }
    }
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(unique));
  } catch (err) {
    console.warn('Storage write failed in bookingApiService:', err);
  }
}

// Helper: Generate unique reference ID
function generateBookingId() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let ref = 'BMM-CBE-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

/**
 * a) GET: Fetch Booking History (Protected Endpoint)
 * Automatically attaches Authorization Bearer token via Axios interceptor.
 * Filters by logged-in user so each user sees only their own booked movies,
 * with an optional master view for admin.
 */
export async function getBookingHistory(options = {}) {
  const currentUser = getUser();
  const currentUsername = currentUser?.username;
  const showAll = options.all === true && currentUsername?.toLowerCase() === 'admin';

  try {
    const queryUrl = showAll ? `${API_BASE}?all=true` : API_BASE;
    const response = await axiosInstance.get(queryUrl);
    const data = response.data;
    if (Array.isArray(data)) {
      saveLocalBookings(data);
      if (showAll || !currentUsername) return data;
      return data.filter(
        (b) => Boolean(b.username && b.username.toLowerCase() === currentUsername.toLowerCase())
      );
    }
    const local = getLocalBookings();
    if (showAll || !currentUsername) return local;
    return local.filter(
      (b) => Boolean(b.username && b.username.toLowerCase() === currentUsername.toLowerCase())
    );
  } catch (err) {
    // If backend rejected with 401/403 Unauthorized, propagate error
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      throw new Error(err.response.data?.error || 'Authentication required. Please sign in to view bookings.', { cause: err });
    }
    // If network offline, fallback to local cache
    console.info('[bookingApiService] Serving GET bookings from persistent cache:', err.message);
    const local = getLocalBookings();
    if (showAll || !currentUsername) return local;
    return local.filter(
      (b) => Boolean(b.username && b.username.toLowerCase() === currentUsername.toLowerCase())
    );
  }
}

/**
 * Remove cancelled bookings from local storage
 */
export function clearCancelledBookings() {
  const list = getLocalBookings();
  const activeList = list.filter((b) => b.status !== 'CANCELLED');
  saveLocalBookings(activeList);
  return activeList;
}

/**
 * GET: Fetch a single booking by reference ID (Protected Endpoint)
 */
export async function getBookingById(bookingId) {
  if (!bookingId) {
    throw new Error('Booking ID is required.');
  }

  try {
    const response = await axiosInstance.get(`${API_BASE}/${encodeURIComponent(bookingId)}`);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      throw new Error(err.response.data?.error || 'Authentication required.', { cause: err });
    }
    console.info('[bookingApiService] GET single booking fallback:', err.message);
  }

  const list = getLocalBookings();
  const found = list.find((b) => b.bookingId === bookingId || b.reference === bookingId);
  if (!found) {
    throw new Error(`Booking with ID "${bookingId}" not found.`);
  }
  return found;
}

/**
 * b) POST: Create a new movie ticket booking (Protected Endpoint)
 */
export async function createBooking(bookingData) {
  if (
    !bookingData.movie ||
    !bookingData.theatre ||
    !bookingData.date ||
    !bookingData.showtime ||
    !bookingData.seats?.length
  ) {
    throw new Error('Incomplete booking payload. Movie, theatre, date, showtime, and seats are required.');
  }

  const newId = bookingData.bookingId || bookingData.reference || generateBookingId();
  const pricing = calculateSeatsPriceBreakdown(bookingData.seats);

  const currentUser = getUser();
  const username = currentUser?.username || bookingData.username || 'guest';

  const payload = {
    bookingId: newId,
    reference: newId,
    username,
    movie: {
      id: bookingData.movie.id,
      title: bookingData.movie.title,
      poster: bookingData.movie.poster,
      category: bookingData.movie.category,
      language: bookingData.movie.language,
      year: bookingData.movie.year,
    },
    theatre: {
      id: bookingData.theatre.id,
      name: bookingData.theatre.name,
      area: bookingData.theatre.area,
      address: bookingData.theatre.address,
      screens: bookingData.theatre.screens,
    },
    date: {
      iso: bookingData.date.iso || bookingData.date,
      displayLabel: bookingData.date.displayLabel || bookingData.date,
      full: bookingData.date.full || bookingData.date,
    },
    showtime: {
      id: bookingData.showtime.id || 'st',
      time: bookingData.showtime.time || bookingData.showtime,
      label: bookingData.showtime.label || 'Show',
    },
    seats: [...bookingData.seats].sort(),
    totalSeats: bookingData.seats.length,
    pricing,
    amount: pricing.totalAmount || bookingData.amount || 0,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    confirmedAt: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };

  try {
    const response = await axiosInstance.post(API_BASE, payload);
    const created = response.data;
    const list = getLocalBookings();
    const existingIdx = list.findIndex(
      (b) => (b.bookingId || b.reference) === (created.bookingId || created.reference)
    );
    const merged = existingIdx !== -1
      ? list.map((b, i) => (i === existingIdx ? created : b))
      : [created, ...list];
    saveLocalBookings(merged);
    return created;
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      throw new Error(err.response.data?.error || 'Authentication required to create a booking.', { cause: err });
    }
    console.info('[bookingApiService] POST fallback to local store:', err.message);
  }

  const list = getLocalBookings();
  const existingIdx = list.findIndex(
    (b) => (b.bookingId || b.reference) === newId
  );
  const updatedList = existingIdx !== -1
    ? list.map((b, i) => (i === existingIdx ? payload : b))
    : [payload, ...list];
  saveLocalBookings(updatedList);
  return payload;
}

/**
 * c) PUT: Modify booking details (Protected Endpoint)
 */
export async function updateBooking(bookingId, updates) {
  if (!bookingId) {
    throw new Error('Booking ID is required to update a booking.');
  }

  let existing = null;
  const list = getLocalBookings();
  const index = list.findIndex((b) => b.bookingId === bookingId || b.reference === bookingId);
  if (index !== -1) {
    existing = list[index];
  }

  if (!existing) {
    throw new Error(`Booking ${bookingId} not found.`);
  }

  if (existing.status === 'CANCELLED') {
    throw new Error('Cannot modify a cancelled booking.');
  }

  const newSeats = updates.seats ? [...updates.seats].sort() : existing.seats;
  const pricing = calculateSeatsPriceBreakdown(newSeats);

  const updatedRecord = {
    ...existing,
    ...updates,
    seats: newSeats,
    totalSeats: newSeats.length,
    pricing,
    amount: pricing.totalAmount,
    status: 'MODIFIED',
    updatedAt: new Date().toISOString(),
    modifiedAt: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };

  try {
    const response = await axiosInstance.put(
      `${API_BASE}/${encodeURIComponent(bookingId)}`,
      updatedRecord
    );
    const saved = response.data;
    list[index] = saved;
    saveLocalBookings(list);
    return saved;
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      throw new Error(err.response.data?.error || 'Authentication required to modify bookings.', { cause: err });
    }
    console.info('[bookingApiService] PUT fallback to local store:', err.message);
  }

  list[index] = updatedRecord;
  saveLocalBookings(list);
  return updatedRecord;
}

/**
 * d) DELETE: Cancel an existing booking (Protected Endpoint)
 */
export async function cancelBooking(bookingId) {
  if (!bookingId) {
    throw new Error('Booking ID is required to cancel a booking.');
  }

  const list = getLocalBookings();
  const index = list.findIndex((b) => b.bookingId === bookingId || b.reference === bookingId);

  if (index === -1) {
    throw new Error(`Booking ${bookingId} not found.`);
  }

  const existing = list[index];

  try {
    const response = await axiosInstance.delete(`${API_BASE}/${encodeURIComponent(bookingId)}`);
    existing.status = 'CANCELLED';
    existing.cancelledAt = new Date().toISOString();
    list[index] = existing;
    saveLocalBookings(list);
    return response.data || { success: true, bookingId, message: 'Booking cancelled successfully.' };
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      throw new Error(err.response.data?.error || 'Authentication required to cancel a booking.', { cause: err });
    }
    console.info('[bookingApiService] DELETE fallback to local store:', err.message);
  }

  existing.status = 'CANCELLED';
  existing.cancelledAt = new Date().toISOString();
  list[index] = existing;
  saveLocalBookings(list);

  return { success: true, bookingId, message: 'Booking cancelled successfully.' };
}
