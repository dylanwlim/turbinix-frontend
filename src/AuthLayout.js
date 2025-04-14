// AuthLayout.js
import React from 'react';
import FloatingPaths from './FloatingPaths'; // animated background component
import ThemeToggle from './ThemeToggle';

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted relative overflow-hidden">
      {/* Left Side - Form */}
      <div className="z-10 w-full max-w-2xl p-6 md:p-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        {children}
      </div>

      {/* Theme toggle button */}
      <ThemeToggle darkMode={localStorage.getItem('darkMode') === 'true'} toggleDarkMode={() => {
        const current = localStorage.getItem('darkMode') === 'true';
        localStorage.setItem('darkMode', !current);
        window.location.reload(); // for now until darkMode state is lifted up
      }} />
    </div>
  );
}

export default AuthLayout;
