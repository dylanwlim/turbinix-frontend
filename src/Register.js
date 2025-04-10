import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', username: '', password: '', code: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  const API = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

  useEffect(() => {
    let interval;
    if (cooldown > 0) {
      interval = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const checkUsername = async () => {
    if (!form.username) return;
    const res = await fetch(`${API}/api/check-username/${form.username}`);
    const data = await res.json();
    setUsernameAvailable(data.available);
  };

  const sendCode = async () => {
    if (!form.email) {
      setError('Enter email first');
      return;
    }

    setCooldown(60);
    const res = await fetch(`${API}/api/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to send code');
    } else {
      setMessage('Verification code sent');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const payload = {
      email: form.email,
      first_name: form.firstName,
      last_name: form.lastName,
      username: form.username,
      password: form.password,
      code: form.code
    };

    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Account created! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(data.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900 px-6">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && <p className="text-green-500 text-sm text-center">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" placeholder="Email" className="w-full p-2 border rounded bg-white dark:bg-gray-900" value={form.email} onChange={handleChange} />
          <div className="flex gap-2">
            <input name="firstName" placeholder="First Name" className="w-full p-2 border rounded bg-white dark:bg-gray-900" value={form.firstName} onChange={handleChange} />
            <input name="lastName" placeholder="Last Name" className="w-full p-2 border rounded bg-white dark:bg-gray-900" value={form.lastName} onChange={handleChange} />
          </div>
          <div>
            <input name="username" placeholder="Username" className="w-full p-2 border rounded bg-white dark:bg-gray-900" value={form.username} onChange={handleChange} onBlur={checkUsername} />
            {usernameAvailable === false && <p className="text-red-500 text-sm">Username taken</p>}
            {usernameAvailable === true && <p className="text-green-500 text-sm">Username available</p>}
          </div>
          <input type="password" name="password" placeholder="Password" className="w-full p-2 border rounded bg-white dark:bg-gray-900" value={form.password} onChange={handleChange} />
          <div className="flex items-center gap-2">
            <input name="code" placeholder="Verification Code" className="w-full p-2 border rounded bg-white dark:bg-gray-900" value={form.code} onChange={handleChange} />
            <button type="button" onClick={sendCode} disabled={cooldown > 0} className={`text-sm px-3 py-1 rounded ${cooldown > 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
              {cooldown > 0 ? `Wait ${cooldown}s` : 'Send Code'}
            </button>
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded transition">Create Account</button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <button className="text-blue-600 hover:underline" onClick={() => navigate('/login')}>
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
