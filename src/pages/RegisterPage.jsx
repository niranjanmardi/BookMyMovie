import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function RegisterPage() {
  const [usernameInput,  setUsernameInput]  = useState('');
  const [passwordInput,  setPasswordInput]  = useState('');
  const [confirmInput,   setConfirmInput]   = useState('');
  const [showPassword,   setShowPassword]   = useState(false);
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [errorMessage,   setErrorMessage]   = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to /movies
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/movies', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const result = register(usernameInput, passwordInput, confirmInput);

    if (result.success) {
      setSuccessMessage(
        '🎉 Account created successfully! Redirecting to login…'
      );
      // Redirect to login after a short delay so the user sees the message
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="login-icon">🎟️</div>
          <h2 className="login-title">Create Account</h2>
          <p className="login-subtitle">Join BookMyMovie and start booking tickets</p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="error-alert">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="success-alert">
            <span>{successMessage}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="login-form">

          {/* Username */}
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              className="form-input"
              placeholder="Choose a username (min. 3 chars)"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              autoComplete="username"
              disabled={!!successMessage}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                placeholder="Create a password (min. 4 chars)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoComplete="new-password"
                disabled={!!successMessage}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                className="form-input password-input"
                placeholder="Re-enter your password"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                autoComplete="new-password"
                disabled={!!successMessage}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={!!successMessage}
          >
            Create Account
          </button>
        </form>

        {/* Link to Login */}
        <div className="auth-switch-link">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link-accent">
              Sign In
            </Link>
          </p>
        </div>

        {/* Demo note */}
        <div className="demo-note">
          <span>ℹ️</span>
          <span>
            Accounts are stored locally for this college project demo only. Not
            for production use.
          </span>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;
