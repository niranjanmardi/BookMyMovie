import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { Buffer } from 'node:buffer';

/**
 * Mock REST API & Authentication Server Plugin for Unit 4 Experiment 4
 * Topics: Authentication, Tokens, Protected API, Axios Interceptors
 *
 * Provides:
 *  1. POST /api/auth/login        -> Validates credentials, issues signed Bearer token
 *  2. GET  /api/auth/me           -> Protected: Verifies Authorization: Bearer <token>
 *  3. POST /api/auth/logout       -> Invalidate session
 *  4. POST /api/auth/expire-token -> Generates expired token for testing Requirement (g)
 *  5. GET  /api/food/menu         -> Public food menu items
 *  6. GET  /api/food/cart         -> Protected: Restrict cart to authenticated users (Req f)
 *  7. POST /api/food/cart         -> Protected: Add/update cart items with Bearer token (Req d & f)
 *  8. DELETE /api/food/cart/:id   -> Protected: Remove cart item (Req f)
 *  9. DELETE /api/food/cart       -> Protected: Clear cart (Req f)
 * 10. POST /api/food/checkout     -> Protected: Order checkout restricted to auth users (Req f)
 * 11. GET  /api/food/orders       -> Protected: Order history restricted to auth users (Req f)
 * 12. /api/bookings               -> Movie ticket reservations (Unit 4 Exp 3 compatibility)
 */
function mockApiPlugin() {
  let inMemoryBookings = [];
  const inMemoryFoodCarts = {};
  const inMemoryFoodOrders = {};

  const FOOD_MENU = [
    {
      id: 'food-1',
      name: 'Gourmet Golden Caramel Popcorn',
      category: 'Snacks',
      price: 220,
      rating: 4.9,
      description: 'Freshly popped jumbo corn tossed in rich slow-cooked golden caramel with sea salt.',
      emoji: '🍿',
      badge: 'Bestseller',
      prepTime: '3 mins',
    },
    {
      id: 'food-2',
      name: 'Loaded Mexican Cheese Nachos',
      category: 'Snacks',
      price: 190,
      rating: 4.8,
      description: 'Crispy stone-ground corn tortilla chips accompanied by hot cheddar dip and jalapeño salsa.',
      emoji: '🧀',
      badge: 'Popular',
      prepTime: '5 mins',
    },
    {
      id: 'food-3',
      name: 'Crispy Truffle Parmesan Fries',
      category: 'Snacks',
      price: 180,
      rating: 4.7,
      description: 'Golden skin-on french fries tossed in fragrant white truffle oil and aged parmesan.',
      emoji: '🍟',
      badge: 'Chef Special',
      prepTime: '5 mins',
    },
    {
      id: 'food-4',
      name: 'Smoky BBQ Paneer Burger',
      category: 'Meals',
      price: 240,
      rating: 4.8,
      description: 'Char-grilled marinated paneer steak with crisp iceberg lettuce and smoky BBQ dip.',
      emoji: '🍔',
      badge: 'Vegetarian',
      prepTime: '8 mins',
    },
    {
      id: 'food-5',
      name: 'Crispy Zinger Chicken Burger',
      category: 'Meals',
      price: 280,
      rating: 4.9,
      description: 'Deep-fried golden chicken breast fillet loaded with creamy chipotle mayonnaise.',
      emoji: '🍗',
      badge: 'Must Try',
      prepTime: '8 mins',
    },
    {
      id: 'food-6',
      name: 'Wood-Fired Margherita Pizza (8")',
      category: 'Meals',
      price: 299,
      rating: 4.8,
      description: 'San Marzano tomato sauce, fresh buffalo mozzarella, virgin olive oil, and sweet basil.',
      emoji: '🍕',
      badge: 'Classic',
      prepTime: '10 mins',
    },
    {
      id: 'food-7',
      name: 'Chilled Caramel Iced Macchiato',
      category: 'Beverages',
      price: 160,
      rating: 4.7,
      description: 'Double shot of dark roasted arabica coffee poured over chilled vanilla milk and caramel.',
      emoji: '☕',
      badge: 'Chilled',
      prepTime: '3 mins',
    },
    {
      id: 'food-8',
      name: 'Refreshing Virgin Mojito Fizz',
      category: 'Beverages',
      price: 140,
      rating: 4.6,
      description: 'Crushed garden mint, freshly squeezed lime juice, raw cane sugar, and chilled sparkling soda.',
      emoji: '🍹',
      badge: 'Refreshing',
      prepTime: '3 mins',
    },
    {
      id: 'food-9',
      name: 'Molten Belgian Chocolate Lava Cake',
      category: 'Desserts',
      price: 150,
      rating: 4.9,
      description: 'Warm cocoa sponge cake bursting with liquid dark Belgian chocolate ganache center.',
      emoji: '🍫',
      badge: 'Sweet Treat',
      prepTime: '4 mins',
    },
    {
      id: 'food-10',
      name: 'Red Velvet Gourmet Sundae',
      category: 'Desserts',
      price: 170,
      rating: 4.8,
      description: 'Velvety cake crumble layered with Madagascar vanilla ice cream and berry reduction.',
      emoji: '🍨',
      badge: 'Delight',
      prepTime: '4 mins',
    },
  ];

  const parseBody = (req) => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  };

  const generateToken = (username, expiresInSeconds = 3600) => {
    const payload = {
      username,
      email: username.includes('@') ? username : `${username}@bookmymovie.com`,
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    };
    return 'bmm_jwt_' + Buffer.from(JSON.stringify(payload)).toString('base64');
  };

  const verifyTokenHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        valid: false,
        error: 'Unauthorized: Authentication token is missing. Please log in with a valid account.',
      };
    }

    const token = authHeader.replace(/^Bearer\s+/, '').trim();
    if (!token || token === 'null' || token === 'undefined') {
      return { valid: false, error: 'Unauthorized: Invalid token format.' };
    }

    try {
      if (token.startsWith('bmm_jwt_')) {
        const raw = Buffer.from(token.replace('bmm_jwt_', ''), 'base64').toString('utf-8');
        const payload = JSON.parse(raw);
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return { valid: false, error: 'Unauthorized: Token has expired. Please sign in again.' };
        }
        return { valid: true, payload };
      }
      return { valid: false, error: 'Unauthorized: Invalid token signature or format.' };
    } catch {
      return { valid: false, error: 'Unauthorized: Corrupted token payload.' };
    }
  };

  return {
    name: 'mock-auth-and-booking-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // ─── 1. Authentication Endpoints ─────────────────────────────────────
        if (url.startsWith('/api/auth')) {
          res.setHeader('Content-Type', 'application/json');

          // POST /api/auth/login
          if (url === '/api/auth/login' && req.method === 'POST') {
            const body = await parseBody(req);
            const username = (body.username || body.email || '').trim();
            const password = (body.password || '').trim();

            if (!username || !password) {
              res.statusCode = 400;
              return res.end(
                JSON.stringify({ error: 'Username/email and password are required.' })
              );
            }

            // Credential validation: passwords must be >= 4 chars
            if (password.length < 4) {
              res.statusCode = 401;
              return res.end(
                JSON.stringify({ error: 'Invalid credentials. Password must be at least 4 characters.' })
              );
            }

            const token = generateToken(username);
            const user = {
              username: username.includes('@') ? username.split('@')[0] : username,
              email: username.includes('@') ? username : `${username}@bookmymovie.com`,
              role: 'user',
            };

            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                success: true,
                token,
                user,
                message: 'Authentication successful.',
              })
            );
          }

          // GET /api/auth/me
          if (url === '/api/auth/me' && req.method === 'GET') {
            const authHeader = req.headers['authorization'] || req.headers['Authorization'];
            const check = verifyTokenHeader(authHeader);

            if (!check.valid) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: check.error }));
            }

            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, user: check.payload }));
          }

          // POST /api/auth/logout
          if (url === '/api/auth/logout' && req.method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, message: 'Logged out successfully.' }));
          }

          // POST /api/auth/expire-token (Helper for testing expired token Requirement g)
          if (url === '/api/auth/expire-token' && req.method === 'POST') {
            const expiredToken = generateToken('test_expired_user', -3600);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, token: expiredToken }));
          }

          return next();
        }

        // ─── 2. Food Ordering Endpoints (Unit 4 - Experiment 4) ───────────────
        if (url.startsWith('/api/food')) {
          res.setHeader('Content-Type', 'application/json');

          // a) GET /api/food/menu (Public)
          if (url === '/api/food/menu' && req.method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, items: FOOD_MENU }));
          }

          // All Cart, Checkout & Orders endpoints below require Bearer token validation
          const authHeader = req.headers['authorization'] || req.headers['Authorization'];
          const check = verifyTokenHeader(authHeader);

          if (!check.valid) {
            res.statusCode = 401;
            return res.end(
              JSON.stringify({
                error: `${check.error} Access to Food Cart, Checkout, and Orders is strictly restricted to authenticated users.`,
              })
            );
          }

          const username = check.payload.username || 'default_user';
          if (!inMemoryFoodCarts[username]) {
            inMemoryFoodCarts[username] = [];
          }
          if (!inMemoryFoodOrders[username]) {
            inMemoryFoodOrders[username] = [];
          }

          // b) GET /api/food/cart (Protected)
          if (url === '/api/food/cart' && req.method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, cart: inMemoryFoodCarts[username] }));
          }

          // c) POST /api/food/cart (Protected: Add / Update Item)
          if (url === '/api/food/cart' && req.method === 'POST') {
            const body = await parseBody(req);
            const { itemId, name, price, emoji, quantity } = body;

            if (!itemId) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Item ID is required.' }));
            }

            const currentCart = inMemoryFoodCarts[username];
            const existingIdx = currentCart.findIndex((i) => i.itemId === itemId);

            if (existingIdx !== -1) {
              currentCart[existingIdx].quantity += (quantity || 1);
              if (currentCart[existingIdx].quantity <= 0) {
                currentCart.splice(existingIdx, 1);
              }
            } else {
              currentCart.push({
                itemId,
                name: name || 'Delicious Snack',
                price: Number(price) || 100,
                emoji: emoji || '🍿',
                quantity: quantity || 1,
              });
            }

            inMemoryFoodCarts[username] = currentCart;
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, cart: currentCart }));
          }

          // d) DELETE /api/food/cart/:id (Protected: Remove Item)
          if (url.startsWith('/api/food/cart/') && req.method === 'DELETE') {
            const itemId = decodeURIComponent(url.split('/')[4] || '');
            inMemoryFoodCarts[username] = (inMemoryFoodCarts[username] || []).filter(
              (i) => i.itemId !== itemId
            );
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, cart: inMemoryFoodCarts[username] }));
          }

          // e) DELETE /api/food/cart (Protected: Clear Cart)
          if (url === '/api/food/cart' && req.method === 'DELETE') {
            inMemoryFoodCarts[username] = [];
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, cart: [] }));
          }

          // f) POST /api/food/checkout (Protected: Place Order)
          if (url === '/api/food/checkout' && req.method === 'POST') {
            const body = await parseBody(req);
            const userCart = inMemoryFoodCarts[username] || [];

            if (userCart.length === 0) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Cannot checkout with an empty cart.' }));
            }

            const subtotal = userCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const gst = Math.round(subtotal * 0.05); // 5% GST on food
            const serviceFee = 20; // Cinema seat delivery fee
            const grandTotal = subtotal + gst + serviceFee;

            const orderId = `ORD-FOOD-${Math.floor(100000 + Math.random() * 900000)}`;
            const newOrder = {
              orderId,
              username,
              items: [...userCart],
              subtotal,
              gst,
              serviceFee,
              grandTotal,
              deliveryType: body.deliveryType || 'Seat Delivery',
              seatOrTableNumber: body.seatOrTableNumber || 'Seat A-04',
              paymentMethod: body.paymentMethod || 'UPI / Card',
              customerNotes: body.customerNotes || '',
              status: 'CONFIRMED',
              createdAt: new Date().toISOString(),
              confirmedAt: new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
            };

            inMemoryFoodOrders[username].unshift(newOrder);
            inMemoryFoodCarts[username] = []; // Clear cart upon successful order

            res.statusCode = 201;
            return res.end(
              JSON.stringify({
                success: true,
                orderId,
                order: newOrder,
                message: 'Food order placed successfully! Token authorization verified.',
              })
            );
          }

          // g) GET /api/food/orders (Protected: Order History)
          if (url === '/api/food/orders' && req.method === 'GET') {
            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                success: true,
                orders: inMemoryFoodOrders[username] || [],
              })
            );
          }

          return next();
        }

        // ─── 3. Protected Cinema Booking Endpoints (Unit 4 - Exp 3) ───────────
        if (url.startsWith('/api/bookings')) {
          res.setHeader('Content-Type', 'application/json');

          const authHeader = req.headers['authorization'] || req.headers['Authorization'];
          const check = verifyTokenHeader(authHeader);

          if (!check.valid) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ error: check.error }));
          }

          const urlParts = url.split('/');
          const bookingId = urlParts.length > 3 ? decodeURIComponent(urlParts[3]) : null;

          if (req.method === 'GET') {
            if (bookingId) {
              const found = inMemoryBookings.find(
                (b) => b.bookingId === bookingId || b.reference === bookingId
              );
              if (!found) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: `Booking ${bookingId} not found` }));
              }
              res.statusCode = 200;
              return res.end(JSON.stringify(found));
            }
            res.statusCode = 200;
            return res.end(JSON.stringify(inMemoryBookings));
          }

          if (req.method === 'POST') {
            const body = await parseBody(req);
            const newBooking = {
              ...body,
              status: 'CONFIRMED',
              createdAt: new Date().toISOString(),
            };
            inMemoryBookings.unshift(newBooking);
            res.statusCode = 201;
            return res.end(JSON.stringify(newBooking));
          }

          if (req.method === 'PUT') {
            const body = await parseBody(req);
            const idx = inMemoryBookings.findIndex(
              (b) => b.bookingId === bookingId || b.reference === bookingId
            );
            if (idx === -1) {
              inMemoryBookings.unshift(body);
              res.statusCode = 200;
              return res.end(JSON.stringify(body));
            }
            inMemoryBookings[idx] = {
              ...inMemoryBookings[idx],
              ...body,
              status: 'MODIFIED',
              updatedAt: new Date().toISOString(),
            };
            res.statusCode = 200;
            return res.end(JSON.stringify(inMemoryBookings[idx]));
          }

          if (req.method === 'DELETE') {
            const idx = inMemoryBookings.findIndex(
              (b) => b.bookingId === bookingId || b.reference === bookingId
            );
            if (idx !== -1) {
              inMemoryBookings[idx].status = 'CANCELLED';
              inMemoryBookings[idx].cancelledAt = new Date().toISOString();
            }
            res.statusCode = 200;
            return res.end(
              JSON.stringify({ success: true, bookingId, message: 'Booking cancelled' })
            );
          }

          return next();
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockApiPlugin()],
});
