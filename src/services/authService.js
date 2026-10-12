import axiosInstance, {
  getToken,
  setToken,
  getUser,
  setUser,
  removeToken,
} from './axiosInstance';

const AUTH_API = '/api/auth';

/**
 * Authentication Service for Unit 4 - Experiment 4
 * Communicates with the authentication API using Axios and manages session tokens.
 */
export const authService = {
  /**
   * Send login credentials to Authentication API
   * @param {Object} credentials - { username, password } or { email, password }
   */
  async login(credentials) {
    const usernameOrEmail = credentials.username || credentials.email || '';
    const password = credentials.password || '';

    try {
      const response = await axiosInstance.post(`${AUTH_API}/login`, {
        username: usernameOrEmail,
        password,
      });

      const { token, user } = response.data;
      if (token) {
        setToken(token);
      }
      if (user) {
        setUser(user);
      }

      return {
        success: true,
        token,
        user: user || { username: usernameOrEmail },
      };
    } catch (error) {
      // Local development mock fallback when backend server is offline
      if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'))) {
        console.warn('[authService] Backend offline - running local mock authentication fallback');
        if (password.length >= 4) {
          const fallbackUser = {
            username: usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail,
            email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@bookmymovie.com`,
            role: 'user',
          };
          const mockToken =
            'bmm_jwt_' +
            btoa(
              JSON.stringify({
                username: fallbackUser.username,
                exp: Math.floor(Date.now() / 1000) + 3600,
              })
            );

          setToken(mockToken);
          setUser(fallbackUser);
          return { success: true, token: mockToken, user: fallbackUser };
        }
        return { success: false, message: 'Invalid credentials. Password must be at least 4 characters.' };
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
