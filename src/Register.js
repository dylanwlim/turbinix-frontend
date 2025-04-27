// src/Register.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle'; // Rendered globally

const FormInput = ({ id, name, type, placeholder, value, onChange, required = true }) => (
  <div>
    <label htmlFor={id} className="sr-only">{placeholder}</label>
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800/80 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-150 ease-in-out text-sm md:text-base"
    />
  </div>
);

const ActionButton = ({ type = "submit", onClick, loading, loadingText, children, className = "", disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    className={`w-full py-3 rounded-xl font-semibold bg-black text-white dark:bg-white dark:text-black transition duration-150 ease-in-out hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 ${className} ${loading || disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    disabled={loading || disabled}
  >
    {loading ? (
      <div className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {loadingText || "Processing..."}
      </div>
    ) : children}
  </button>
);

function Register({ isAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  useEffect(() => {}, [cooldown]);

  const handleChange = (e) => { /* handlers unchanged */ };
  const sendCode = async () => { /* handlers unchanged */ };
  const verifyAndRegister = async () => { /* handlers unchanged */ };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm px-4 py-12 overflow-hidden transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md p-8 bg-white/70 dark:bg-black/50 backdrop-blur-lg rounded-3xl border border-gray-300 dark:border-white/10 shadow-xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-6 glow-text-alt">
          {step === 1 ? 'Create Your Account' : 'Verify Your Email'}
        </h1>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        {success && !error && (
          <div className="mb-4 bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700/50 dark:text-green-300 p-3 rounded-lg text-sm text-center">
            {success}
          </div>
        )}

        {/* Step forms unchanged */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); sendCode(); }} className="space-y-4">
            <FormInput id="email" name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
            <div className="flex flex-col sm:flex-row gap-4">
              <FormInput id="firstName" name="firstName" type="text" placeholder="First Name" value={form.firstName} onChange={handleChange} />
              <FormInput id="lastName" name="lastName" type="text" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
            </div>
            <FormInput id="password" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <ActionButton loading={loading} loadingText="Sending Code...">Continue</ActionButton>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); verifyAndRegister(); }} className="space-y-4">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 pb-2">
              Enter the 6-digit code sent to <strong className="font-medium text-gray-800 dark:text-gray-200">{form.email}</strong>.
            </p>
            <FormInput id="code" name="code" type="text" placeholder="Verification Code" value={form.code} onChange={handleChange} />
            <div className="flex items-center justify-between text-sm pt-1">
              <button
                type="button"
                onClick={sendCode}
                disabled={cooldown > 0 || loading}
                className={`font-medium text-blue-600 dark:text-blue-400 hover:underline ${cooldown > 0 || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                className="font-medium text-gray-600 dark:text-gray-400 hover:underline"
                disabled={loading}
              >
                Edit Email/Info
              </button>
            </div>
            <ActionButton loading={loading} loadingText="Creating Account..." className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white">
              Verify & Create Account
            </ActionButton>
          </form>
        )}

        {/* Login Link */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400 space-y-3">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            disabled={loading && success}
          >
            Already have an account? Log In
          </button>

          {/* Back to Home with subtle hover pulse */}
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

export default Register;
