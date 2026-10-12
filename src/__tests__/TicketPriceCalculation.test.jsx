import {
  getSeatCategory,
  getSeatPrice,
  calculateSeatsPriceBreakdown,
  SEAT_PRICES,
} from '../data/seatLayout';
import bookingReducer, { toggleSeat, removeSeat } from '../redux/bookingSlice';

describe('Experiment 1: Ticket-Price Calculation', () => {
  describe('Auditorium Tier Classification & Base Rates', () => {
    it('correctly maps seat IDs to their corresponding categories', () => {
      // Rows A–E: Regular
      expect(getSeatCategory('A1')).toBe('Regular');
      expect(getSeatCategory('B5')).toBe('Regular');
      expect(getSeatCategory('E11')).toBe('Regular');

      // Rows F–H: Premium
      expect(getSeatCategory('F1')).toBe('Premium');
      expect(getSeatCategory('G6')).toBe('Premium');
      expect(getSeatCategory('H11')).toBe('Premium');

      // Rows I–J: Recliner
      expect(getSeatCategory('I1')).toBe('Recliner');
      expect(getSeatCategory('J11')).toBe('Recliner');
    });

    it('returns the defined ticket prices for each category', () => {
      expect(SEAT_PRICES.Regular).toBe(150);
      expect(SEAT_PRICES.Premium).toBe(200);
      expect(SEAT_PRICES.Recliner).toBe(300);

      expect(getSeatPrice('A1')).toBe(150);
      expect(getSeatPrice('F5')).toBe(200);
      expect(getSeatPrice('J10')).toBe(300);
    });
  });

  describe('calculateSeatsPriceBreakdown Calculation Engine', () => {
    it('returns zero totals for empty seat list', () => {
      const breakdown = calculateSeatsPriceBreakdown([]);

      expect(breakdown.totalAmount).toBe(0);
      expect(breakdown.totalSeats).toBe(0);
      expect(breakdown.Regular.count).toBe(0);
      expect(breakdown.Premium.count).toBe(0);
      expect(breakdown.Recliner.count).toBe(0);
    });

    it('calculates single and multiple Regular seats (₹150 each)', () => {
      const single = calculateSeatsPriceBreakdown(['A1']);
      expect(single.totalAmount).toBe(150);
      expect(single.Regular.count).toBe(1);
      expect(single.Regular.total).toBe(150);

      const multiple = calculateSeatsPriceBreakdown(['A1', 'B2', 'C3']);
      expect(multiple.totalAmount).toBe(450);
      expect(multiple.Regular.count).toBe(3);
      expect(multiple.Regular.total).toBe(450);
    });

    it('calculates Premium seats (₹200 each)', () => {
      const breakdown = calculateSeatsPriceBreakdown(['F1', 'G2']);
      expect(breakdown.totalAmount).toBe(400);
      expect(breakdown.Premium.count).toBe(2);
      expect(breakdown.Premium.total).toBe(400);
    });

    it('calculates Recliner luxury seats (₹300 each)', () => {
      const breakdown = calculateSeatsPriceBreakdown(['I1', 'J2']);
      expect(breakdown.totalAmount).toBe(600);
      expect(breakdown.Recliner.count).toBe(2);
      expect(breakdown.Recliner.total).toBe(600);
    });

    it('calculates multi-tier combination orders accurately', () => {
      // 2 Regular (₹300) + 1 Premium (₹200) + 2 Recliner (₹600) = ₹1100
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

  describe('Dynamic Price Recalculation via Redux Actions', () => {
    it('dynamically recalculates total as seats are added and removed', () => {
      let state = {
        selectedSeats: [],
        totalAmount: 0,
        totalSeats: 0,
        priceBreakdown: {},
      };

      // 1. Add Regular seat A1 -> 150
      state = bookingReducer(state, toggleSeat('A1'));
      expect(state.totalAmount).toBe(150);

      // 2. Add Premium seat F1 -> 150 + 200 = 350
      state = bookingReducer(state, toggleSeat('F1'));
      expect(state.totalAmount).toBe(350);

      // 3. Add Recliner seat J1 -> 350 + 300 = 650
      state = bookingReducer(state, toggleSeat('J1'));
      expect(state.totalAmount).toBe(650);

      // 4. Remove Regular seat A1 -> 650 - 150 = 500
      state = bookingReducer(state, removeSeat('A1'));
      expect(state.totalAmount).toBe(500);

      // 5. Toggle off Recliner seat J1 -> 500 - 300 = 200
      state = bookingReducer(state, toggleSeat('J1'));
      expect(state.totalAmount).toBe(200);
      expect(state.selectedSeats).toEqual(['F1']);
    });
  });
});
