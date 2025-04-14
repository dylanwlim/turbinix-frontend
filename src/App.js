// src/App.js
import React, { useState, useEffect } from 'react';
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
import ThemeToggle from './ThemeToggle';
import ProtectedRoute from './ProtectedRoute';
import NavigationBar from './NavigationBar';
import FloatingPaths from './FloatingPaths';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';


function AppContent({ isAuthenticated, handleLogin, handleLogout, darkMode, toggleDarkMode }) {
  const location = useLocation();
  const showFloating = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition duration-300">
      {isAuthenticated && <NavigationBar onLogout={handleLogout} />}
      <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

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
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        <Route path="/hub" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProjectHub /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute isAuthenticated={isAuthenticated}><BudgetingTool /></ProtectedRoute>} />
        <Route path="/real-estate" element={<ProtectedRoute isAuthenticated={isAuthenticated}><RealEstate /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Documents /></ProtectedRoute>} />
        <Route path="/updates" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UpdatesHelp /></ProtectedRoute>} />
        <Route path="/lookup" element={<ProtectedRoute isAuthenticated={isAuthenticated}><RealEstateLookup /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('user') !== null);

  useEffect(() => {
    const html = document.querySelector('html');
    darkMode ? html.classList.add('dark') : html.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
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
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    </Router>
  );
}

export default App;
