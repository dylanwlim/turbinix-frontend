// Updated Register.js with visible email, back button, and persistent background
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingPaths from './FloatingPaths';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', password: '', code: ''
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

  useEffect(() => {

    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
    
  }, [cooldown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const sendCode = async () => {
    if (cooldown > 0) {
      setError("Please wait before requesting another code.");
      return;
    }
    if (!form.email || !form.firstName || !form.lastName || !form.password) {
      return setError("Please fill in all fields.");
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setCooldown(60);
        setSuccess("A code was sent to your email.");
      } else {
        setError(data.error || "Failed to send verification code.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndRegister = async () => {
    if (!form.code) return setError("Enter the verification code.");
    setLoading(true);
    try {
      const verify = await fetch(`${API}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code: form.code }),
      });
      const verified = await verify.json();
      if (!verified.verified) {
        return setError("Invalid verification code.");
      }

      const payload = {
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        username: form.email.split('@')[0],
        password: form.password,
      };

      const register = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await register.json();

      if (register.ok) {
        setSuccess("Account created! Redirecting...");
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(result.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white dark:bg-gray-950 px-4 py-12">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      <div className="relative z-10 w-full max-w-xl p-8 bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-white/70 text-transparent bg-clip-text mb-8">
          Sign Up
        </h1>

        {error && (
          <div className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 p-3 rounded text-sm mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-3 rounded text-sm mb-4">
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); sendCode(); }} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
            <div className="flex gap-3">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
            </div>
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
              {loading ? "Sending..." : "Continue"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); verifyAndRegister(); }} className="space-y-4">
            <input
              type="text"
              name="code"
              placeholder="Verification Code"
              value={form.code}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A code was sent to <strong>{form.email}</strong>.
            </p>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={sendCode}
                disabled={cooldown > 0}
                className={`text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium ${cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 dark:text-gray-300 hover:underline"
              >
                Edit Info
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
