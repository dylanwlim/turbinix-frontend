// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import ThemeToggle from './ThemeToggle';
import ProtectedRoute from './ProtectedRoute';
import NavigationBar from './NavigationBar';
import FloatingPaths from './FloatingPaths';
import Billing from './Billing'; // ✅ NEW Billing Page
import { ThemeProvider } from './theme-provider';

function AppContent({ isAuthenticated, handleLogin, handleLogout }) {
  const location = useLocation();
  const showFloating = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition duration-300">
      {isAuthenticated && <NavigationBar onLogout={handleLogout} />}
      <ThemeToggle />

      <AnimatePresence mode="wait">
        {showFloating && (
          <motion.div
            key="floating"
            className="fixed inset-0 pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/hub" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProjectHub /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute isAuthenticated={isAuthenticated}><BudgetingTool /></ProtectedRoute>} />
        <Route path="/real-estate" element={<ProtectedRoute isAuthenticated={isAuthenticated}><RealEstate /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Documents /></ProtectedRoute>} />
        <Route path="/updates" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UpdatesHelp /></ProtectedRoute>} />
        <Route path="/lookup" element={<ProtectedRoute isAuthenticated={isAuthenticated}><RealEstateLookup /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Billing /></ProtectedRoute>} /> {/* ✅ Billing Route */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('user') !== null);

  const handleLogin = (username, fullName) => {
    localStorage.setItem('user', username);
    if (fullName) localStorage.setItem('fullName', fullName);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('fullName');
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
