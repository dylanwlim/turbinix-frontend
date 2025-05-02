// src/PublicFooter.js
import React from 'react';
import { Link } from 'react-router-dom';

function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-4 text-center relative z-20 mt-auto">
      <div className="text-xs text-zinc-500 dark:text-zinc-400 opacity-70 space-x-4">
        <span>&copy; {currentYear} Turbinix, Inc.</span>
        <Link
          to="/privacy"
          className="hover:text-zinc-700 dark:hover:text-zinc-200 hover:opacity-100 hover:underline transition-opacity duration-150"
        >
          Privacy
        </Link>
        <span aria-hidden="true">&middot;</span>
        <Link
          to="/terms"
          className="hover:text-zinc-700 dark:hover:text-zinc-200 hover:opacity-100 hover:underline transition-opacity duration-150"
        >
          Terms
        </Link>
        <span aria-hidden="true">&middot;</span>
        {/* Link to Updates & Help page */}
        <Link
          to="/updateshelp"
          className="hover:text-zinc-700 dark:hover:text-zinc-200 hover:opacity-100 hover:underline transition-opacity duration-150"
        >
          Updates & Help
        </Link>
      </div>
    </footer>
  );
}

export default PublicFooter;