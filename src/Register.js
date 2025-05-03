// src/Register.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for legal links
import { motion } from 'framer-motion';
// ThemeToggle is rendered globally via App.js

// Input Component remains the same
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
      className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400 dark:placeholder-zinc-500"
    />
  </div>
);

// Button Component remains the same
const ActionButton = ({ type = "submit", onClick, loading, loadingText, children, className = "", disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    className={`w-full py-3 rounded-lg font-semibold bg-black text-white dark:bg-white dark:text-black transition duration-200 ease-in-out hover:scale-[1.03] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900 ${className} ${loading || disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
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
  const [form, setForm] = useState({ email: '', username: '', firstName: '', lastName: '', password: '', code: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Assuming consent is implicitly given in step 1 for now. Add state and checkbox later if needed.
  // const [agreedToTerms, setAgreedToTerms] = useState(false);
  const dashboardRoute = "/finance";
  const API_URL = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

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

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const sendCode = async () => {
    // TODO: Add checkbox and check `agreedToTerms` state here before sending
    if (!form.email) return setError('Please enter an email address.');
    if (!form.username) return setError('Please enter a username.');
    if (!form.firstName) return setError('Please enter your first name.');
    if (!form.lastName) return setError('Please enter your last name.');
    if (!form.password) return setError('Please enter a password.');

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/api/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(2);
        setSuccess('Verification code sent to your email.');
        setCooldown(60);
      } else {
         // Use specific error from backend if available
        setError(data.error || data.description || data.message || 'Error sending code.');
      }
    } catch (err) {
      console.error("Error sending verification code:", err);
       setError(`Network error or server unreachable. ${err.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndRegister = async () => {
    if (!form.code) return setError('Please enter the verification code.');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // --- UPDATED PAYLOAD ---
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName, // Use camelCase to match backend check
        lastName: form.lastName,   // Use camelCase to match backend check
        code: form.code,
        consent: true, // Add consent field, assuming true for now
      };
      // -----------------------

      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
         // Use specific error from backend if available
         setError(data.error || data.description || data.message || 'Registration failed.');
      }
    } catch (err) {
       console.error("Error verifying/registering:", err);
       setError(`Network error or server unreachable. ${err.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm px-4 py-12 overflow-hidden transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md p-8 bg-white/80 dark:bg-black/60 backdrop-blur-lg rounded-2xl border border-zinc-200 dark:border-white/10 shadow-xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center text-zinc-900 dark:text-white mb-6 glow-text-alt">
          {step === 1 ? 'Create Your Account' : 'Verify Your Email'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700/50 text-red-800 dark:text-red-300 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        {success && !error && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700/50 text-green-800 dark:text-green-300 rounded-lg text-sm text-center">
            {success}
          </div>
        )}

        {/* Step 1: Collect Info */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); sendCode(); }} className="space-y-4">
            <FormInput id="email" name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
            <FormInput id="username" name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} />
            <div className="flex flex-col sm:flex-row gap-4">
              <FormInput id="firstName" name="firstName" type="text" placeholder="First Name" value={form.firstName} onChange={handleChange} />
              <FormInput id="lastName" name="lastName" type="text" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
            </div>
            <FormInput id="password" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />

             {/* TODO: Add Terms Checkbox Here */}
             <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center pt-2">
                By continuing, you agree to the Turbinix <Link to="/terms" className="underline hover:text-blue-500">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-blue-500">Privacy Policy</Link>.
                {/* <label htmlFor="consentCheckbox" className="flex items-center mt-2 cursor-pointer">
                  <input type="checkbox" id="consentCheckbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mr-2 h-4 w-4" />
                  I agree to the Terms and Privacy Policy.
                </label> */}
             </div>

            <ActionButton loading={loading} loadingText="Sending Code...">Continue</ActionButton>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); verifyAndRegister(); }} className="space-y-4">
            <p className="text-sm text-center text-zinc-600 dark:text-zinc-400 pb-2">
              Enter the 6-digit code sent to <strong className="font-medium text-zinc-800 dark:text-zinc-200">{form.email}</strong>.
            </p>
            <FormInput id="code" name="code" type="text" placeholder="Verification Code" value={form.code} onChange={handleChange} />
            <div className="flex items-center justify-between text-sm pt-1">
              <button
                type="button"
                onClick={sendCode}
                disabled={cooldown > 0 || loading}
                className={`font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded ${cooldown > 0 || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                className="font-medium text-zinc-600 dark:text-zinc-400 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                disabled={loading}
              >
                Edit Email/Info
              </button>
            </div>
            <ActionButton loading={loading} loadingText="Creating Account...">
              Verify & Create Account
            </ActionButton>
          </form>
        )}

        {/* Links */}
        <div className="text-center mt-6 text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            disabled={loading && success} // Prevent clicking while loading/showing success
          >
            Already have an account? Log In
          </button>
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition duration-150 ease-in-out text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Footer Legal Links */}
        <div className="mt-8 pt-4 border-t border-zinc-200/50 dark:border-white/10 text-center text-xs text-zinc-500 dark:text-zinc-400 space-x-4">
          <Link to="/privacy" className="hover:text-zinc-800 dark:hover:text-white hover:underline">Privacy Policy</Link>
          <span>&middot;</span>
          <Link to="/terms" className="hover:text-zinc-800 dark:hover:text-white hover:underline">Terms of Service</Link>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center text-[11px] text-zinc-600 dark:text-zinc-500">
          © Turbinix 2025. All rights reserved.
        </div>

      </motion.div>
    </div>
  );
}

export default Register;