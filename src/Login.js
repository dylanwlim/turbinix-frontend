// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingPaths from './FloatingPaths';

function Login({ onLogin }) {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      return setError('Please fill in all fields');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.username, `${data.first_name} ${data.last_name}`);
        navigate('/finance');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white dark:bg-gray-950 px-4 py-12">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl p-8 bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-lg"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-white/70 text-transparent bg-clip-text mb-8">
          Log In
        </h1>

        {error && (
          <>
            <div className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 p-3 rounded text-sm mb-4">
              {error}
            </div>
            <div className="text-center">
              <button
                onClick={() => navigate('/forgot-password', { state: { email: form.identifier } })}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-all"
              >
                Forgot Password?
              </button>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            type="text"
            name="identifier"
            placeholder="Username or Email"
            value={form.identifier}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Don’t have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Sign Up
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
