import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


import { AuthProvider } from './context/AuthContext';
  
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

const HomePage         = lazy(() => import('./pages/HomePage'));
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/RegisterPage'));
const MoviesPage       = lazy(() => import('./pages/MoviesPage'));
const MovieDetailsPage = lazy(() => import('./pages/MovieDetailsPage')); // Lazy Loaded (Req a)
const BookingPage      = lazy(() => import('./pages/BookingPage'));      // Seat-Selection Page (Req a)
const SummaryPage      = lazy(() => import('./pages/SummaryPage'));
const FoodOrderingPage = lazy(() => import('./pages/FoodOrderingPage'));
const NotFound         = lazy(() => import('./pages/NotFound'));

import './App.css';

// Accessible loading fallback shown while downloading the lazy-loaded chunk
function RouteLoadingFallback() {
  return (
    <div
      className="route-loading-container"
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <div className="loading-spinner"></div>
      <p className="route-loading-text">
        ⚡ Code Splitting: Loading page chunk on demand...
      </p>
    </div>
  );
}

// Error Boundary to prevent white screen if chunk download or runtime error occurs
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('AppErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="error-fallback-view"
          role="alert"
          style={{
            maxWidth: '600px',
            margin: '80px auto',
            padding: '32px',
            backgroundColor: '#171920',
            border: '1px solid #dc2626',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#f3f4f6',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
          <h2 style={{ fontSize: '22px', color: '#f87171', marginBottom: '12px' }}>
            Oops! An error occurred loading this page.
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
            {this.state.error?.message || 'A network hiccup or stale browser cache interrupted page loading.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              padding: '12px 28px',
              backgroundColor: '#e50914',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            Reload Cinema App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-wrapper">
          <Header />
          <main className="main-content" id="main-content">
            <AppErrorBoundary>
              {/* Suspense boundary for lazy-loaded route components */}
              <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                {/* Public Routes: Home, Movie Browsing, Auth, Food Concessions */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/movies/:id" element={<MovieDetailsPage />} />
                <Route path="/food" element={<FoodOrderingPage />} />

                {/* Seat Selection & Booking Routes (Lazy Loaded - Req a & b) */}
                <Route
                  path="/booking"
                  element={
                    <ProtectedRoute>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seat-selection"
                  element={
                    <ProtectedRoute>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes (Authentication & Bearer Token Required) */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <FoodOrderingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/food/orders"
                  element={
                    <ProtectedRoute>
                      <FoodOrderingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/summary"
                  element={
                    <ProtectedRoute>
                      <SummaryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <SummaryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <SummaryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking-history"
                  element={
                    <ProtectedRoute>
                      <SummaryPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </AppErrorBoundary>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
