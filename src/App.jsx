import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Core Shell Components (loaded eagerly for instant UI header/footer)
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// ==============================================================================
// Experiment 2: Code Splitting & Lazy Loading (Requirements a & b)
// All route-level components are code-split into distinct JS chunks
// using React.lazy() and dynamic import().
// They are downloaded over the network ONLY when the user navigates to them!
// ==============================================================================
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-wrapper">
          <Header />
          <main className="main-content" id="main-content">
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
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
