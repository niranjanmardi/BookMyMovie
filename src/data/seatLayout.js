/**
 * seatLayout.js - Cinema Seat Layout & Pricing Configuration (110 Seats Per Screen)
 *
 * Screen Layout:
 * - Rows A through J (10 rows)
 * - 11 seats per row (Numbered 1 to 11)
 * - Total = 110 seats per screen
 *
 * Seating Categories & Demo Pricing:
 * - Rows A - E: Regular   -> Rs. 150
 * - Rows F - H: Premium   -> Rs. 200
 * - Rows I - J: Recliner  -> Rs. 300
 *
 * Visual Layout:
 * - Left block: Seats 1-5
 * - Walking Aisle Spacing
 * - Right block: Seats 6-11
 */

export const SEAT_PRICES = {
  Regular: 150,
  Premium: 200,
  Recliner: 300,
};

export const ROW_CONFIG = [
  { row: 'A', category: 'Regular',  price: SEAT_PRICES.Regular,  seatsCount: 11 },
  { row: 'B', category: 'Regular',  price: SEAT_PRICES.Regular,  seatsCount: 11 },
  { row: 'C', category: 'Regular',  price: SEAT_PRICES.Regular,  seatsCount: 11 },
  { row: 'D', category: 'Regular',  price: SEAT_PRICES.Regular,  seatsCount: 11 },
  { row: 'E', category: 'Regular',  price: SEAT_PRICES.Regular,  seatsCount: 11 },
  { row: 'F', category: 'Premium',  price: SEAT_PRICES.Premium,  seatsCount: 11 },
  { row: 'G', category: 'Premium',  price: SEAT_PRICES.Premium,  seatsCount: 11 },
  { row: 'H', category: 'Premium',  price: SEAT_PRICES.Premium,  seatsCount: 11 },
  { row: 'I', category: 'Recliner', price: SEAT_PRICES.Recliner, seatsCount: 11 },
  { row: 'J', category: 'Recliner', price: SEAT_PRICES.Recliner, seatsCount: 11 },
];

export const TOTAL_SEATS_PER_SCREEN = 110;

/**
 * Returns all seat objects with row, seatNumber, category, and price
 */
export function generateScreenSeats() {
  const allSeats = [];
  ROW_CONFIG.forEach(({ row, category, price, seatsCount }) => {
    for (let num = 1; num <= seatsCount; num++) {
      allSeats.push({
        id: `${row}${num}`,
        row,
        number: num,
        category,
        price,
        isAisleLeft: num === 5,
        isAisleRight: num === 6,
      });
    }
  });
  return allSeats;
}

/**
 * Helper to get the category of a seat ID (e.g. 'A4' -> 'Regular', 'G7' -> 'Premium', 'J2' -> 'Recliner')
 */
export function getSeatCategory(seatId) {
  if (!seatId) return 'Regular';
  const row = String(seatId).trim().charAt(0).toUpperCase();
  const found = ROW_CONFIG.find((r) => r.row === row);
  return found ? found.category : 'Regular';
}

/**
 * Helper to get the ticket price for a specific seat ID
 */
export function getSeatPrice(seatId) {
  if (!seatId) return SEAT_PRICES.Regular;
  const category = getSeatCategory(seatId);
  return SEAT_PRICES[category] || SEAT_PRICES.Regular;
}

/**
 * Helper to calculate price breakdown for an array of seat IDs
 */
export function calculateSeatsPriceBreakdown(seatIds = []) {
  const breakdown = {
    Regular:  { count: 0, rate: SEAT_PRICES.Regular,  total: 0, seats: [] },
    Premium:  { count: 0, rate: SEAT_PRICES.Premium,  total: 0, seats: [] },
    Recliner: { count: 0, rate: SEAT_PRICES.Recliner, total: 0, seats: [] },
    totalAmount: 0,
    totalSeats: seatIds.length,
  };

  seatIds.forEach((seatId) => {
    const category = getSeatCategory(seatId);
    if (breakdown[category]) {
      breakdown[category].count += 1;
      breakdown[category].total += breakdown[category].rate;
      breakdown[category].seats.push(seatId);
      breakdown.totalAmount += breakdown[category].rate;
    }
  });

  return breakdown;
}
