// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Core Components & Context
import { ThemeProvider } from './theme-provider'; // Handles dark/light mode
import ProtectedRoute from './ProtectedRoute'; // Handles redirect if not authenticated

// Layout Components
import NavigationBar from './NavigationBar'; // The main nav bar for authenticated users
import FloatingPaths from './FloatingPaths'; // Animated background for public pages
import ThemeToggle from './ThemeToggle';     // Global theme toggle button

// Page Components
import Splash from './Splash';
import Register from './Register';
import Login from './Login';
import FinanceDashboard from './FinanceDashboard';
import BudgetingTool from './BudgetingTool';
import Investments from './Investments';
import Documents from './Documents';
import Settings from './Settings';
import UpdatesHelp from './UpdatesHelp';
import PrivacyPolicy from './privacy'; // ✅ NEW
import TermsOfService from './terms';  // ✅ NEW

function AppLayout({ isAuthenticated, handleLogin, handleLogout }) {
  const location = useLocation();

  const publicAuthPaths = ["/", "/login", "/register"];
  const isPublicAuthPage = publicAuthPaths.includes(location.pathname) || location.pathname.startsWith('/reset-password');

  const showNav = isAuthenticated && !isPublicAuthPage;
  const showFloatingPaths = !isAuthenticated && isPublicAuthPage;

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300 font-sans">
      {showFloatingPaths && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-50 dark:opacity-100">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      )}

      {showNav && <NavigationBar onLogout={handleLogout} />}
      <ThemeToggle />

      <main className="relative z-10">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/finance" replace /> : <Splash />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/finance" replace /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/finance" replace /> : <Register />} />
          <Route path="/privacy" element={<PrivacyPolicy />} /> {/* ✅ NEW */}
          <Route path="/terms" element={<TermsOfService />} />  {/* ✅ NEW */}

          {/* Protected Routes */}
          <Route path="/finance" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FinanceDashboard /></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute isAuthenticated={isAuthenticated}><BudgetingTool /></ProtectedRoute>} />
          <Route path="/investments" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Investments /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Documents /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Settings /></ProtectedRoute>} />
          <Route path="/updateshelp" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UpdatesHelp /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/finance" : "/"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('user') !== null);

  const handleLogin = useCallback((username, fullName) => {
    localStorage.setItem('user', username);
    if (fullName) localStorage.setItem('fullName', fullName);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('budgetData');
    localStorage.removeItem('turbinixDocuments');
    sessionStorage.clear();
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const syncLogout = event => {
      if (event.key === 'user' && event.newValue === null) {
        console.log('Detected logout from storage event');
        handleLogout();
      }
      if (event.key === 'user' && event.newValue !== null && !isAuthenticated) {
        console.log('Detected login from storage event');
        setIsAuthenticated(true);
      }
    };
    window.addEventListener('storage', syncLogout);
    return () => {
      window.removeEventListener('storage', syncLogout);
    };
  }, [handleLogout, isAuthenticated]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="turbinix-theme">
      <Router>
        <AppLayout
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
