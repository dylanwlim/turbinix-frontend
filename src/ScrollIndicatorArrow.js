// src/ScrollIndicatorArrow.js
import React from 'react';
import { motion } from 'framer-motion';

// Simple chevron component using divs - now with better light mode color
const ChevronDown = () => (
  <div className="w-6 h-6">
    {/* Use darker gray for light mode, light gray/white for dark mode */}
    <span className="block w-3 h-0.5 bg-gray-800 dark:bg-gray-100 transform rotate-45 translate-x-[4px] translate-y-[1px]"></span>
    <span className="block w-3 h-0.5 bg-gray-800 dark:bg-gray-100 transform -rotate-45 translate-x-[11px] -translate-y-[1px]"></span>
  </div>
);

const ScrollIndicatorArrow = ({ isVisible }) => {
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative animate-bounce-slow"> {/* Apply bounce animation */}
        <div className="opacity-60"> {/* Top chevron slightly faded */}
          <ChevronDown />
        </div>
        <div className="absolute top-2 left-0"> {/* Bottom chevron */}
          <ChevronDown />
        </div>
      </div>
    </motion.div>
  );
};

export default ScrollIndicatorArrow;