// src/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

function Login({ onLogin, isAuthenticated }) {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dashboardRoute = "/finance";

  const API_URL = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

  useEffect(() => {
    let redirectTimerId = null;
    if (isAuthenticated) {
      redirectTimerId = setTimeout(() => {
        navigate(dashboardRoute, { replace: true });
      }, 350);
    }
    return () => {
      if (redirectTimerId) {
        clearTimeout(redirectTimerId);
      }
    };
  }, [isAuthenticated, navigate, dashboardRoute]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRememberChange = (e) => {
    setRememberMe(e.target.checked);
  };

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
        onLogin(data.username, `${data.first_name} ${data.last_name}`, rememberMe);
      } else {
        setError(data.message || data.error || 'Invalid username/email or password.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm px-4 py-12 overflow-hidden transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md p-8 bg-white/70 dark:bg-black/50 backdrop-blur-lg rounded-3xl border border-gray-300 dark:border-white/10 shadow-xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-6 glow-text-alt">
          Log In to Turbinix
        </h1>

        {error && (
          <div className="mb-4 space-y-2">
            <div className="bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="Username or Email"
              value={form.identifier}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800/80 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <input
              type="password"
              id="login-password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800/80 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="flex items-center justify-between pt-1 pb-1">
            <label htmlFor="rememberMe" className="flex items-center text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={handleRememberChange}
                className="mr-2 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
              />
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            className={`w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-xl font-semibold transition duration-150 ease-in-out hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </div>
            ) : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400 space-y-3">
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Don’t have an account? Sign Up
          </button>
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-400 hover:scale-105 transform transition duration-300 ease-in-out text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </motion.div>

      {/* ThemeToggle rendered globally */}
    </div>
  );
}

export default Login;
