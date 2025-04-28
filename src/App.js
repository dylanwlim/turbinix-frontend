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

// Page Components (Import all pages used in Routes)
import Splash from './Splash';
import Register from './Register';
import Login from './Login';
import FinanceDashboard from './FinanceDashboard'; // Main dashboard at /finance
import BudgetingTool from './BudgetingTool';
import Investments from './Investments'; // Assuming this component exists
import Documents from './Documents';
import Settings from './Settings'; // Assuming this component exists
import UpdatesHelp from './UpdatesHelp';
// Import other routes like ForgotPassword, ResetPassword etc. if they exist and are needed

// --- App Structure ---

// AppLayout: Determines layout based on route and authentication state
function AppLayout({ isAuthenticated, handleLogin, handleLogout }) {
  const location = useLocation();

  // Define public paths where Nav shouldn't show & FloatingPaths should show
  const publicAuthPaths = ["/", "/login", "/register"]; // Add others like /forgot-password if they exist
  const isPublicAuthPage = publicAuthPaths.includes(location.pathname) || location.pathname.startsWith('/reset-password'); // Example for paths with params

  // Determine visibility of layout components
  const showNav = isAuthenticated && !isPublicAuthPage;
  const showFloatingPaths = !isAuthenticated && isPublicAuthPage; // Show only on public pages when logged out

  return (
    // Main container for the entire app visual structure
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300 font-sans">

      {/* Floating Paths Background (Conditional) */}
      {showFloatingPaths && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-50 dark:opacity-100">
          {/* Render multiple instances for effect if desired */}
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      )}

      {/* Persistent UI Elements */}
      {showNav && <NavigationBar onLogout={handleLogout} />}
      <ThemeToggle /> {/* Always visible */}

      {/* Main Content Area (relative z-10 to be above background) */}
      <main className="relative z-10">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          {/* Redirect authenticated users away from public auth pages */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/finance" replace /> : <Splash />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/finance" replace /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/finance" replace /> : <Register />} />
          {/* Add other public routes (ForgotPassword, ResetPassword) here following the same pattern */}

          {/* Protected Routes */}
          {/* ProtectedRoute handles redirection to /login if not authenticated */}
          <Route path="/finance" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FinanceDashboard /></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute isAuthenticated={isAuthenticated}><BudgetingTool /></ProtectedRoute>} />
          <Route path="/investments" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Investments /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Documents /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Settings /></ProtectedRoute>} />
          <Route path="/updateshelp" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UpdatesHelp /></ProtectedRoute>} />
          {/* Add other protected routes like /billing if needed */}

          {/* Fallback Route */}
          {/* Redirects unknown paths: to dashboard if logged in, to splash if logged out */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/finance" : "/"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Main App Component - Manages Global State (Auth, Theme)
function App() {
  // Initialize auth state from localStorage (simple check for 'user' item)
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('user') !== null);

  // Login handler - sets auth state and stores user info
  // useCallback ensures this function identity is stable across re-renders
  const handleLogin = useCallback((username, fullName) => {
    localStorage.setItem('user', username); // Persist username
    if (fullName) {
        localStorage.setItem('fullName', fullName); // Persist full name
    }
    // Persist other relevant info if needed (e.g., email)
    // localStorage.setItem('email', email);
    setIsAuthenticated(true);
    // Navigation to '/finance' will happen via AppLayout's Navigate component after state update
  }, []);

  // Logout handler - clears auth state and removes user info
  const handleLogout = useCallback(() => {
    // Clear all potentially sensitive user data
    localStorage.removeItem('user');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
    localStorage.removeItem('authToken'); // Clear any token if used
    localStorage.removeItem('userData'); // Clear finance data
    localStorage.removeItem('budgetData'); // Clear budget data
    localStorage.removeItem('turbinixDocuments'); // Clear documents data

    sessionStorage.clear(); // Clear session storage as well

    setIsAuthenticated(false);
    // Navigation back to '/' (Splash) will happen automatically due to state change and Route logic
  }, []);

  // Effect to sync auth state if localStorage changes in another tab
  useEffect(() => {
    const syncLogout = event => {
      if (event.key === 'user' && event.newValue === null) {
        console.log('Detected logout from storage event');
        handleLogout(); // Trigger logout if user key is removed elsewhere
      }
       if (event.key === 'user' && event.newValue !== null && !isAuthenticated) {
         console.log('Detected login from storage event');
         // Optionally re-fetch user details if needed, or just set auth state
         setIsAuthenticated(true);
       }
    };

    window.addEventListener('storage', syncLogout);
    return () => {
      window.removeEventListener('storage', syncLogout);
    };
  }, [handleLogout, isAuthenticated]); // Add isAuthenticated dependency

  return (
    <ThemeProvider defaultTheme="dark" storageKey="turbinix-theme"> {/* Use a specific storage key */}
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