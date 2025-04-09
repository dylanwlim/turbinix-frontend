import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL =
    mode === 'login'
      ? `${import.meta.env.VITE_API_URL}/api/login`
      : `${import.meta.env.VITE_API_URL}/api/register`;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user', form.username);
        navigate('/hub');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white dark:bg-gray-800 p-8 rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold text-center">
        {mode === 'login' ? 'Login to Turbinix' : 'Register New Account'}
      </h2>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          className="w-full p-2 border rounded bg-white dark:bg-gray-900"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-2 border rounded bg-white dark:bg-gray-900"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>

      <button
        onClick={toggleMode}
        className="text-sm text-blue-600 hover:underline block mx-auto"
      >
        {mode === 'login' ? 'Create an account' : 'Already have an account? Log in'}
      </button>
    </div>
  );
}

export default Login;
