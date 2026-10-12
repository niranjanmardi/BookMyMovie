/**
 * showtimes.js - Demonstration Showtimes and Booking Dates (Coimbatore Multiplexes)
 *
 * Provides realistic demo showtimes and dynamic 7-day advance booking dates.
 * Disables past showtimes for the current date.
 */

export const STANDARD_SHOWTIMES = [
  { id: 'st-1000', time: '10:00 AM', label: 'Morning Show',    period: 'morning', hour24: 10, minute: 0 },
  { id: 'st-1330', time: '1:30 PM',  label: 'Matinee Show',    period: 'afternoon', hour24: 13, minute: 30 },
  { id: 'st-1630', time: '4:30 PM',  label: 'Evening Show',    period: 'evening', hour24: 16, minute: 30 },
  { id: 'st-1930', time: '7:30 PM',  label: 'Night Show',      period: 'night', hour24: 19, minute: 30 },
  { id: 'st-2215', time: '10:15 PM', label: 'Late Night Show', period: 'late', hour24: 22, minute: 15 },
];

/**
 * Generates selectable booking dates starting from today up to 7 days ahead (total 8 days)
 *
 * @param {number} [daysAhead=7]
 * @returns {Array<Object>}
 */
export function getAvailableBookingDates(daysAhead = 7) {
  const dates = [];
  const now = new Date();
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${day}`;

    const dayOfWeek = dayNamesShort[d.getDay()];
    const dateNum = d.getDate();
    const monthStr = monthNamesShort[d.getMonth()];

    // Format: "Fri, 9 Oct"
    const displayLabel = `${dayOfWeek}, ${dateNum} ${monthStr}`;

    dates.push({
      id: `date-${iso}`,
      iso,
      dayNum: dateNum,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayOfWeek,
      dayOfWeek,
      monthStr,
      year,
      displayLabel,
      full: d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      isToday: i === 0,
    });
  }

  return dates;
}

/**
 * Checks whether a showtime on a given date has already passed.
 *
 * @param {string} dateIso - e.g. "2026-10-09"
 * @param {Object} showtime - Object containing hour24 and minute
 * @returns {boolean}
 */
export function isShowtimePast(dateIso, showtime) {
  if (!dateIso || !showtime) return false;

  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  // If the booking date is in the future, it is never past
  if (dateIso > todayIso) {
    return false;
  }

  // If the booking date is in the past, it's past
  if (dateIso < todayIso) {
    return true;
  }

  // Same day: check current hour and minute
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (showtime.hour24 < currentHour) return true;
  if (showtime.hour24 === currentHour && showtime.minute <= currentMinute) return true;

  return false;
}

/**
 * Retrieves valid showtimes for a specific theatre and date.
 * Allows slight time offsets for different multiplex screens to make the schedule realistic.
 */
export function getShowtimesForTheatre(theatreId, dateIso) {
  return STANDARD_SHOWTIMES.map((st) => {
    const isPast = isShowtimePast(dateIso, st);
    return {
      ...st,
      isAvailable: !isPast,
      theatreId: theatreId || 'default',
      dateIso: dateIso || '',
    };
  });
}
