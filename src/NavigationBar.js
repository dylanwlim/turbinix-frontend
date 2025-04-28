// src/NavigationBar.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Removed useAnimation as it wasn't used
import {
  Menu, X, UserCircle, Settings, LogOut, LayoutDashboard, Wallet, // Budget
  BarChart3, // Investments icon
  FileText, // Documents
  HelpCircle // Help Center
  // Removed unused icons: Sparkles, Briefcase, Landmark
} from 'lucide-react'; // Added UserCircle here

// --- Configuration ---
const navLinks = [
  { to: '/finance', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
  { to: '/investments', icon: BarChart3, label: 'Investments' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/updateshelp', icon: HelpCircle, label: 'Help' },
  // Settings is now only in the avatar menu
];

// --- Framer Motion Variants ---
const sidebarVariants = {
  hidden: {
    x: '-100%',
    opacity: 0.8,
    transition: {
       when: "afterChildren",
       staggerChildren: 0.03,
       staggerDirection: -1,
       type: "tween",
       ease: [0.4, 0, 0.2, 1],
       duration: 0.3
    }
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
      type: "spring",
      stiffness: 350,
      damping: 30,
    }
  }
};

const itemVariants = {
  hidden: i => ({
      x: -30 - i * 5,
      opacity: 0,
      rotate: -15 - i * 2,
      transition: {
          type: "spring", stiffness: 200, damping: 15 + i * 2
      }
  }),
  visible: i => ({
      x: 0,
      opacity: 1,
      rotate: 0,
      transition: {
         type: "spring", stiffness: 300, damping: 25,
         delay: i * 0.04
      }
  })
};

const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -5, transition: { duration: 0.15, ease: "easeOut" } },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "easeIn" } }
};

// --- Helper: Get Initials ---
const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return null;
    const names = fullName.trim().split(' ');
    if (names.length === 1 && names[0]) return names[0][0].toUpperCase();
    if (names.length > 1 && names[0] && names[names.length - 1]) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return null;
};

// --- Main Component ---
function NavigationBar({ onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userInitials, setUserInitials] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);

  // Load initials on mount
  useEffect(() => {
      const fullName = localStorage.getItem('fullName');
      setUserInitials(getInitials(fullName));
  }, []);

  // Scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close account menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Callbacks ---
  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
  const toggleAccountMenu = useCallback(() => setIsAccountMenuOpen(prev => !prev), []);
  const closeMenus = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, []);

  const handleLogoutClick = useCallback(() => {
     closeMenus();
     if (onLogout) {
         onLogout(); // Use the handler passed from App.js
     } else {
         console.warn("onLogout prop missing - performing fallback logout.");
         localStorage.clear(); // Clear all local storage as a fallback
         navigate('/', { replace: true });
         window.location.reload(); // Force reload to ensure state reset
     }
  }, [onLogout, closeMenus, navigate]);

  // Active link check
   const isActive = (path) => {
      // Handle base dashboard route also highlighting when on '/' after login, if desired.
      // If '/' should NOT highlight dashboard, remove the `|| location.pathname === '/'` part.
      if (path === '/finance') {
          return location.pathname === path || location.pathname === '/';
      }
      // For other paths, check if the current location starts with the path
      // This handles nested routes correctly, e.g., /settings/profile should highlight /settings
      return location.pathname.startsWith(path) && path !== '/'; // Avoid matching root always
   };

  // --- Sub-Components ---
  const NavLinkContent = ({ icon: Icon, label, disabled, isMobile }) => (
    <>
      {Icon && <Icon size={isMobile ? 20 : 18} className="flex-shrink-0" />}
      <span className={isMobile ? '' : 'text-sm'}>{label}</span>
      {disabled && <span className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 ml-auto">(Soon)</span>}
    </>
  );

  const NavLinkItem = ({ to, icon, label, disabled = false, isMobile = false, index = 0 }) => {
    const active = isActive(to);
    const commonClasses = `flex items-center gap-3 transition-all duration-300 ease-in-out group relative ${isMobile ? 'px-4 py-3 rounded-lg' : 'px-3 py-2 rounded-md h-9'}`;
    const activeClasses = isMobile
        ? 'text-blue-600 dark:text-sky-400 bg-blue-100 dark:bg-sky-900/50 font-semibold' // Brighter mobile active bg
        : 'text-blue-600 dark:text-sky-400 font-medium';
    const inactiveClasses = `text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white ${isMobile ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800' : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60'}`; // Slightly different hover for desktop
    const disabledClasses = 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50 pointer-events-none';

    const motionProps = isMobile ? { variants: itemVariants, custom: index, layout: "position" } : {};
    const content = <NavLinkContent icon={icon} label={label} disabled={disabled} isMobile={isMobile} />;

    if (disabled) {
      return (
        <motion.div {...motionProps} className={`${commonClasses} ${disabledClasses}`}>
          {content}
        </motion.div>
      );
    }

    return (
      <motion.div {...motionProps} className="relative"> {/* Added relative for underline */}
        <Link
          to={to}
          onClick={closeMenus}
          className={`${commonClasses} ${active ? activeClasses : inactiveClasses}`}
          aria-current={active ? 'page' : undefined}
        >
          {content}
          {/* Desktop Active Indicator - Underline with Glow */}
          {!isMobile && active && (
              <motion.div
                  className="absolute bottom-[-2px] left-1 right-1 h-[3px] bg-gradient-to-r from-blue-500 to-sky-500 rounded-full shadow-[0_0_8px_0px] shadow-sky-500/70 dark:shadow-sky-400/60" // Added glow via shadow
                  layoutId="activeUnderline"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
          )}
         </Link>
      </motion.div>
    );
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 h-16 transition-all duration-300 ease-in-out ${isScrolled ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-md' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to="/finance" onClick={closeMenus} className="flex items-center gap-2 flex-shrink-0 group">
             <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 dark:text-sky-500 transition-transform duration-300 group-hover:scale-110">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-semibold text-xl text-zinc-800 dark:text-white tracking-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-sky-500">Turbinix</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <NavLinkItem key={link.to} {...link} />
            ))}
          </div>

          {/* Right Side: Account Menu & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account Menu Dropdown */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={toggleAccountMenu}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:ring-2 hover:ring-blue-400 dark:hover:ring-sky-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                aria-label="Account menu"
              >
                {userInitials ? (
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 select-none">{userInitials}</span>
                ) : (
                    <UserCircle size={20} className="text-zinc-600 dark:text-zinc-400" />
                )}
              </button>
              <AnimatePresence>
                {isAccountMenuOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden py-1.5 ring-1 ring-black/5 dark:ring-white/10"
                  >
                    <Link
                        to="/settings"
                        onClick={closeMenus}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-colors"
                    >
                        <Settings size={16} /> Settings
                    </Link>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1 mx-2"></div>
                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                    >
                       <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 -mr-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-sky-500 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <AnimatePresence initial={false} mode="wait">
                   <motion.div
                       key={isMobileMenuOpen ? 'close' : 'open'}
                       initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                       animate={{ opacity: 1, rotate: 0, scale: 1 }}
                       exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                       transition={{ duration: 0.2 }}
                       style={{ display: 'flex' }} // Ensure icon takes space during animation
                   >
                     {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                   </motion.div>
                 </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
           <>
            {/* Overlay */}
             <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.3 }}
                 className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
                 onClick={toggleMobileMenu} // Close on overlay click
             />
              {/* Sidebar Content */}
              <motion.div
                key="mobile-sidebar"
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 shadow-xl border-r border-zinc-200 dark:border-zinc-800 p-4 md:hidden flex flex-col"
               >
                {/* Sidebar Header */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <span className="font-semibold text-lg text-zinc-800 dark:text-white">Menu</span>
                    <button onClick={toggleMobileMenu} className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <motion.ul
                  className="space-y-1.5 flex-grow overflow-y-auto" // Allow scroll if needed
                  variants={sidebarVariants} // Controls stagger timing
                >
                   {navLinks.map((link, index) => (
                      // Wrap <li> with motion for individual animation control
                      <motion.li key={link.to} custom={index} variants={itemVariants}>
                          <NavLinkItem {...link} isMobile={true} />
                      </motion.li>
                   ))}
                 </motion.ul>

                 {/* Logout Button at bottom */}
                 <motion.div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-700/50" custom={navLinks.length} variants={itemVariants}>
                     <button
                         onClick={handleLogoutClick}
                         className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                     >
                        <LogOut size={20} /> Logout
                     </button>
                 </motion.div>
              </motion.div>
           </>
        )}
      </AnimatePresence>

      {/* Spacer div for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}

export default NavigationBar;