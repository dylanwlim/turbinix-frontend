// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import { AnimatePresence } from 'framer-motion'; // Keep if used for page transitions
import ProjectHub from './ProjectHub';
import FinanceDashboard from './FinanceDashboard';
import BudgetingTool from './BudgetingTool';
import RealEstate from './RealEstate';
import Documents from './Documents';
import Login from './Login';
import Splash from './Splash';
import Register from './Register';
import UpdatesHelp from './UpdatesHelp';
import RealEstateLookup from './RealEstateLookup';
import ThemeToggle from './ThemeToggle';
import ProtectedRoute from './ProtectedRoute';
import NavigationBar from './NavigationBar';
import FloatingPaths from './FloatingPaths'; // Import FloatingPaths
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Billing from './Billing'; // Corrected import name
import { ThemeProvider } from './theme-provider';

// Main content component handling layout conditional rendering
function AppContent({ isAuthenticated, handleLogin, handleLogout }) {
  const location = useLocation();
  // Define public routes where FloatingPaths should ALWAYS be visible
  const publicPaths = ["/", "/login", "/register", "/forgot-password"];
  const isPublicAuthPage = publicPaths.includes(location.pathname) || location.pathname.startsWith('/reset-password');

  // Show Nav only if authenticated
  const showNav = isAuthenticated;

  // Define target dashboard route
  const dashboardRoute = "/finance"; // Or "/hub"

  return (
    // Main container for the entire app visual structure
    <div className="relative min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Render Persistent Components Outside Routes */}
      {showNav && <NavigationBar onLogout={handleLogout} />}
      <ThemeToggle /> {/* Render ThemeToggle globally */}

      {/* FloatingPaths: Render ONLY based on route, NOT auth state */}
      {/* This will be visible on these pages regardless of login status */}
      {isPublicAuthPage && (
         <div className="fixed inset-0 pointer-events-none z-0">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
         </div>
      )}

      {/* --- Routes --- */}
      <Routes location={location} key={location.pathname}>
        {/* Public routes: Pass isAuthenticated, handle redirect internally */}
        {/* NO immediate redirect here */}
        <Route path="/" element={<Splash isAuthenticated={isAuthenticated} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} isAuthenticated={isAuthenticated} />} />
        <Route path="/register" element={<Register isAuthenticated={isAuthenticated} />} />
        <Route path="/forgot-password" element={<ForgotPassword isAuthenticated={isAuthenticated} />} />
        <Route path="/reset-password/:token" element={<ResetPassword isAuthenticated={isAuthenticated} />} />

        {/* Protected Routes (Unchanged) */}
        <Route path="/hub" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProjectHub /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute isAuthenticated={isAuthenticated}><BudgetingTool showFullDashboard /></ProtectedRoute>} />
        <Route path="/real-estate" element={<ProtectedRoute isAuthenticated={isAuthenticated}><RealEstate /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Documents /></ProtectedRoute>} />
        <Route path="/updates" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UpdatesHelp /></ProtectedRoute>} />
        <Route path="/lookup" element={<ProtectedRoute isAuthenticated={isAuthenticated}><RealEstateLookup /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Billing /></ProtectedRoute>} />

        {/* Fallback */}
        {/* Fallback still needs immediate redirect based on auth state */}
        <Route path="*" element={<Navigate to={isAuthenticated ? dashboardRoute : "/"} replace />} />
      </Routes>
    </div>
  );
}

// Main App component managing authentication state (Unchanged)
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('user') !== null);

  const handleLogin = (username, fullName, rememberMe) => {
    // TODO: Fully implement rememberMe logic with localStorage/sessionStorage if needed
    localStorage.setItem('user', username);
    if (fullName) localStorage.setItem('fullName', fullName);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('fullName');
    sessionStorage.removeItem('user'); // Clear session just in case
    sessionStorage.removeItem('fullName');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      <Router>
        <AppContent
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;