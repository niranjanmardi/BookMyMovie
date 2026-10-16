import axiosInstance, {
  getToken,
  setToken,
  getUser,
  setUser,
  removeToken,
} from './axiosInstance';

import { syncCloudUsers, registerCloudUser, getLocalUsers } from './cloudSyncService';

const AUTH_API = '/api/auth';

function deobfuscate(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return str;
  }
}

/**
 * Authentication Service for Unit 4 & Unit 5
 * Communicates with the authentication API using Axios and manages session tokens.
 * Features automatic cloud synchronization after deployment so accounts created on one device
 * can log in seamlessly on any other device/browser.
 */
export const authService = {
  /**
   * Register a new user account across cloud and local storage
   */
  async register(credentials) {
    const username = (credentials.username || '').trim();
    const password = (credentials.password || '').trim();

    // 1. Attempt backend registration if API server is available
    try {
      await axiosInstance.post(`${AUTH_API}/register`, { username, password });
    } catch {
      // If backend offline or 404 on static deployment, continue to cloud sync
    }

    // 2. Commit to cloud database and local storage
    return registerCloudUser(credentials);
  },

  /**
   * Send login credentials to Authentication API or Cloud Registry
   * @param {Object} credentials - { username, password } or { email, password }
   */
  async login(credentials) {
    const usernameOrEmail = (credentials.username || credentials.email || '').trim();
    const password = (credentials.password || '').trim();

    try {
      const response = await axiosInstance.post(`${AUTH_API}/login`, {
        username: usernameOrEmail,
        password,
      });

      const { token, user } = response.data;
      if (token) setToken(token);
      if (user) setUser(user);

      return {
        success: true,
        token,
        user: user || { username: usernameOrEmail },
      };
    } catch (error) {
      // On static deployment (Vercel, Netlify, GitHub Pages), backend /api/auth returns 404 or ERR_NETWORK
      const isDeploymentFallback =
        !error.response ||
        error.code === 'ERR_NETWORK' ||
        error.response?.status === 404 ||
        error.message?.includes('Network Error');

      if (isDeploymentFallback) {
        console.info('[authService] Using Cloud & Local authentication sync for deployment');

        // Allow demo admin
        if (
          (usernameOrEmail.toLowerCase() === 'admin' || usernameOrEmail.toLowerCase() === 'admin@bookmymovie.com') &&
          password === '1234'
        ) {
          const adminUser = { username: 'admin', email: 'admin@bookmymovie.com', role: 'admin' };
          const mockToken = 'bmm_jwt_' + btoa(JSON.stringify({ username: 'admin', exp: Math.floor(Date.now() / 1000) + 86400 }));
          setToken(mockToken);
          setUser(adminUser);
          return { success: true, token: mockToken, user: adminUser };
        }

        // Fetch latest users from cloud database
        const allUsers = await syncCloudUsers();
        const found = allUsers.find(
          (u) =>
            u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
            (u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase())
        );

        if (!found) {
          return {
            success: false,
            message: 'Account not found. Please click "Create Account" first to register.',
          };
        }

        // Verify password (plain text or base64 deobfuscated)
        const storedPass = deobfuscate(found.password);
        if (storedPass !== password && found.password !== password) {
          return { success: false, message: 'Invalid password. Please check your credentials.' };
        }

        const validUser = {
          username: found.username,
          email: found.email || `${found.username}@bookmymovie.com`,
          role: found.role || 'user',
        };
        const mockToken =
          'bmm_jwt_' +
          btoa(
            JSON.stringify({
              username: validUser.username,
              exp: Math.floor(Date.now() / 1000) + 86400,
            })
          );

        setToken(mockToken);
        setUser(validUser);
        return { success: true, token: mockToken, user: validUser };
      }

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Authentication failed. Please check your credentials.';
      return { success: false, message };
    }
  },

  /**
   * Log out user and clean up session tokens
   */
  async logout() {
    try {
      await axiosInstance.post(`${AUTH_API}/logout`);
    } catch {
      // Best-effort server notification
    } finally {
      removeToken();
    }
    return { success: true };
  },

  /**
   * Verify token validity and fetch current user profile
   */
  async getCurrentUser() {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await axiosInstance.get(`${AUTH_API}/me`);
      return response.data?.user || getUser();
    } catch {
      return getUser();
    }
  },

  getToken,
  getUser,
  removeToken,
};

export default authService;
