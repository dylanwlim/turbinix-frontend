// src/Splash.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import ThemeToggle from './ThemeToggle'; // Rendered globally
// import FloatingPaths from './FloatingPaths'; // Handled by App.js
import ScrollIndicatorArrow from './ScrollIndicatorArrow';

// AboutSectionContent component (unchanged)
function AboutSectionContent() {
   return (
        <>
          <h2
            className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white glow-text-alt"
          >
            Take Control of Your Finances
          </h2>
          <p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Turbinix provides a sleek, modern platform to effortlessly track your net worth, manage budgets,
            and visualize your financial journey. Secure, intuitive, and designed for clarity.
          </p>
          <div className="flex justify-center">
            <Link
              to="/register"
              className="rounded-full bg-black text-white dark:bg-white dark:text-black px-7 py-2.5 text-base font-semibold shadow hover:shadow-lg transition hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </>
      );
}

// Accept isAuthenticated prop
function Splash({ isAuthenticated }) {
  const [showAboutSection, setShowAboutSection] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(true);
  const { scrollY } = useScroll();
  const navigate = useNavigate(); // Hook for navigation
  const dashboardRoute = "/finance"; // Define dashboard route

  // --- Delayed Redirect Logic ---
  useEffect(() => {
    let redirectTimerId = null;
    if (isAuthenticated) {
      // Start a timer to redirect only if authenticated
      redirectTimerId = setTimeout(() => {
        console.log("Redirecting authenticated user from Splash..."); // Optional: Debug log
        navigate(dashboardRoute, { replace: true }); // Redirect to dashboard
      }, 350); // ~350ms delay
    }
    // Cleanup function to clear the timer if the component unmounts
    // or if isAuthenticated becomes false before the timer fires
    return () => {
        if (redirectTimerId) {
            clearTimeout(redirectTimerId);
        }
    };
  }, [isAuthenticated, navigate, dashboardRoute]); // Dependencies

  // Scroll Event Listener (unchanged)
  useMotionValueEvent(scrollY, "change", (latest) => {
    const scrollThreshold = 100;
    setShowAboutSection(latest > scrollThreshold);
    setShowScrollArrow(latest <= scrollThreshold);
  });

   // Initial scroll state effect (unchanged)
   useEffect(() => {
    const initialScroll = scrollY.get();
    setShowAboutSection(initialScroll > 100);
    setShowScrollArrow(initialScroll <= 100);
   }, [scrollY]);


  return (
    <motion.div
      // Note: The parent div must exist for FloatingPaths background from App.js
      className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-white/70 dark:bg-gray-950/70 px-4 pt-20 transition-colors duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* FloatingPaths is rendered in App.js */}

      {/* Hero Section (unchanged) */}
      <div className="flex flex-col items-center justify-center text-center min-h-[calc(80vh)] sm:min-h-[calc(70vh)] relative z-10">
         {/* ... title and buttons ... */}
          <div className="relative mb-10">
            <h1 className="relative text-[80px] sm:text-[96px] md:text-[112px] font-extrabold tracking-tight text-center bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-white/80 text-transparent bg-clip-text leading-tight pb-1">
              Turbinix
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-[80px] sm:text-[96px] md:text-[112px] font-extrabold text-blue-500/30 dark:text-white/30 blur-2xl animate-pulse-glow select-none pointer-events-none">
                Turbinix
              </h1>
            </div>
         </div>
         <div className="z-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-black text-white dark:bg-white dark:text-black px-7 py-2.5 text-base font-semibold shadow hover:shadow-xl transition hover:scale-105"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-black text-white dark:bg-white dark:text-black px-7 py-2.5 text-base font-semibold shadow hover:shadow-xl transition hover:scale-105"
            >
              Log In
            </Link>
         </div>
      </div>


      {/* "Take Control" Section (unchanged) */}
      <div className="w-full max-w-5xl mx-auto py-16 md:py-24 min-h-[300px]">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{
              opacity: showAboutSection ? 1 : 0,
              y: showAboutSection ? 0 : 50
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="absolute inset-0 z-0 rounded-2xl bg-gray-100/50 dark:bg-black/30 backdrop-blur-md border border-gray-300 dark:border-white/10 shadow-xl"></div>
          <div className="relative z-10 p-8 md:p-12 text-center">
             <AboutSectionContent />
          </div>
        </motion.div>
      </div>

      <ScrollIndicatorArrow isVisible={showScrollArrow} />
      {/* ThemeToggle rendered globally */}
    </motion.div>
  );
}

export default Splash;
