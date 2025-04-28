// src/Settings.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, KeyRound, LogOut, Save, CheckCircle, AlertCircle, Loader } from 'lucide-react';

// Mock API URL (Replace with actual if available)
const API_URL = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

function Settings() {
  const navigate = useNavigate();

  // --- State ---
  const [profileInfo, setProfileInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '', // Store username for API calls
  });
  const [passwordInfo, setPasswordInfo] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' }); // type: 'success' or 'error'
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // --- Load Initial Data ---
  useEffect(() => {
    const storedUsername = localStorage.getItem('user') || '';
    const storedFullName = localStorage.getItem('fullName') || '';
    const storedEmail = localStorage.getItem('email') || 'email@example.com'; // Assuming email is stored, else fetch?

    const nameParts = storedFullName.split(' ');
    const firstName = nameParts[0] || 'First Name';
    const lastName = nameParts.slice(1).join(' ') || 'Last Name';

    setProfileInfo({
      firstName,
      lastName,
      email: storedEmail,
      username: storedUsername,
    });
    setPasswordInfo({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Reset password fields on load
  }, []);

  // --- Handlers ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileInfo(prev => ({ ...prev, [name]: value }));
    setProfileMessage({ type: '', text: '' }); // Clear message on change
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordInfo(prev => ({ ...prev, [name]: value }));
    setPasswordMessage({ type: '', text: '' }); // Clear message on change
  };

  const showTemporaryMessage = (setMessage, type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const handleProfileSave = useCallback(() => {
    if (!profileInfo.firstName.trim() || !profileInfo.lastName.trim()) {
      showTemporaryMessage(setProfileMessage, 'error', 'First and Last Name cannot be empty.');
      return;
    }
    setIsSavingProfile(true);
    try {
      const newFullName = `${profileInfo.firstName.trim()} ${profileInfo.lastName.trim()}`;
      localStorage.setItem('fullName', newFullName);
      // TODO: Ideally, also POST this update to backend /api/update-profile
      showTemporaryMessage(setProfileMessage, 'success', 'Account info updated!');
    } catch (error) {
      console.error("Failed to save profile info:", error);
      showTemporaryMessage(setProfileMessage, 'error', 'Could not update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  }, [profileInfo]);

  const handlePasswordSubmit = useCallback(async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!passwordInfo.oldPassword || !passwordInfo.newPassword || !passwordInfo.confirmPassword) {
        showTemporaryMessage(setPasswordMessage, 'error', 'Please fill in all password fields.');
        return;
    }
    if (passwordInfo.newPassword.length < 6) { // Basic validation
        showTemporaryMessage(setPasswordMessage, 'error', 'New password must be at least 6 characters.');
        return;
    }
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
        showTemporaryMessage(setPasswordMessage, 'error', 'New passwords do not match.');
        return;
    }

    setIsChangingPassword(true);

    // --- MOCK API CALL ---
    // Replace this with actual fetch call when backend route is ready
    console.log("Attempting to change password for:", profileInfo.username);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Mock responses (replace with actual fetch logic)
    const mockSuccess = Math.random() > 0.3; // Simulate success/failure
    if (mockSuccess) {
        showTemporaryMessage(setPasswordMessage, 'success', 'Password changed successfully!');
        setPasswordInfo({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Reset fields
    } else {
        showTemporaryMessage(setPasswordMessage, 'error', 'Failed to change password. Check old password or try again.');
    }
    // --- END MOCK ---

    /* // --- Example Actual Fetch (uncomment and adapt when ready) ---
    try {
        const response = await fetch(`${API_URL}/api/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include Authorization header if needed:
                // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                username: profileInfo.username,
                old_password: passwordInfo.oldPassword,
                new_password: passwordInfo.newPassword,
            }),
        });
        const data = await response.json();
        if (response.ok) {
            showTemporaryMessage(setPasswordMessage, 'success', data.message || 'Password changed successfully!');
            setPasswordInfo({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Reset fields
        } else {
            showTemporaryMessage(setPasswordMessage, 'error', data.error || 'Failed to change password.');
        }
    } catch (error) {
        console.error("Password change API error:", error);
        showTemporaryMessage(setPasswordMessage, 'error', 'An error occurred. Please try again.');
    } finally {
        setIsChangingPassword(false);
    }
    */

    setIsChangingPassword(false); // Also needed for mock
  }, [passwordInfo, profileInfo.username]);

  const handleLogout = useCallback(() => {
     if (window.confirm("Are you sure you want to log out?")) {
         // Clear sensitive user data from localStorage
         localStorage.removeItem('user');
         localStorage.removeItem('fullName');
         localStorage.removeItem('email'); // If email is stored
         localStorage.removeItem('authToken'); // If you use tokens
         localStorage.removeItem('userData'); // Clear finance dashboard data
         localStorage.removeItem('budgetData'); // Clear budget data
         localStorage.removeItem('turbinixDocuments'); // Clear documents

         // Note: This clears local state but doesn't update App.js's auth state directly.
         // Ideally, call a logout function provided by App context or parent.
         navigate('/', { replace: true });
         // Force reload if navigation doesn't trigger App state update reliably
         // window.location.reload();
     }
  }, [navigate]);


  // --- Card Component ---
  const SettingsCard = ({ title, children, initial = { opacity: 0, y: 20 }, animate = { opacity: 1, y: 0 }, transition = { duration: 0.4 } }) => (
    <motion.div
        initial={initial}
        animate={animate}
        transition={transition}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-6 relative overflow-hidden"
    >
         {/* Subtle glow effect */}
        <div className="absolute -inset-4 pointer-events-none z-0 opacity-5 dark:opacity-[0.08]">
            <div className="absolute top-0 left-0 w-48 h-48 bg-blue-400 rounded-full filter blur-3xl animate-pulse-glow"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-sky-500 rounded-full filter blur-3xl animate-pulse-glow animation-delay-1000"></div>
        </div>
        <div className="relative z-10">
            {title && <h2 className="text-xl font-semibold mb-5 text-zinc-800 dark:text-zinc-100">{title}</h2>}
            {children}
        </div>
    </motion.div>
  );

  // --- Input Component ---
  const SettingsInput = ({ id, name, type = "text", value, onChange, placeholder, icon: Icon, disabled = false }) => (
      <div className="relative">
          {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
          <input
              type={type}
              id={id}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              required={!disabled}
              className={`w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none transition duration-150 ease-in-out ${Icon ? 'pl-9' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
      </div>
  );

  // --- Button Component ---
  const SettingsButton = ({ onClick, loading, children, type = "button", variant = "primary", className = "" }) => {
      const variants = {
          primary: "bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white",
          danger: "bg-red-600 hover:bg-red-700 text-white",
          secondary: "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100",
      };
      return (
          <button
              type={type}
              onClick={onClick}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${variants[variant]} focus:ring-${variant === 'danger' ? 'red' : 'blue'}-500 ${loading ? 'opacity-70 cursor-wait' : ''} ${className}`}
          >
              {loading && <Loader size={16} className="animate-spin" />}
              {children}
          </button>
      );
  }

  // --- Message Component ---
    const MessageDisplay = ({ message }) => {
        if (!message.text) return null;
        const isSuccess = message.type === 'success';
        const colorClasses = isSuccess
            ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700/50 text-green-800 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700/50 text-red-800 dark:text-red-300';
        const Icon = isSuccess ? CheckCircle : AlertCircle;

        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 p-2.5 rounded-md text-sm flex items-center gap-2 border ${colorClasses}`}
            >
                <Icon size={16} className="flex-shrink-0" />
                <span>{message.text}</span>
            </motion.div>
        );
    };


  // --- Main Render ---
  return (
    <div className="min-h-screen px-4 sm:px-6 pt-10 pb-20 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold tracking-tight text-center text-zinc-800 dark:text-zinc-100 mb-10"
        >
            Account Settings
        </motion.h1>

        {/* Personal Information Card */}
        <SettingsCard title="Personal Information">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingsInput
                id="firstName"
                name="firstName"
                value={profileInfo.firstName}
                onChange={handleProfileChange}
                placeholder="First Name"
                icon={User}
              />
              <SettingsInput
                id="lastName"
                name="lastName"
                value={profileInfo.lastName}
                onChange={handleProfileChange}
                placeholder="Last Name"
                icon={User}
              />
            </div>
            <SettingsInput
              id="email"
              name="email"
              type="email"
              value={profileInfo.email}
              placeholder="Email Address"
              icon={Mail}
              disabled={true} // Email not editable for now
            />
            <div className="flex justify-end pt-2">
              <SettingsButton
                onClick={handleProfileSave}
                loading={isSavingProfile}
                variant="primary"
              >
                <Save size={16} className="mr-1"/> Save Changes
              </SettingsButton>
            </div>
            <MessageDisplay message={profileMessage} />
          </div>
        </SettingsCard>

        {/* Change Password Card */}
        <SettingsCard title="Change Password" transition={{ duration: 0.4, delay: 0.1 }}>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <SettingsInput
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    value={passwordInfo.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Current Password"
                    icon={KeyRound}
                />
                <SettingsInput
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordInfo.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="New Password"
                    icon={KeyRound}
                />
                 <SettingsInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordInfo.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm New Password"
                    icon={KeyRound}
                />
                 <div className="flex justify-end pt-2">
                    <SettingsButton
                        type="submit"
                        loading={isChangingPassword}
                        variant="secondary"
                    >
                         Change Password
                    </SettingsButton>
                </div>
                <MessageDisplay message={passwordMessage} />
           </form>
        </SettingsCard>

        {/* Logout Card */}
        <SettingsCard title="Logout" transition={{ duration: 0.4, delay: 0.2 }}>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Logging out will clear your session and local data on this device.
            </p>
             <div className="flex justify-end">
                <SettingsButton
                    onClick={handleLogout}
                    variant="danger"
                >
                    <LogOut size={16} className="mr-1"/> Log Out
                </SettingsButton>
            </div>
        </SettingsCard>
      </div>
    </div>
  );
}

export default Settings;