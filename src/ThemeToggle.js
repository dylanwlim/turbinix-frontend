import React from 'react';

function ThemeToggle({ darkMode, toggleDarkMode }) {
  return (
    <button
      onClick={toggleDarkMode}
      className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-xl z-40 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-110"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? '🌙' : '☀️'}
    </button>
  );
}

export default ThemeToggle;
