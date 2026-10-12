import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Reusable Login Component for Unit 4 - Experiment 4
 * Features:
 *  - Email / Username & Password fields
 *  - Form validation with error states
 *  - Loading indicator during authentication
 *  - Server error & expired session handling
 *  - Logout option when user is already authenticated
 */
function Login({ onSuccess, redirectTo }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { isAuthenticated, username, user, token, loading, error, login, logout, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine intended redirect path
  const params = new URLSearchParams(location.search);
  const isExpired = params.get('expired') === 'true';
  const redirectTarget = redirectTo || location.state?.from?.pathname || params.get('redirect') || '/movies';

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();

    // Client-side form validation
    if (!trimmedId) {
      setValidationError('Please enter your username or email address.');
      return;
    }

    if (trimmedId.length < 3) {
      setValidationError('Username or email must be at least 3 characters.');
      return;
    }

    if (!trimmedPass) {
      setValidationError('Please enter your password.');
      return;
    }

    if (trimmedPass.length < 4) {
      setValidationError('Password must be at least 4 characters long.');
      return;
    }

    const result = await login(trimmedId, trimmedPass);
    if (result.success) {
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(redirectTarget, { replace: true });
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    setIdentifier('');
    setPassword('');
  };

  // If already authenticated, show the authenticated user panel with a logout option
  if (isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-card authenticated-card">
          <div className="login-header">
            <div className="login-icon">👤</div>
            <h2 className="login-title">Account Active</h2>
            <p className="login-subtitle">You are currently authenticated</p>
          </div>

          <div className="auth-user-info-box">
            <div className="auth-user-row">
              <span className="auth-label">Username:</span>
              <span className="auth-value">{username || user?.username}</span>
            </div>
            {user?.email && (
              <div className="auth-user-row">
                <span className="auth-label">Email:</span>
                <span className="auth-value">{user.email}</span>
              </div>
            )}
            <div className="auth-user-row">
              <span className="auth-label">Token Status:</span>
              <span className="token-badge active">
                ✓ Bearer Token Verified ({token ? `${token.substring(0, 14)}...` : 'Stored'})
              </span>
            </div>
          </div>

          <div className="auth-card-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(redirectTarget, { replace: true })}
            >
              Continue to {redirectTarget === '/booking' ? 'Seat Booking' : 'Movies'} →
            </button>
            <button
              type="button"
              className="logout-btn-full"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? 'Logging Out...' : 'Log Out of Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Cinema Brand Header */}
        <div className="login-header">
          <div className="login-icon">🎬</div>
          <h2 className="login-title">BookMyMovie</h2>
          <p className="login-subtitle">Sign in to book reserved multiplex tickets</p>
        </div>

        {/* Expired Session Notice */}
        {isExpired && (
          <div className="warning-alert">
            <span>⏰</span>
            <span>Your session has expired. Please sign in again to continue.</span>
          </div>
        )}

        {/* Validation Error Alert */}
        {validationError && (
          <div className="error-alert">
            <span>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Server / API Error Alert */}
        {error && (
          <div className="error-alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-identifier">Username or Email</label>
            <input
              id="login-identifier"
              type="text"
              className="form-input"
              placeholder="e.g. admin or user@example.com"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (validationError) setValidationError('');
              }}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                placeholder="Enter password (min 4 chars)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationError) setValidationError('');
                }}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="spinner-sm" />
                <span>Authenticating...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demonstration credentials helper */}
        <div className="demo-credentials-hint">
          <p style={{ marginBottom: '8px' }}>
            <strong>Quick Demo Credentials:</strong>
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => {
                setIdentifier('foodie_user');
                setPassword('secret123');
                setValidationError('');
              }}
            >
              🍔 Foodie User (secret123)
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => {
                setIdentifier('admin');
                setPassword('1234');
                setValidationError('');
              }}
            >
              👑 Admin (1234)
            </button>
          </div>
        </div>

        {/* Register Account Switch */}
        <div className="auth-switch-link">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="link-accent">
              Create New Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
