import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import BookMyMovieIcon from './BookMyMovieIcon';

function Header() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo with Custom BookMyMovie Icon */}
        <Link to="/" className="navbar-brand" aria-label="BookMyMovie Home">
          <BookMyMovieIcon size={34} className="navbar-bmm-icon" />
          <span className="brand-text">Book<span className="brand-text-accent">My</span>Movie</span>
        </Link>

        {/* Navigation Menu */}
        <nav aria-label="Main Navigation">
          <ul className="navbar-links">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/movies"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Movies
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/food"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                🍿 Food Ordering
              </NavLink>
            </li>

            {/* My Bookings link */}
            <li>
              <NavLink
                to="/summary"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                My Bookings
              </NavLink>
            </li>

            {/* PWA Ready Indicator (Requirement d) */}
            <li className="pwa-nav-item">
              <span className="pwa-indicator-pill" title="PWA Enabled • Offline Ready & Installable">
                <span className="pwa-dot" aria-hidden="true"></span>
                <span>PWA</span>
              </span>
            </li>

            {!isAuthenticated ? (
              /* When Logged Out */
              <>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/register"
                    className={({ isActive }) => `nav-link nav-register-btn ${isActive ? 'active' : ''}`}
                  >
                    Register
                  </NavLink>
                </li>
              </>
            ) : (
              /* When Logged In */
              <>
                <li>
                  <NavLink
                    to="/booking"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Seat Booking
                  </NavLink>
                </li>

                <li className="user-nav-item">
                  <span className="user-chip" title={`Signed in as ${username}`}>
                    <span className="user-avatar-icon">👤</span>
                    <span className="user-name-text">{username}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="logout-btn"
                    title="Sign out of account"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
