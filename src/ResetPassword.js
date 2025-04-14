// src/ResetPassword.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingPaths from './FloatingPaths';

function ResetPassword() {
  const [form, setForm] = useState({ email: '', code: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, code, newPassword, confirmPassword } = form;

    if (!email || !code || !newPassword || !confirmPassword) {
      return setError('Please fill in all fields');
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch {
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
        <h1 className="text-3xl font-bold mb-6 text-center">Reset Password</h1>

        {error && <div className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 p-3 rounded text-sm mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-3 rounded text-sm mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          <input
            type="text"
            name="code"
            placeholder="Reset Code"
            value={form.code}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Know your password?{' '}
          <button onClick={() => navigate('/login')} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
