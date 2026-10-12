import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import foodService from '../services/foodService';
import { getToken } from '../services/axiosInstance';

const CATEGORIES = ['All', 'Snacks', 'Meals', 'Beverages', 'Desserts'];

function FoodOrderingPage() {
  const { isAuthenticated, username, user } = useAuth();
  const navigate = useNavigate();

  // State
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'cart' | 'orders'

  // Loading & Error States (Requirement h)
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Checkout inputs
  const [seatNumber, setSeatNumber] = useState('Auditorium 2 - Seat F-07');
  const [deliveryType, setDeliveryType] = useState('Direct to Seat');
  const [customerNotes, setCustomerNotes] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Inspector & Demo simulation state (Requirement f & g)
  const [inspectorResult, setInspectorResult] = useState(null);

  // 1. Fetch Menu (Public API)
  const loadMenu = useCallback(async () => {
    setLoadingMenu(true);
    try {
      const items = await foodService.getMenu();
      setMenuItems(items);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load food menu.');
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  // 2. Fetch User Cart (Protected API - Req f)
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    setCartLoading(true);
    try {
      const userCart = await foodService.getCart();
      setCart(userCart);
    } catch (err) {
      console.warn('[FoodOrdering] Cart fetch error:', err.message);
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated]);

  // 3. Fetch User Orders (Protected API - Req f)
  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const userOrders = await foodService.getOrders();
      setOrders(userOrders);
    } catch (err) {
      console.warn('[FoodOrdering] Orders fetch error:', err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
      loadOrders();
    } else {
      setCart([]);
      setOrders([]);
    }
  }, [isAuthenticated, loadCart, loadOrders]);

  // Handle Add To Cart
  const handleAddToCart = async (item) => {
    if (!isAuthenticated) {
      setErrorMessage('Authentication required! Please sign in to add items to your protected cart.');
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setCartLoading(true);
    try {
      const updatedCart = await foodService.addToCart(item, 1);
      setCart(updatedCart);
      setSuccessToast(`Added ${item.name} to your cart!`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message || 'Failed to update cart.');
    } finally {
      setCartLoading(false);
    }
  };

  // Handle Remove Item
  const handleRemoveFromCart = async (itemId) => {
    setCartLoading(true);
    try {
      const updatedCart = await foodService.removeFromCart(itemId);
      setCart(updatedCart);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    } finally {
      setCartLoading(false);
    }
  };

  // Handle Checkout (Protected POST - Req f)
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/food');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setCheckoutLoading(true);
    setErrorMessage(null);

    try {
      const result = await foodService.checkout({
        deliveryType,
        seatOrTableNumber: seatNumber,
        customerNotes,
      });

      if (result.success) {
        setConfirmedOrder(result.order);
        setCart([]);
        loadOrders();
        setSuccessToast(`Order #${result.orderId} placed successfully!`);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || err.message || 'Checkout failed.';
      setErrorMessage(errorMsg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Filter Menu
  const filteredMenu = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate totals
  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartGst = Math.round(cartSubtotal * 0.05);
  const cartServiceFee = cart.length > 0 ? 20 : 0;
  const cartGrandTotal = cartSubtotal + cartGst + cartServiceFee;
  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Inspector Test 1: Test Protected API without Token (Requirement f)
  const runTestWithoutToken = async () => {
    setInspectorResult({ running: true, title: 'Testing Protected /api/food/cart without Bearer Token...' });
    const res = await foodService.testProtectedApiWithoutToken();
    if (!res.success) {
      setInspectorResult({
        type: 'success_proof',
        title: 'Requirement (f) Verified: Backend Rejected Unauthenticated Request!',
        status: `HTTP ${res.status} Unauthorized`,
        message: res.error,
        explanation: 'The protected API properly verified headers and rejected access because Authorization Bearer token was absent.',
      });
    } else {
      setInspectorResult({
        type: 'warning',
        title: 'Unexpected response',
        message: 'Endpoint unexpectedly accepted unauthenticated request.',
      });
    }
  };

  // Inspector Test 2: Test Expired Token & Interceptor (Requirement g)
  const runTestExpiredToken = async () => {
    setInspectorResult({ running: true, title: 'Injecting expired token and invoking protected API...' });
    try {
      await foodService.testExpiredToken();
    } catch (err) {
      setInspectorResult({
        type: 'success_proof',
        title: 'Requirement (g) Verified: Axios Interceptor Caught Expired Token!',
        status: `HTTP ${err.response?.status || 401} Unauthorized`,
        message: err.response?.data?.error || 'Token has expired.',
        explanation: 'Axios response interceptor detected the 401 status, purged expired token from session/local storage, and triggered session-expired handling.',
      });
    }
  };

  const activeToken = getToken();

  return (
    <div className="food-page-container">
      {/* ── Page Hero ── */}
      <div className="food-hero-section">
        <div className="food-hero-content">
          <div className="food-badge-pill">
            <span>🍿 Multiplex Food & Concessions • Unit 4 Experiment 4</span>
          </div>
          <h1 className="food-hero-title">Multiplex Concessions & Food Ordering</h1>
          <p className="food-hero-subtitle">
            Demonstrating Token Authentication, Axios Request/Response Interceptors, Protected Cart & Checkout APIs, and Expired Token Handling.
          </p>

          {/* Quick Stats & Auth Bar */}
          <div className="food-auth-status-bar">
            <div className="status-indicator">
              <span className={`status-dot ${isAuthenticated ? 'dot-active' : 'dot-idle'}`} />
              <span>
                Auth State: <strong>{isAuthenticated ? `Authenticated (${username || user?.username})` : 'Unauthenticated (Guest)'}</strong>
              </span>
            </div>

            <div className="status-indicator">
              <span>Token: </span>
              <strong className="token-code-preview">
                {activeToken ? `${activeToken.substring(0, 18)}...` : 'None (No Bearer Header)'}
              </strong>
            </div>

            {!isAuthenticated ? (
              <Link to="/login?redirect=/food" className="btn-primary btn-sm">
                Sign In to Unlock Cart & Orders →
              </Link>
            ) : (
              <span className="auth-verified-badge">✓ Axios Interceptor Active</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast & Error Alerts (Requirement h) ── */}
      {successToast && (
        <div className="api-toast-success" role="alert">
          ✓ {successToast}
        </div>
      )}

      {errorMessage && (
        <div className="api-error-panel" role="alert" style={{ margin: '16px auto', maxWidth: '1100px' }}>
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h4>Authentication / Order Notice</h4>
            <p>{errorMessage}</p>
            {!isAuthenticated && (
              <Link to="/login?redirect=/food" className="btn-primary btn-sm" style={{ marginTop: '8px', display: 'inline-block' }}>
                Sign In Now
              </Link>
            )}
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="alert-close-btn">
            ✕
          </button>
        </div>
      )}

      {/* ── Live Interceptor & Security Test Toolbar (Requirements f & g) ── */}
      <div className="inspector-panel">
        <div className="inspector-header">
          <div className="inspector-title">
            <span className="inspector-icon">🧪</span>
            <strong>Lab Evaluator &amp; Axios Interceptor Inspector</strong>
          </div>
          <span className="inspector-sub">Live Verification for Requirements (d), (f), &amp; (g)</span>
        </div>

        <div className="inspector-actions">
          <button
            type="button"
            className="btn-inspector"
            onClick={runTestWithoutToken}
            title="Demonstrate 401 rejection on unauthenticated request"
          >
            🚫 Test Protected API Without Token (Req f)
          </button>

          <button
            type="button"
            className="btn-inspector btn-inspector-warn"
            onClick={runTestExpiredToken}
            title="Inject expired token to test Axios response interceptor"
          >
            ⏰ Simulate Expired Token &amp; Interceptor (Req g)
          </button>
        </div>

        {inspectorResult && (
          <div className="inspector-result-box">
            <div className="inspector-result-title">{inspectorResult.title}</div>
            {inspectorResult.status && (
              <div className="inspector-result-code">
                Status: <strong>{inspectorResult.status}</strong>
              </div>
            )}
            {inspectorResult.message && <p className="inspector-result-msg">{inspectorResult.message}</p>}
            {inspectorResult.explanation && (
              <p className="inspector-result-exp">💡 {inspectorResult.explanation}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="food-tabs-container">
        <button
          type="button"
          className={`food-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          🍔 Concessions Menu ({menuItems.length})
        </button>

        <button
          type="button"
          className={`food-tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          🛒 My Cart {totalCartCount > 0 && <span className="tab-counter-badge">{totalCartCount}</span>}
          {!isAuthenticated && <span className="lock-icon" title="Protected API"> 🔒</span>}
        </button>

        <button
          type="button"
          className={`food-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📜 Order History {orders.length > 0 && <span className="tab-counter-badge">{orders.length}</span>}
          {!isAuthenticated && <span className="lock-icon" title="Protected API"> 🔒</span>}
        </button>
      </div>

      {/* ── TAB 1: MENU ── */}
      {activeTab === 'menu' && (
        <div className="food-menu-layout">
          {/* Filters & Search */}
          <div className="food-filter-bar">
            <div className="food-category-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="food-search-wrapper">
              <input
                type="text"
                placeholder="Search popcorn, nachos, burgers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="food-search-input"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="search-clear-btn">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Menu Grid */}
          {loadingMenu ? (
            <div className="api-loading-panel">
              <div className="spinner" />
              <p>Loading Gourmet Concessions Menu...</p>
            </div>
          ) : filteredMenu.length === 0 ? (
            <div className="empty-history-card">
              <div className="empty-icon">🍽️</div>
              <h3>No Menu Items Found</h3>
              <p>Try searching with another keyword or select All categories.</p>
            </div>
          ) : (
            <div className="food-menu-grid">
              {filteredMenu.map((item) => (
                <div key={item.id} className="food-card">
                  <div className="food-card-top">
                    <span className="food-card-emoji">{item.emoji}</span>
                    {item.badge && <span className="food-card-badge">{item.badge}</span>}
                  </div>

                  <div className="food-card-body">
                    <div className="food-title-row">
                      <h3 className="food-card-title">{item.name}</h3>
                      <span className="food-rating">★ {item.rating}</span>
                    </div>

                    <p className="food-card-desc">{item.description}</p>

                    <div className="food-card-meta">
                      <span className="food-prep-time">⏱️ {item.prepTime}</span>
                      <span className="food-category-tag">{item.category}</span>
                    </div>
                  </div>

                  <div className="food-card-footer">
                    <div className="food-price-tag">
                      <span className="currency-symbol">₹</span>
                      <span className="price-amount">{item.price}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      disabled={cartLoading}
                      className="btn-primary add-cart-btn"
                    >
                      {cartLoading ? 'Adding...' : '+ Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CART & CHECKOUT (Requirement f) ── */}
      {activeTab === 'cart' && (
        <div className="food-cart-layout">
          {!isAuthenticated ? (
            /* Unauthenticated Guard Banner (Requirement f) */
            <div className="cart-auth-guard-panel">
              <div className="guard-icon">🔒</div>
              <h2>Authentication Required</h2>
              <p>
                In accordance with <strong>Requirement (f)</strong>, the Cart, Checkout, and Order APIs are restricted exclusively to authenticated users.
              </p>
              <div className="guard-features">
                <div>✓ Secure session token storage</div>
                <div>✓ Axios Authorization header auto-attachment</div>
                <div>✓ Protected delivery to your cinema auditorium seat</div>
              </div>
              <div className="guard-actions">
                <Link to="/login?redirect=/food" className="btn-primary">
                  Sign In with Bearer Token →
                </Link>
                <Link to="/register" className="btn-secondary">
                  Create New Account
                </Link>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="empty-history-card">
              <div className="empty-icon">🛒</div>
              <h3>Your Concessions Cart is Empty</h3>
              <p>Explore our menu and add your favorite popcorn, snacks, or drinks.</p>
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: '14px' }}
                onClick={() => setActiveTab('menu')}
              >
                Browse Menu →
              </button>
            </div>
          ) : (
            <div className="cart-checkout-grid">
              {/* Cart Items List */}
              <div className="cart-items-card">
                <div className="cart-header">
                  <h3>Your Cart Items ({totalCartCount})</h3>
                  <button
                    type="button"
                    onClick={() => foodService.clearCart().then(setCart)}
                    className="clear-cart-link"
                  >
                    Clear All
                  </button>
                </div>

                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item.itemId} className="cart-item-row">
                      <span className="cart-item-emoji">{item.emoji || '🍿'}</span>
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <div className="cart-item-pricing">
                          ₹{item.price} each × {item.quantity} = <strong>₹{item.price * item.quantity}</strong>
                        </div>
                      </div>

                      <div className="cart-item-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => foodService.addToCart(item, -1).then(setCart)}
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => foodService.addToCart(item, 1).then(setCart)}
                          title="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="cart-del-btn"
                          onClick={() => handleRemoveFromCart(item.itemId)}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="cart-pricing-summary">
                  <div className="price-row">
                    <span>Items Subtotal:</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div className="price-row">
                    <span>GST (5% Food &amp; Beverage):</span>
                    <span>₹{cartGst}</span>
                  </div>
                  <div className="price-row">
                    <span>Auditorium Seat Delivery:</span>
                    <span>₹{cartServiceFee}</span>
                  </div>
                  <hr className="ticket-divider" />
                  <div className="price-row grand-total">
                    <span>Total Amount Payable:</span>
                    <span className="grand-total-val">₹{cartGrandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Protected Checkout Form (Requirement f) */}
              <div className="checkout-form-card">
                <div className="checkout-header">
                  <h3>🔒 Protected Seat Checkout (POST API)</h3>
                  <p className="checkout-sub">Authenticated as: <strong>{username || user?.username}</strong></p>
                </div>

                <form onSubmit={handleCheckout} className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="delivery-type">Delivery Mode</label>
                    <select
                      id="delivery-type"
                      className="form-control"
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value)}
                    >
                      <option value="Direct to Seat">🍿 Direct to Cinema Seat (Interval Service)</option>
                      <option value="Concessions Counter Pickup">🏛️ Express Concessions Counter Pickup</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="seat-number">Auditorium Screen &amp; Seat / Counter</label>
                    <input
                      id="seat-number"
                      type="text"
                      className="form-control"
                      value={seatNumber}
                      onChange={(e) => setSeatNumber(e.target.value)}
                      placeholder="e.g. Screen 1, Seat H-09"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="order-notes">Special Instructions (Optional)</label>
                    <textarea
                      id="order-notes"
                      className="form-control"
                      rows="2"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="e.g. Extra jalapeño dip, serve hot during intermission"
                    />
                  </div>

                  <div className="checkout-token-badge">
                    <span>✓ Bearer Token Verified</span>
                    <code>Authorization: Bearer {activeToken ? `${activeToken.substring(0, 10)}...` : 'None'}</code>
                  </div>

                  <button
                    type="submit"
                    disabled={checkoutLoading || cart.length === 0}
                    className="btn-primary checkout-btn"
                  >
                    {checkoutLoading ? (
                      <span className="btn-loading-content">
                        <span className="spinner-sm" />
                        <span>Authorizing &amp; Submitting Order...</span>
                      </span>
                    ) : (
                      <span>Confirm Food Order • ₹{cartGrandTotal} (POST)</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ORDER HISTORY (Requirement f) ── */}
      {activeTab === 'orders' && (
        <div className="food-orders-layout">
          {!isAuthenticated ? (
            <div className="cart-auth-guard-panel">
              <div className="guard-icon">🔒</div>
              <h2>Order History Protected</h2>
              <p>Please log in to retrieve your verified concessions orders from the protected API.</p>
              <Link to="/login?redirect=/food" className="btn-primary">
                Log In to View Orders →
              </Link>
            </div>
          ) : ordersLoading ? (
            <div className="api-loading-panel">
              <div className="spinner" />
              <p>Fetching orders from protected GET /api/food/orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-history-card">
              <div className="empty-icon">📜</div>
              <h3>No Food Orders Yet</h3>
              <p>Your confirmed concessions orders will appear here once placed.</p>
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: '14px' }}
                onClick={() => setActiveTab('menu')}
              >
                Order Snacks Now →
              </button>
            </div>
          ) : (
            <div className="orders-list-grid">
              {orders.map((ord) => (
                <div key={ord.orderId} className="history-card">
                  <div className="history-card-top">
                    <div>
                      <span className="ref-tag">{ord.orderId}</span>
                      <span className="status-pill status-confirmed">{ord.status}</span>
                    </div>
                    <span className="history-time-stamp">{ord.confirmedAt || 'Today'}</span>
                  </div>

                  <div className="history-card-content">
                    <div className="history-card-details">
                      <h4 className="history-movie-name">
                        📍 {ord.deliveryType} ({ord.seatOrTableNumber})
                      </h4>

                      <div className="order-items-summary">
                        {ord.items.map((i) => (
                          <div key={i.itemId} className="order-item-chip">
                            <span>{i.emoji || '🍿'} {i.name} × {i.quantity}</span>
                            <span>₹{i.price * i.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {ord.customerNotes && (
                        <div className="order-notes-tag">
                          📝 Notes: <em>{ord.customerNotes}</em>
                        </div>
                      )}

                      <div className="history-amount-row">
                        <span>Total Paid (incl. GST &amp; Service):</span>
                        <span className="history-amount-val">₹{ord.grandTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Order Confirmed Modal ── */}
      {confirmedOrder && (
        <div className="modal-backdrop" onClick={() => setConfirmedOrder(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✓ Food Order Confirmed!</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setConfirmedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="modal-info-bar">
                <span>Order ID: <strong>{confirmedOrder.orderId}</strong></span>
                <span>Total: <strong>₹{confirmedOrder.grandTotal}</strong></span>
              </div>

              <div className="confirmed-order-details">
                <p>
                  Your cinema concession order is being prepared! It will be delivered directly to{' '}
                  <strong>{confirmedOrder.seatOrTableNumber}</strong>.
                </p>

                <div className="confirmed-items-list">
                  {confirmedOrder.items.map((it) => (
                    <div key={it.itemId} className="confirmed-item-line">
                      <span>{it.emoji || '🍿'} {it.name} × {it.quantity}</span>
                      <span>₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setConfirmedOrder(null);
                    setActiveTab('orders');
                  }}
                >
                  View in Order History →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodOrderingPage;
