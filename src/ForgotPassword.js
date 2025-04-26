// src/ForgotPassword.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FloatingPaths from './FloatingPaths';

function ForgotPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email');

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API}/api/request-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => navigate('/reset-password'), 2000);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white dark:bg-gray-950 px-4 py-12">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Forgot Password</h1>

        {error && <div className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 p-3 rounded text-sm mb-4">{error}</div>}
        {message && <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-3 rounded text-sm mb-4">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Remembered your password?{' '}
          <button onClick={() => navigate('/login')} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
