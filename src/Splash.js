import React from 'react';
import { useNavigate } from 'react-router-dom';

function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-center relative">
      <h1 className="text-5xl md:text-7xl font-extrabold text-blue-600 dark:text-blue-400 animate-pulse drop-shadow-lg mb-10">
        Turbinix
      </h1>
      <div className="flex gap-6">
        <button
          onClick={() => navigate('/register')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium px-6 py-3 rounded-xl transition"
        >
          Sign Up
        </button>
        <button
          onClick={() => navigate('/login')}
          className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white text-lg font-medium px-6 py-3 rounded-xl transition"
        >
          Log In
        </button>
      </div>

      {/* Light/Dark Toggle */}
      <button
        onClick={() => {
          const html = document.querySelector('html');
          html.classList.toggle('dark');
        }}
        className="absolute bottom-6 right-6 text-2xl"
      >
        {document.querySelector('html')?.classList.contains('dark') ? '☀️' : '🌑'}
      </button>
    </div>
  );
}

export default Splash;
