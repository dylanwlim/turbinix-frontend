// src/FloatingLinesLayout.js
import React from 'react';
import FloatingPaths from './FloatingPaths';

const FloatingLinesLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4 py-12">
      {/* Shared persistent background */}
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      {/* Foreground content */}
      <div className="relative z-10 w-full max-w-xl">
        {children}
      </div>
    </div>
  );
};

export default FloatingLinesLayout;
