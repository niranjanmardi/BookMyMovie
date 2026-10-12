import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import authService from '../services/authService';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutSuccess,
  clearAuthError,
} from '../redux/authSlice';
import { clearBooking } from '../redux/bookingSlice';

const AuthContext = createContext();

const STORAGE_KEY_USERS = 'bm_users';
const ADMIN_USER = { username: 'admin', password: '1234' };

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch {
    // Ignore storage errors
  }
}

function obfuscate(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const reduxAuth = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize on mount and handle unauthorized 401/403 events from Axios
  useEffect(() => {
    const handleUnauthorized = (e) => {
      const msg = e.detail?.error || e.detail?.message || 'Session expired. Please log in again.';
      dispatch(logoutSuccess());
      dispatch(clearBooking());
      setError(msg);
    };

    window.addEventListener('bmm_auth_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('bmm_auth_unauthorized', handleUnauthorized);
    };
  }, [dispatch]);

  // Login handler using authService & Axios
  const login = useCallback(
    async (usernameOrEmail, password) => {
      const trimmedId = (usernameOrEmail || '').trim();
      const trimmedPass = (password || '').trim();

      if (!trimmedId || !trimmedPass) {
        const msg = 'Please enter both username/email and password.';
        setError(msg);
        return { success: false, message: msg };
      }

      setLoading(true);
      setError(null);
      dispatch(loginStart());

      try {
        const result = await authService.login({
          username: trimmedId,
          password: trimmedPass,
        });

        if (result.success) {
          dispatch(
            loginSuccess({
              token: result.token,
              user: result.user,
            })
          );
          setLoading(false);
          return { success: true, token: result.token, user: result.user };
        }

        dispatch(loginFailure(result.message));
        setError(result.message);
        setLoading(false);
        return { success: false, message: result.message };
      } catch (err) {
        const msg = err.message || 'Login request failed.';
        dispatch(loginFailure(msg));
        setError(msg);
        setLoading(false);
        return { success: false, message: msg };
      }
    },
    [dispatch]
  );

  // Logout handler
  const logout = useCallback(async () => {
    setLoading(true);
    await authService.logout();
    dispatch(logoutSuccess());
    dispatch(clearBooking());
    setError(null);
    setLoading(false);
  }, [dispatch]);

  // Register helper
  const register = useCallback((newUser, newPass, confirmPass) => {
    const trimmedUser = (newUser || '').trim();
    const trimmedPass = (newPass || '').trim();
    const trimmedConfirm = (confirmPass || '').trim();

    if (!trimmedUser || !trimmedPass || !trimmedConfirm) {
      return { success: false, message: 'All fields are required.' };
    }

    if (trimmedUser.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }

    if (trimmedPass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    if (trimmedPass !== trimmedConfirm) {
      return { success: false, message: 'Passwords do not match.' };
    }

    if (trimmedUser.toLowerCase() === ADMIN_USER.username.toLowerCase()) {
      return { success: false, message: 'That username is reserved.' };
    }

    const users = getStoredUsers();
    if (users.some((u) => u.username.toLowerCase() === trimmedUser.toLowerCase())) {
      return { success: false, message: 'Username already registered. Please log in.' };
    }

    users.push({ username: trimmedUser, password: obfuscate(trimmedPass) });
    saveStoredUsers(users);

    return { success: true };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    dispatch(clearAuthError());
  }, [dispatch]);

  const value = {
    token: reduxAuth.token,
    user: reduxAuth.user,
    username: reduxAuth.user?.username || '',
    isAuthenticated: reduxAuth.isAuthenticated,
    loading: loading || reduxAuth.loading,
    error: error || reduxAuth.error,
    login,
    logout,
    register,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export default AuthContext;
