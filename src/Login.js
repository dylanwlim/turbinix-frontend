import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user', data.username || form.identifier);
        navigate('/hub');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-xl shadow space-y-4">
        <h2 className="text-2xl font-bold text-center">
          {mode === 'login' ? 'Login to Turbinix' : 'Register'}
        </h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="identifier"
            type="text"
            value={form.identifier}
            onChange={handleChange}
            placeholder="Username or Email"
            className="w-full p-2 border rounded bg-white dark:bg-gray-800"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-2 border rounded bg-white dark:bg-gray-800"
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
    </div>
  );
}

export default Login;
