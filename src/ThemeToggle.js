// src/ThemeToggle.js
import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  // ✅ Add/remove dark class on <html> when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label="Toggle Theme"
        className={`p-3 rounded-full shadow transition duration-300 hover:scale-105 border 
          ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-gray-100" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-400" />
        )}
      </button>
    </div>
  );
}

export default ThemeToggle;
