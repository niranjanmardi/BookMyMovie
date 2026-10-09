import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function LoginPage() {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [errorMessage, setErrorMessage]   = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect immediately to /movies
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/movies', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    const result = login(usernameInput, passwordInput);
    if (result.success) {
      navigate('/movies');
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Cinema Brand Header */}
        <div className="login-header">
          <div className="login-icon">🎬</div>
          <h2 className="login-title">BookMyMovie</h2>
          <p className="login-subtitle">Sign in to book your movie tickets</p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="error-alert">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="Enter username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
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
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoComplete="current-password"
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

          <button type="submit" className="btn-primary login-btn">
            Sign In
          </button>
        </form>

        {/* Link to Register */}
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

export default LoginPage;
