import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function NavigationBar({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <button 
        onClick={toggleMenu} 
        className="flex flex-col justify-center items-center w-10 h-10 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 shadow-md"
        aria-label="Navigation menu"
      >
        <span className="w-6 h-0.5 bg-gray-800 dark:bg-white mb-1"></span>
        <span className="w-6 h-0.5 bg-gray-800 dark:bg-white mb-1"></span>
        <span className="w-6 h-0.5 bg-gray-800 dark:bg-white"></span>
      </button>
      
      {menuOpen && (
        <div className="absolute top-12 right-0 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium">Menu</h3>
          </div>
          <div className="py-1">
            <Link 
              to="/hub" 
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              🏠 Dashboard
            </Link>
            <Link 
              to="/finance" 
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              📊 Finance Dashboard
            </Link>
            <Link 
              to="/budget" 
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              💰 Budget Center
            </Link>
            <Link 
              to="/documents" 
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              📁 Document Center
            </Link>
            <Link 
              to="/updates" 
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              🔔 Updates & Help
            </Link>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavigationBar;