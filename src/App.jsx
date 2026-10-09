import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MoviesPage from './pages/MoviesPage';
import BookingPage from './pages/BookingPage';
import SummaryPage from './pages/SummaryPage';
import NotFound from './pages/NotFound';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <div className="app-wrapper">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/"         element={<HomePage />}    />
                <Route path="/login"    element={<LoginPage />}   />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes (Authentication Required) */}
                <Route
                  path="/movies"
                  element={
                    <ProtectedRoute>
                      <MoviesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking"
                  element={
                    <ProtectedRoute>
                      <BookingPage />
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

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
