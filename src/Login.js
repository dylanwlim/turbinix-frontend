// src/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Use Link for external-like pages
import { motion } from 'framer-motion';
// ThemeToggle is rendered globally via App.js

function Login({ onLogin, isAuthenticated }) {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false); // Restore remember me state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dashboardRoute = "/finance"; // Main dashboard route

  const API_URL = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

  // Redirect authenticated users
  useEffect(() => {
    let redirectTimerId = null;
    if (isAuthenticated) {
      redirectTimerId = setTimeout(() => {
        navigate(dashboardRoute, { replace: true });
      }, 300);
    }
    return () => {
      if (redirectTimerId) {
        clearTimeout(redirectTimerId);
      }
    };
  }, [isAuthenticated, navigate, dashboardRoute]);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Handle "Remember Me" checkbox
  const handleRememberChange = (e) => {
    setRememberMe(e.target.checked);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // Extract user info
        const username = data.username || data.user?.username;
        const firstName = data.first_name || data.user?.first_name || '';
        const lastName = data.last_name || data.user?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();

        if (!username || !fullName) {
            console.error("Missing user data in login response:", data);
            setError("Login successful, but user data is incomplete.");
            setLoading(false);
            return;
        }
        // Pass rememberMe state if needed by onLogin
        onLogin(username, fullName, rememberMe);

      } else {
        setError(data.message || data.error || 'Invalid username/email or password.');
      }
    } catch (err) {
      console.error("Login API call failed:", err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main container: Updated background blur to match Register.js
    <div className="relative flex items-center justify-center min-h-screen bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm px-4 py-12 overflow-hidden transition-colors duration-300">
      {/* FloatingPaths effect handled globally in App.js */}

      {/* Animated Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md p-8 bg-white/80 dark:bg-black/60 backdrop-blur-lg rounded-2xl border border-zinc-200 dark:border-white/10 shadow-xl"
      >
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-zinc-900 dark:text-white mb-6 glow-text-alt">
          Log In to Turbinix
        </h1>

        {/* Error Message Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700/50 text-red-800 dark:text-red-300 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier Input */}
          <div>
            <input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="Username or Email"
              value={form.identifier}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none transition duration-150 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm"
            />
          </div>

          {/* Password Input */}
          <div>
            <input
              type="password"
              id="login-password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none transition duration-150 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm"
            />
          </div>

          {/* Options Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 pb-1 text-sm">
             {/* Remember Me Checkbox (Restored) */}
             <label htmlFor="rememberMe" className="flex items-center text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
               <input
                 type="checkbox"
                 id="rememberMe"
                 name="rememberMe"
                 checked={rememberMe}
                 onChange={handleRememberChange}
                 className="mr-2 h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500 dark:bg-zinc-700"
               />
               Remember Me
             </label>
            <button
              type="button" // Important: prevent form submission
              onClick={() => navigate('/forgot-password')} // Navigate to forgot password route
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-lg font-semibold transition duration-200 ease-in-out hover:scale-[1.03] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              // Loading Spinner
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </div>
            ) : 'Log In'}
          </button>
        </form>

        {/* Sign Up & Back Links */}
        <div className="text-center mt-6 text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
          <button
            onClick={() => navigate('/register')} // Use navigate for internal routing
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
          >
            Don’t have an account? Sign Up
          </button>
          <div>
            <button
              onClick={() => navigate('/')} // Use navigate for internal routing
              className="text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition duration-150 ease-in-out text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            >
              ← Back to Home
            </button>
          </div>
        </div>

         {/* Footer Links */}
         <div className="mt-8 pt-4 border-t border-zinc-200/50 dark:border-white/10 text-center text-xs text-zinc-500 dark:text-zinc-400 space-x-4">
           <Link
             to="/privacy" // Use react-router Link for internal pages
             className="hover:text-zinc-800 dark:hover:text-white hover:underline"
           >
             Privacy Policy
           </Link>
           <span>&middot;</span>
           <Link
             to="/terms" // Use react-router Link for internal pages
             className="hover:text-zinc-800 dark:hover:text-white hover:underline"
           >
             Terms of Service
           </Link>
         </div>

         {/* Copyright Footer */}
         <div className="mt-4 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
             © Turbinix 2025. All rights reserved.
         </div>

      </motion.div>
      {/* ThemeToggle is rendered globally in App.js */}
    </div>
  );
}

export default Login;