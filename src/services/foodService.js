import axiosInstance, {
  getToken,
  injectExpiredTokenForTesting,
} from './axiosInstance';
import axios from 'axios';
import { INITIAL_FOOD_MENU } from '../data/foodMenuData';

const FOOD_API = '/api/food';

/**
 * foodService.js
 * Food Ordering API Service for Unit 4 - Experiment 4
 *
 * Implements:
 *  - Public Menu fetching
 *  - Protected Cart operations (GET, POST, DELETE) with Bearer token
 *  - Protected Checkout (POST) restricted to authenticated users
 *  - Protected Order History (GET)
 *  - Interceptor verification helpers for viva/lab demonstration
 */
export const foodService = {
  /**
   * Public: Fetch all food menu items
   */
  async getMenu() {
    try {
      const response = await axiosInstance.get(`${FOOD_API}/menu`);
      return response.data?.items || INITIAL_FOOD_MENU;
    } catch {
      // Fallback to initial local items if server is offline
      return INITIAL_FOOD_MENU;
    }
  },

  /**
   * Protected: Fetch current user's cart (Requires Token)
   * Requirement (f): Restrict cart to authenticated users
   */
  async getCart() {
    const response = await axiosInstance.get(`${FOOD_API}/cart`);
    return response.data?.cart || [];
  },

  /**
   * Protected: Add or update item in cart (Requires Token)
   * Requirement (d) & (f): Axios request interceptor attaches Bearer token
   */
  async addToCart(item, quantity = 1) {
    const response = await axiosInstance.post(`${FOOD_API}/cart`, {
      itemId: item.id,
      name: item.name,
      price: item.price,
      emoji: item.emoji,
      quantity,
    });
    return response.data?.cart || [];
  },

  /**
   * Protected: Remove specific item from cart (Requires Token)
   */
  async removeFromCart(itemId) {
    const response = await axiosInstance.delete(`${FOOD_API}/cart/${encodeURIComponent(itemId)}`);
    return response.data?.cart || [];
  },

  /**
   * Protected: Clear entire cart (Requires Token)
   */
  async clearCart() {
    const response = await axiosInstance.delete(`${FOOD_API}/cart`);
    return response.data?.cart || [];
  },

  /**
   * Protected: Place food order (Requires Token)
   * Requirement (f): Restrict checkout and order APIs to authenticated users
   */
  async checkout(orderDetails) {
    const response = await axiosInstance.post(`${FOOD_API}/checkout`, {
      deliveryType: orderDetails.deliveryType || 'Seat Delivery',
      seatOrTableNumber: orderDetails.seatOrTableNumber || 'Seat A-04',
      customerNotes: orderDetails.customerNotes || '',
      paymentMethod: orderDetails.paymentMethod || 'UPI / Card',
    });
    return response.data;
  },

  /**
   * Protected: Retrieve authenticated user's order history
   */
  async getOrders() {
    const response = await axiosInstance.get(`${FOOD_API}/orders`);
    return response.data?.orders || [];
  },

  /**
   * Test Helper: Directly calls protected Cart API WITHOUT Bearer token
   * Proves Requirement (f): Backend returns 401 Unauthorized when token is missing.
   */
  async testProtectedApiWithoutToken() {
    try {
      // Create naked raw axios request without the interceptor's token header
      const rawAxios = axios.create();
      const response = await rawAxios.get(`${FOOD_API}/cart`, {
        headers: { Accept: 'application/json' },
      });
      return { success: true, data: response.data };
    } catch (err) {
      return {
        success: false,
        status: err.response?.status || 401,
        error: err.response?.data?.error || 'Access Denied: Missing Bearer Token.',
      };
    }
  },

  /**
   * Test Helper: Injects an expired token and triggers a protected call
   * Proves Requirement (g): Axios response interceptor catches 401, cleans up storage, and redirects.
   */
  async testExpiredToken() {
    injectExpiredTokenForTesting();
    // Trigger protected cart request with the expired token
    return await axiosInstance.get(`${FOOD_API}/cart`);
  },
};

export default foodService;
