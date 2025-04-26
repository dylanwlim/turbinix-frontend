// src/NavigationBar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, PieChart, Wallet, FileText, Bell, CreditCard, LogOut } from 'lucide-react';

function NavigationBar({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navItems = [
    { to: '/hub', icon: <Home size={18} />, label: 'Dashboard' },
    { to: '/finance', icon: <PieChart size={18} />, label: 'Finance' },
    { to: '/budget', icon: <Wallet size={18} />, label: 'Budget' },
    { to: '/documents', icon: <FileText size={18} />, label: 'Documents' },
    { to: '/updates', icon: <Bell size={18} />, label: 'Updates' },
    { to: '/billing', icon: <CreditCard size={18} />, label: 'Billing' }, // ✅ Billing Link
  ];

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full shadow hover:scale-105 transition-all"
        aria-label="Toggle navigation menu"
      >
        {menuOpen ? <X size={22} className="text-gray-800 dark:text-white" /> : <Menu size={22} className="text-gray-800 dark:text-white" />}
      </button>

      {menuOpen && (
        <div className="absolute top-14 right-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 animate-fade-in overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Navigation</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {navItems.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm transition"
              >
                {icon} {label}
              </Link>
            ))}
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavigationBar;
