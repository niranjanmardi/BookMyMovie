/**
 * cloudSyncService.js - Cloud Synchronization & Multi-User Persistence Service
 *
 * Enables real-time cross-device persistence after deployment:
 * 1. User Registration: New accounts created on any device are synchronized
 *    to the central cloud database so users can log in from any browser/device.
 * 2. Seat Reservations: When User A books a seat for a specific show, that seat
 *    is saved to the cloud and instantly marked as 'booked' & disabled for User B.
 * 3. Offline Resilience: Always maintains a synchronized local cache in localStorage
 *    so the application works seamlessly offline or when the network is unstable.
 */

const CLOUD_API_BASE = 'https://api.restful-api.dev/objects';
const CLOUD_USERS_DOC_ID = 'ff808181a09d98f701a14337680d6f0b';
const CLOUD_BOOKINGS_DOC_ID = 'ff808181a09d98f701a1433769566f0c';

const STORAGE_KEY_USERS = 'bm_users';
const STORAGE_KEY_CONFIRMED = 'bmm_confirmed_show_seats';
const STORAGE_KEY_BOOKINGS = 'bmm_my_bookings_list';

// Cross-tab broadcast channel for instant multi-tab sync on same device
const broadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('bmm_global_channel')
    : null;

// Helper: Safely read local users
export function getLocalUsers() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper: Safely save local users
export function saveLocalUsers(users) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch {}
}

// Helper: Safely read local confirmed seats map
export function getLocalConfirmedSeatsMap() {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY_CONFIRMED);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper: Safely save local confirmed seats map
export function saveLocalConfirmedSeatsMap(map) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_CONFIRMED, JSON.stringify(map));
  } catch {}
}

/**
 * Synchronize registered users with the cloud
 * Fetches all registered users from cloud and merges with local storage.
 */
export async function syncCloudUsers() {
  const localUsers = getLocalUsers();
  if (typeof fetch === 'undefined') return localUsers;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${CLOUD_API_BASE}/${CLOUD_USERS_DOC_ID}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const doc = await res.json();
      const cloudUsers = Array.isArray(doc?.data?.users) ? doc.data.users : [];

      // Merge cloud users and local users (deduplicating by username)
      const userMap = new Map();
      localUsers.forEach((u) => userMap.set(u.username.toLowerCase(), u));
      cloudUsers.forEach((u) => userMap.set(u.username.toLowerCase(), u));

      const merged = Array.from(userMap.values());
      saveLocalUsers(merged);
      return merged;
    }
  } catch (err) {
    // If offline, use local storage seamlessly
    console.info('[cloudSyncService] Using local users cache (offline or timeout):', err.message);
  }

  return localUsers;
}

/**
 * Register a new user and push to the cloud database
 */
export async function registerCloudUser(newUser) {
  const localUsers = getLocalUsers();

  // 1. Check duplicate username
  if (localUsers.some((u) => u.username.toLowerCase() === newUser.username.toLowerCase())) {
    return { success: false, message: 'Username is already registered. Please choose another.' };
  }

  // 2. Save locally immediately for instant feedback
  const updatedLocal = [...localUsers, newUser];
  saveLocalUsers(updatedLocal);

  // 3. Push to cloud registry so other users/devices get the new account
  try {
    const cloudMerged = await syncCloudUsers();
    if (!cloudMerged.some((u) => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      cloudMerged.push(newUser);
    }

    await fetch(`${CLOUD_API_BASE}/${CLOUD_USERS_DOC_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'bmm_master_users_registry_v1',
        data: { users: cloudMerged },
      }),
    });

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'USER_REGISTERED', username: newUser.username });
    }
  } catch (err) {
    console.warn('[cloudSyncService] Cloud registration sync deferred:', err.message);
  }

  return { success: true };
}

/**
 * Fetch latest booked seats from cloud for a given showKey
 */
export async function syncCloudBookedSeats(showKey) {
  const localMap = getLocalConfirmedSeatsMap();
  if (typeof fetch === 'undefined') {
    return showKey ? localMap[showKey] || [] : localMap;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${CLOUD_API_BASE}/${CLOUD_BOOKINGS_DOC_ID}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const doc = await res.json();
      const cloudSeatsMap = doc?.data?.confirmedShowSeats || {};

      // Merge cloud and local seats maps
      const mergedMap = { ...localMap };
      Object.keys(cloudSeatsMap).forEach((key) => {
        const localSeats = mergedMap[key] || [];
        const cloudSeats = cloudSeatsMap[key] || [];
        mergedMap[key] = Array.from(new Set([...localSeats, ...cloudSeats]));
      });

      saveLocalConfirmedSeatsMap(mergedMap);

      if (showKey) {
        return mergedMap[showKey] || [];
      }
      return mergedMap;
    }
  } catch (err) {
    console.info('[cloudSyncService] Using local booked seats (offline or timeout):', err.message);
  }

  if (showKey) {
    return localMap[showKey] || [];
  }
  return localMap;
}

/**
 * Commit newly booked seats to the cloud database
 */
export async function saveCloudBookingRecord(bookingRecord, showKey, seats) {
  // 1. Update local storage immediately (optimistic UI)
  const localMap = getLocalConfirmedSeatsMap();
  const existingSeats = localMap[showKey] || [];
  const updatedSeats = Array.from(new Set([...existingSeats, ...seats]));
  localMap[showKey] = updatedSeats;
  saveLocalConfirmedSeatsMap(localMap);

  // 2. Push to cloud database so other users immediately see the seats as BOOKED & DISABLED
  if (typeof fetch === 'undefined') return bookingRecord;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const getRes = await fetch(`${CLOUD_API_BASE}/${CLOUD_BOOKINGS_DOC_ID}`, {
      signal: controller.signal,
    });

    let currentCloudMap = {};
    let currentBookings = [];

    if (getRes.ok) {
      const doc = await getRes.json();
      currentCloudMap = doc?.data?.confirmedShowSeats || {};
      currentBookings = Array.isArray(doc?.data?.bookings) ? doc.data.bookings : [];
    }

    const currentSeatsForShow = currentCloudMap[showKey] || [];
    currentCloudMap[showKey] = Array.from(new Set([...currentSeatsForShow, ...seats]));

    // Deduplicate cloud bookings by bookingId
    const seenBookingIds = new Set();
    const uniqueBookings = [bookingRecord, ...currentBookings].filter((b) => {
      const id = b.bookingId || b.reference;
      if (!id || seenBookingIds.has(id)) return false;
      seenBookingIds.add(id);
      return true;
    }).slice(0, 100); // Keep latest 100 bookings

    await fetch(`${CLOUD_API_BASE}/${CLOUD_BOOKINGS_DOC_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'bmm_master_bookings_registry_v1',
        data: {
          confirmedShowSeats: currentCloudMap,
          bookings: uniqueBookings,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // Notify other tabs on the same device
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'SEATS_BOOKED',
        showKey,
        seats,
      });
    }

    // Trigger local DOM event for active components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bmm_seats_updated', {
          detail: { showKey, bookedSeats: currentCloudMap[showKey] },
        })
      );
    }
  } catch (err) {
    console.warn('[cloudSyncService] Cloud booking commit warning:', err.message);
  }

  return bookingRecord;
}

export { broadcastChannel };
