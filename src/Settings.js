// src/Settings.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, KeyRound, LogOut, Save, CheckCircle, AlertCircle, Loader, Upload, Trash2, Camera } from 'lucide-react'; // Added Upload, Trash2, Camera

// Constants
const API_URL = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com'; // Mock API URL
const PROFILE_PICTURE_KEY = 'turbinixProfilePicture'; // localStorage key for profile pic

// --- Helper: Get Initials ---
const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1 && names[0]) return names[0][0].toUpperCase();
    if (names.length > 1 && names[0] && names[names.length - 1]) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return '?'; // Fallback
};


function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- State ---
  const [profileInfo, setProfileInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  });
  const [passwordInfo, setPasswordInfo] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profilePic, setProfilePic] = useState(null); // State for profile picture data URL
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [pictureMessage, setPictureMessage] = useState({ type: '', text: '' }); // Message for picture actions


  // --- Load Initial Data ---
  useEffect(() => {
    const storedUsername = localStorage.getItem('user') || '';
    const storedFullName = localStorage.getItem('fullName') || '';
    const storedEmail = localStorage.getItem('email') || 'email@example.com';
    const storedProfilePic = localStorage.getItem(PROFILE_PICTURE_KEY); // Load profile pic

    const nameParts = storedFullName.split(' ');
    const firstName = nameParts[0] || 'First Name';
    const lastName = nameParts.slice(1).join(' ') || 'Last Name';

    setProfileInfo({
      firstName,
      lastName,
      email: storedEmail,
      username: storedUsername,
    });
    setProfilePic(storedProfilePic); // Set profile pic state
    setPasswordInfo({ oldPassword: '', newPassword: '', confirmPassword: '' });
  }, []);

  // --- Handlers ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileInfo(prev => ({ ...prev, [name]: value }));
    setProfileMessage({ type: '', text: '' });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordInfo(prev => ({ ...prev, [name]: value }));
    setPasswordMessage({ type: '', text: '' });
  };

  const showTemporaryMessage = (setMessage, type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  // Profile Picture Handlers
   const handlePictureUpload = (event) => {
        const file = event.target.files?.[0];
        setPictureMessage({ type: '', text: '' }); // Clear previous messages

        if (!file) return;

        // Basic validation (optional but recommended)
        if (!file.type.startsWith('image/')) {
            showTemporaryMessage(setPictureMessage, 'error', 'Please select an image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // Limit size (e.g., 2MB)
            showTemporaryMessage(setPictureMessage, 'error', 'Image size should be less than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            setProfilePic(dataUrl);
            try {
                localStorage.setItem(PROFILE_PICTURE_KEY, dataUrl);
                showTemporaryMessage(setPictureMessage, 'success', 'Profile picture updated.');
            } catch (error) {
                console.error("Error saving profile picture to localStorage:", error);
                showTemporaryMessage(setPictureMessage, 'error', 'Could not save picture. Storage might be full.');
                 // Revert state if save fails
                 setProfilePic(localStorage.getItem(PROFILE_PICTURE_KEY));
            }
        };
        reader.onerror = () => {
            console.error("Error reading file:", reader.error);
            showTemporaryMessage(setPictureMessage, 'error', 'Could not read image file.');
        };
        reader.readAsDataURL(file);
    };

    const handleClearPicture = useCallback(() => {
        if (window.confirm("Are you sure you want to remove your profile picture?")) {
            setProfilePic(null);
            localStorage.removeItem(PROFILE_PICTURE_KEY);
            showTemporaryMessage(setPictureMessage, 'success', 'Profile picture removed.');
        }
    }, []);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };


  // Profile Save Handler
  const handleProfileSave = useCallback(() => {
    if (!profileInfo.firstName.trim() || !profileInfo.lastName.trim()) {
      showTemporaryMessage(setProfileMessage, 'error', 'First and Last Name cannot be empty.');
      return;
    }
    setIsSavingProfile(true);
    try {
      const newFullName = `${profileInfo.firstName.trim()} ${profileInfo.lastName.trim()}`;
      localStorage.setItem('fullName', newFullName);
      // TODO: POST update to backend
      showTemporaryMessage(setProfileMessage, 'success', 'Account info updated!');
    } catch (error) {
      console.error("Failed to save profile info:", error);
      showTemporaryMessage(setProfileMessage, 'error', 'Could not update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  }, [profileInfo]);

  // Password Change Handler
  const handlePasswordSubmit = useCallback(async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    // Validation... (same as before)
    if (!passwordInfo.oldPassword || !passwordInfo.newPassword || !passwordInfo.confirmPassword) {
        showTemporaryMessage(setPasswordMessage, 'error', 'Please fill in all password fields.'); return;
    }
    if (passwordInfo.newPassword.length < 6) {
        showTemporaryMessage(setPasswordMessage, 'error', 'New password must be at least 6 characters.'); return;
    }
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
        showTemporaryMessage(setPasswordMessage, 'error', 'New passwords do not match.'); return;
    }

    setIsChangingPassword(true);
    // --- MOCK API CALL --- (same as before)
    console.log("Attempting to change password for:", profileInfo.username);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockSuccess = Math.random() > 0.3;
    if (mockSuccess) {
        showTemporaryMessage(setPasswordMessage, 'success', 'Password changed successfully!');
        setPasswordInfo({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
        showTemporaryMessage(setPasswordMessage, 'error', 'Failed to change password. Check old password or try again.');
    }
    // --- END MOCK ---
    setIsChangingPassword(false);
  }, [passwordInfo, profileInfo.username]);

  // Logout Handler
  const handleLogout = useCallback(() => {
     if (window.confirm("Are you sure you want to log out?")) {
         // Clear local storage... (same as before)
         localStorage.removeItem('user');
         localStorage.removeItem('fullName');
         localStorage.removeItem('email');
         localStorage.removeItem('authToken');
         localStorage.removeItem(PROFILE_PICTURE_KEY); // Clear profile picture
         localStorage.removeItem('userData');
         localStorage.removeItem('budgetData');
         localStorage.removeItem('turbinixDocuments');
         navigate('/', { replace: true });
         // Consider calling a logout function passed from App.js if needed
     }
  }, [navigate]);


  // --- Components ---
  const SettingsCard = ({ title, children, className = "", ...props }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: props.delay || 0 }} // Use delay prop if passed
        className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-6 relative overflow-hidden ${className}`}
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

  const SettingsInput = ({ id, name, type = "text", value, onChange, placeholder, icon: Icon, disabled = false, required = true }) => (
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
              required={required && !disabled}
              className={`w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none transition duration-150 ease-in-out ${Icon ? 'pl-9' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
      </div>
  );

   // --- Updated Button Component ---
  const SettingsButton = ({ onClick, loading, icon: Icon, children, type = "button", variant = "primary", className = "" }) => {
    const baseClasses = "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950";
    const variantClasses = {
        primary: "bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white focus:ring-blue-500 dark:focus:ring-sky-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] dark:hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        secondary: "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100 focus:ring-blue-500 dark:focus:ring-sky-500 hover:shadow-[0_0_12px_rgba(161,161,170,0.3)] dark:hover:shadow-[0_0_12px_rgba(82,82,91,0.4)]",
    };
    const loadingClasses = loading ? 'opacity-70 cursor-wait' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading}
            className={`${baseClasses} ${variantClasses[variant]} ${loadingClasses} ${className}`}
        >
            {loading && <Loader size={14} className="animate-spin" />}
            {!loading && Icon && <Icon size={14} />}
            <span>{children}</span>
        </button>
    );
  }

  const MessageDisplay = ({ message }) => {
      // ... (same as before)
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

        {/* Profile Picture Card */}
        <SettingsCard title="Profile Picture" delay={0.05}>
             <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar Preview */}
                 <div className="relative flex-shrink-0">
                      {profilePic ? (
                          <img
                             src={profilePic}
                             alt="Profile"
                             className="w-20 h-20 rounded-full object-cover border-2 border-zinc-300 dark:border-zinc-600 shadow-md"
                          />
                      ) : (
                          <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-2xl font-semibold border-2 border-zinc-300 dark:border-zinc-600 shadow-md">
                             {getInitials(profileInfo.firstName + ' ' + profileInfo.lastName)}
                          </div>
                      )}
                       <button
                         onClick={triggerFileInput}
                         className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-zinc-800 rounded-full shadow border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                         aria-label="Change profile picture"
                         title="Change profile picture"
                       >
                         <Camera size={14} className="text-zinc-600 dark:text-zinc-300" />
                       </button>
                 </div>

                 {/* Upload/Clear Buttons */}
                 <div className="flex-grow text-center sm:text-left">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                          Upload a new profile picture. JPG, PNG, or GIF. Max 2MB.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                         <SettingsButton
                            onClick={triggerFileInput}
                            icon={Upload}
                            variant="secondary"
                         >
                            Upload Image
                         </SettingsButton>
                          {profilePic && (
                             <SettingsButton
                                 onClick={handleClearPicture}
                                 icon={Trash2}
                                 variant="secondary"
                                 className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 focus:ring-red-500"
                             >
                                 Clear Picture
                             </SettingsButton>
                          )}
                      </div>
                      <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg, image/png, image/gif"
                          onChange={handlePictureUpload}
                          className="hidden"
                          aria-hidden="true"
                       />
                       <MessageDisplay message={pictureMessage} />
                 </div>
             </div>
        </SettingsCard>

        {/* Personal Information Card */}
        <SettingsCard title="Personal Information" delay={0.1}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingsInput
                id="firstName" name="firstName" value={profileInfo.firstName} onChange={handleProfileChange} placeholder="First Name" icon={User} />
              <SettingsInput
                id="lastName" name="lastName" value={profileInfo.lastName} onChange={handleProfileChange} placeholder="Last Name" icon={User} />
            </div>
            <SettingsInput
              id="email" name="email" type="email" value={profileInfo.email} placeholder="Email Address" icon={Mail} disabled={true} />
            <div className="flex justify-end pt-2">
              <SettingsButton onClick={handleProfileSave} loading={isSavingProfile} variant="primary" icon={Save}>
                Save Changes
              </SettingsButton>
            </div>
            <MessageDisplay message={profileMessage} />
          </div>
        </SettingsCard>

        {/* Change Password Card */}
        <SettingsCard title="Change Password" delay={0.15}>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <SettingsInput id="oldPassword" name="oldPassword" type="password" value={passwordInfo.oldPassword} onChange={handlePasswordChange} placeholder="Current Password" icon={KeyRound} />
                <SettingsInput id="newPassword" name="newPassword" type="password" value={passwordInfo.newPassword} onChange={handlePasswordChange} placeholder="New Password" icon={KeyRound} />
                <SettingsInput id="confirmPassword" name="confirmPassword" type="password" value={passwordInfo.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm New Password" icon={KeyRound} />
                 <div className="flex justify-end pt-2">
                    <SettingsButton type="submit" loading={isChangingPassword} variant="secondary" icon={KeyRound}>
                         Change Password
                    </SettingsButton>
                </div>
                <MessageDisplay message={passwordMessage} />
           </form>
        </SettingsCard>

        {/* Logout Card */}
        <SettingsCard title="Logout" delay={0.2}>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Logging out will clear your session and local data on this device.
            </p>
             <div className="flex justify-end">
                <SettingsButton onClick={handleLogout} variant="danger" icon={LogOut}>
                    Log Out
                </SettingsButton>
            </div>
        </SettingsCard>

        {/* Footer */}
        <footer className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-10 pb-6 space-y-1">
            <p>Turbinix Beta Version 1.0</p>
            <p>This is an early beta. Please let me know anything you want to see improved — it helps a ton!</p>
        </footer>

      </div>
    </div>
  );
}

export default Settings;