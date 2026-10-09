import React, { createContext, useState } from 'react';

// Create AuthContext
const AuthContext = createContext();

// ─── Storage Keys ───────────────────────────────────────────────────────────
const STORAGE_KEY_USERS    = 'bm_users';
const STORAGE_KEY_AUTH_USER = 'auth_user';
const STORAGE_KEY_AUTH_STATUS = 'auth_status';

// ─── Built-in admin account ─────────────────────────────────────────────────
// NOTE: This is a demonstration project only.
// Plain-text / obfuscated passwords in localStorage are NOT secure for
// production applications. Use a proper backend with hashed credentials.
const ADMIN_USER = { username: 'admin', password: '1234' };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

// Simple obfuscation (Base64) – NOT cryptographically secure.
// For a real app, use bcrypt/argon2 on a server; never store real passwords
// in the browser.
function obfuscate(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function deobfuscate(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return '';
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────
function AuthProvider({ children }) {
  const [username, setUsername] = useState(() =>
    localStorage.getItem(STORAGE_KEY_AUTH_USER) || ''
  );

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem(STORAGE_KEY_AUTH_STATUS) === 'true'
  );

  // ── Register ──────────────────────────────────────────────────────────────
  const register = (newUser, newPass, confirmPass) => {
    const trimmedUser = newUser.trim();
    const trimmedPass = newPass.trim();
    const trimmedConfirm = confirmPass.trim();

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

    // Check against built-in admin
    if (trimmedUser.toLowerCase() === ADMIN_USER.username.toLowerCase()) {
      return { success: false, message: 'That username is already taken. Please choose another.' };
    }

    // Check against registered users
    const users = getStoredUsers();
    const exists = users.some(
      (u) => u.username.toLowerCase() === trimmedUser.toLowerCase()
    );

    if (exists) {
      return { success: false, message: 'That username is already registered. Please log in.' };
    }

    // Save new user
    users.push({ username: trimmedUser, password: obfuscate(trimmedPass) });
    saveStoredUsers(users);

    return { success: true };
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = (inputUser, inputPass) => {
    const trimmedUser = inputUser.trim();
    const trimmedPass = inputPass.trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, message: 'Please enter both username and password.' };
    }

    // Check admin
    if (
      trimmedUser === ADMIN_USER.username &&
      trimmedPass === ADMIN_USER.password
    ) {
      setUsername(trimmedUser);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY_AUTH_USER, trimmedUser);
      localStorage.setItem(STORAGE_KEY_AUTH_STATUS, 'true');
      return { success: true };
    }

    // Check registered users
    const users = getStoredUsers();
    const match = users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUser.toLowerCase() &&
        deobfuscate(u.password) === trimmedPass
    );

    if (match) {
      setUsername(match.username);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY_AUTH_USER, match.username);
      localStorage.setItem(STORAGE_KEY_AUTH_STATUS, 'true');
      return { success: true };
    }

    return { success: false, message: 'Incorrect username or password.' };
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    setUsername('');
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.removeItem(STORAGE_KEY_AUTH_STATUS);
  };

  const value = { username, isAuthenticated, register, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
