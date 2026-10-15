// ============================================================
// Experiment 1 - Test Case (d)
// File: TicketPriceCalculation.test.jsx
// Tool: Jest (no UI needed - pure logic testing)
// What this tests: Ticket price calculation logic
//
// Seat Categories and Prices:
//   Rows A to E --> Regular  --> Rs. 150
//   Rows F to H --> Premium  --> Rs. 200
//   Rows I to J --> Recliner --> Rs. 300
// ============================================================

import {
  getSeatCategory,
  getSeatPrice,
  calculateSeatsPriceBreakdown,
  SEAT_PRICES,
} from '../data/seatLayout';

// Also import Redux reducer to test dynamic price recalculation
import bookingReducer, { toggleSeat, removeSeat } from '../redux/bookingSlice';

describe('Experiment 1: Ticket-Price Calculation', () => {

  // ==== Section 1: Seat Category and Base Price Tests ====
  describe('Auditorium Tier Classification & Base Rates', () => {

    // Test Case 1: Check if each seat ID is mapped to the correct category
    it('correctly maps seat IDs to their corresponding categories', () => {
      // Rows A to E = Regular seats
      expect(getSeatCategory('A1')).toBe('Regular');
      expect(getSeatCategory('B5')).toBe('Regular');
      expect(getSeatCategory('E11')).toBe('Regular');

      // Rows F to H = Premium seats
      expect(getSeatCategory('F1')).toBe('Premium');
      expect(getSeatCategory('G6')).toBe('Premium');
      expect(getSeatCategory('H11')).toBe('Premium');

      // Rows I to J = Recliner seats (most expensive)
      expect(getSeatCategory('I1')).toBe('Recliner');
      expect(getSeatCategory('J11')).toBe('Recliner');
    });

    // Test Case 2: Check the ticket price values defined in SEAT_PRICES
    it('returns the defined ticket prices for each category', () => {
      // Check the price constants defined in seatLayout.js
      expect(SEAT_PRICES.Regular).toBe(150);
      expect(SEAT_PRICES.Premium).toBe(200);
      expect(SEAT_PRICES.Recliner).toBe(300);

      // Check price returned for specific seat IDs
      expect(getSeatPrice('A1')).toBe(150);   // A1 is Regular = 150
      expect(getSeatPrice('F5')).toBe(200);   // F5 is Premium = 200
      expect(getSeatPrice('J10')).toBe(300);  // J10 is Recliner = 300
    });

  });

  // ==== Section 2: Price Breakdown Calculation Tests ====
  describe('calculateSeatsPriceBreakdown Calculation Engine', () => {

    // Test Case 3: Empty seat list should give zero total
    it('returns zero totals for empty seat list', () => {
      // No seats selected - pass empty array
      const breakdown = calculateSeatsPriceBreakdown([]);

      // All values should be zero
      expect(breakdown.totalAmount).toBe(0);
      expect(breakdown.totalSeats).toBe(0);
      expect(breakdown.Regular.count).toBe(0);
      expect(breakdown.Premium.count).toBe(0);
      expect(breakdown.Recliner.count).toBe(0);
    });

    // Test Case 4: Test with Regular seats (Rs.150 each)
    it('calculates single and multiple Regular seats (Rs.150 each)', () => {
      // Single Regular seat
      const single = calculateSeatsPriceBreakdown(['A1']);
      expect(single.totalAmount).toBe(150);   // 1 x 150 = 150
      expect(single.Regular.count).toBe(1);
      expect(single.Regular.total).toBe(150);

      // Three Regular seats
      const multiple = calculateSeatsPriceBreakdown(['A1', 'B2', 'C3']);
      expect(multiple.totalAmount).toBe(450); // 3 x 150 = 450
      expect(multiple.Regular.count).toBe(3);
      expect(multiple.Regular.total).toBe(450);
    });

    // Test Case 5: Test with Premium seats (Rs.200 each)
    it('calculates Premium seats (Rs.200 each)', () => {
      // Two Premium seats: F1 and G2
      const breakdown = calculateSeatsPriceBreakdown(['F1', 'G2']);

      expect(breakdown.totalAmount).toBe(400);  // 2 x 200 = 400
      expect(breakdown.Premium.count).toBe(2);
      expect(breakdown.Premium.total).toBe(400);
    });

    // Test Case 6: Test with Recliner seats (Rs.300 each)
    it('calculates Recliner luxury seats (Rs.300 each)', () => {
      // Two Recliner seats: I1 and J2
      const breakdown = calculateSeatsPriceBreakdown(['I1', 'J2']);

      expect(breakdown.totalAmount).toBe(600);  // 2 x 300 = 600
      expect(breakdown.Recliner.count).toBe(2);
      expect(breakdown.Recliner.total).toBe(600);
    });

    // Test Case 7: Test with mix of all 3 seat types
    it('calculates multi-tier combination orders accurately', () => {
      // 2 Regular (A1, B2) = 2 x 150 = 300
      // 1 Premium  (F5)    = 1 x 200 = 200
      // 2 Recliner (I1,J11)= 2 x 300 = 600
      // Total = 300 + 200 + 600 = 1100
      const seats = ['A1', 'B2', 'F5', 'I1', 'J11'];
      const breakdown = calculateSeatsPriceBreakdown(seats);

      expect(breakdown.totalSeats).toBe(5);

      expect(breakdown.Regular.count).toBe(2);
      expect(breakdown.Regular.total).toBe(300);

      expect(breakdown.Premium.count).toBe(1);
      expect(breakdown.Premium.total).toBe(200);

      expect(breakdown.Recliner.count).toBe(2);
      expect(breakdown.Recliner.total).toBe(600);

      expect(breakdown.totalAmount).toBe(1100);
    });

  });

  // ==== Section 3: Dynamic Price Update via Redux ====
  describe('Dynamic Price Recalculation via Redux Actions', () => {

    // Test Case 8: Price should update each time a seat is added or removed
    it('dynamically recalculates total as seats are added and removed', () => {
      // Start with no seats
      let state = {
        selectedSeats: [],
        totalAmount: 0,
        totalSeats: 0,
        priceBreakdown: {},
      };

      // Step 1: Add Regular seat A1 --> total = 150
      state = bookingReducer(state, toggleSeat('A1'));
      expect(state.totalAmount).toBe(150);

      // Step 2: Add Premium seat F1 --> total = 150 + 200 = 350
      state = bookingReducer(state, toggleSeat('F1'));
      expect(state.totalAmount).toBe(350);

      // Step 3: Add Recliner seat J1 --> total = 350 + 300 = 650
      state = bookingReducer(state, toggleSeat('J1'));
      expect(state.totalAmount).toBe(650);

      // Step 4: Remove Regular seat A1 --> total = 650 - 150 = 500
      state = bookingReducer(state, removeSeat('A1'));
      expect(state.totalAmount).toBe(500);

      // Step 5: Toggle off Recliner J1 --> total = 500 - 300 = 200
      state = bookingReducer(state, toggleSeat('J1'));
      expect(state.totalAmount).toBe(200);

      // Only F1 (Premium) should remain in selectedSeats
      expect(state.selectedSeats).toEqual(['F1']);
    });

  });

});
