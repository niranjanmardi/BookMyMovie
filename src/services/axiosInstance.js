import axios from 'axios';

export const TOKEN_KEY = 'bmm_auth_token';
export const USER_KEY = 'bmm_auth_user';

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token, persist = false) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TOKEN_KEY, token);
  if (persist) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setUser = (user, persist = false) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  if (persist) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Creates an expired mock JWT token to explicitly demonstrate
 * Experiment 4 requirement (g): Handling expired tokens & 401 errors.
 */
export const injectExpiredTokenForTesting = () => {
  const expiredPayload = {
    username: 'test_user',
    email: 'test@foodorder.com',
    role: 'user',
    exp: Math.floor(Date.now() / 1000) - 1800, // Expired 30 minutes ago
  };
  const expiredToken = 'bmm_jwt_' + btoa(JSON.stringify(expiredPayload));
  setToken(expiredToken);
  return expiredToken;
};

// Create configured Axios instance
const axiosInstance = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

/**
 * Request Interceptor: Attach authentication token to outgoing requests
 * Requirement (d): Attach the token to API requests using Axios configuration or interceptors.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Intercept 401/403 status responses
 * Requirement (g): Handle authentication errors and expired tokens.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    if (status === 401 || status === 403) {
      // Remove invalid or expired token
      removeToken();

      if (typeof window !== 'undefined') {
        const errorDetail = error.response?.data || {
          message: 'Session has expired or authentication token is missing. Please sign in again.',
        };

        // Notify app components via custom event
        window.dispatchEvent(
          new CustomEvent('bmm_auth_unauthorized', { detail: errorDetail })
        );

        // Redirect to login if user is not already on login page
        if (!window.location.pathname.startsWith('/login')) {
          const redirectPath = encodeURIComponent(
            window.location.pathname + window.location.search
          );
          window.location.href = `/login?redirect=${redirectPath}&expired=true`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
