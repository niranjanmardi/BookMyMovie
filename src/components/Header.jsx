import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

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
        {/* Left Side: Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎬</span>
          <span className="brand-text">BookMyMovie</span>
        </Link>

        {/* Right Side: Navigation Links */}
        <nav>
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

            {!isAuthenticated ? (
              /* When Logged Out: Show Home & Login */
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Login
                </NavLink>
              </li>
            ) : (
              /* When Logged In: Show Movies, Booking, Summary & Logout */
              <>
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
                    to="/booking"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Booking
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/summary"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Summary
                  </NavLink>
                </li>
                <li className="user-nav-item">
                  <span className="user-chip">👤 {username}</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="logout-btn"
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
