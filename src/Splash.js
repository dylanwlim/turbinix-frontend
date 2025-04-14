// src/Splash.js
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import FloatingPaths from './FloatingPaths';

function Splash() {
  const darkMode = document.documentElement.classList.contains('dark');

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', !darkMode);
  };

  return (
    <motion.div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white dark:bg-gray-950 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      <div className="relative mb-10 z-10">
        <h1 className="relative text-[80px] sm:text-[96px] md:text-[112px] font-extrabold tracking-tight text-center bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-white/80 text-transparent bg-clip-text leading-tight pb-1">
          Turbinix
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-[80px] sm:text-[96px] md:text-[112px] font-extrabold text-blue-500/30 dark:text-white/30 blur-2xl animate-pulse select-none pointer-events-none">
            Turbinix
          </h1>
        </div>
      </div>

      <div className="z-10 flex flex-col sm:flex-row items-center gap-4">
        <Link
          to="/register"
          className="rounded-full bg-black text-white px-7 py-2.5 text-base font-semibold shadow hover:shadow-xl transition hover:scale-105 backdrop-blur-md"
        >
          Sign Up
        </Link>
        <Link
          to="/login"
          className="rounded-full bg-white text-black px-7 py-2.5 text-base font-semibold shadow hover:shadow-xl transition hover:scale-105 backdrop-blur-md dark:bg-gray-100 dark:text-black"
        >
          Log In
        </Link>
      </div>

      <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </motion.div>
  );
}

export default Splash;
