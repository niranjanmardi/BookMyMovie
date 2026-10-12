import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Reusable ProtectedRoute Component for Unit 4 - Experiment 4
 * Guards private pages (Booking, Checkout, Payment, Booking History).
 * Redirects unauthenticated visitors to /login and saves current location in state
 * so the user is returned to their intended page immediately after login.
 */
function ProtectedRoute({ children, fallback = null }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      fallback || (
        <div className="protected-route-loading" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" />
          <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '14px' }}>
            Verifying authentication token...
          </p>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
