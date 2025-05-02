// src/FinanceDashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaidLink } from 'react-plaid-link'; // <<< Import Plaid Link
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import EntryFormModal from './EntryFormModal';

// --- Constants & Helpers ---
const USER_DATA_KEY = 'userData';
const API_URL = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com'; // Use backend URL

// Tooltip Component
const CustomTooltip = ({ active, payload, label, currency = '$' }) => {
  // Label comes pre-formatted from getFilteredDataAndInterval/tickFormatter
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-1.5 bg-gray-800 dark:bg-zinc-950/80 text-white text-xs rounded-lg shadow-lg border border-white/10 backdrop-blur-sm">
        <p className="font-semibold mb-0.5">{label}</p>
        <p className="text-base font-medium">{`${currency}${payload[0].value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
      </div>
    );
  }
  return null;
};


// Default structure for new user data
const defaultUserData = {
    assets: {
        'Real Estate': [],
        Savings: [],
        Checking: [],
        Securities: [],
      },
      liabilities: {
        Loans: [],
      },
    spending: { spentThisMonth: 0, latestTransactions: [] },
    investments: { totalValue: 0, changePercent: 0, history: [] },
    frequentExpenses: [],
};

// Format timestamp for display
const formatTimestamp = (isoString) => {
  if (!isoString) return 'Updated recently';
  const date = new Date(isoString);
  const now = new Date();
  const diffSeconds = Math.round((now - date) / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// Format date for XAxis based on the selected time range AND total data points
const formatDateForAxis = (dateString, range, totalPoints) => {
    const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone interpretation
    if (isNaN(date.getTime())) return ''; // Handle invalid dates

    const isDense = totalPoints > 30; // Example threshold for density

    switch (range) {
        case 'ALL':
            // Format as YYYY for very sparse, MM/YY for medium, M/D for dense (shouldn't happen for ALL)
            if (totalPoints < 15) return date.getFullYear().toString();
            return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
        case 'YTD':
            // Format as Mon for sparse, M/D for dense
            if (isDense) return `${date.getMonth() + 1}/${date.getDate()}`;
            return date.toLocaleString('default', { month: 'short' });
        case '3M':
             // Format as Mon D for sparse, M/D for dense
            if (isDense) return `${date.getMonth() + 1}/${date.getDate()}`;
             return date.toLocaleString('default', { month: 'short', day: 'numeric' });
        case '1M':
        case '1W':
        default:
             // Format as M/D
            return `${date.getMonth() + 1}/${date.getDate()}`;
    }
};

// Helper to determine optimal tick interval and filter data for chart clarity
const getFilteredDataAndInterval = (data, range) => {
    const n = data.length;
    if (n <= 1) return { filteredData: data, interval: 0, tickFormatter: (tick) => formatDateForAxis(tick, range, n) };

    let maxTicks;
    let interval;

    // Adjust maxTicks based on range for desired density
    switch (range) {
        case '1W': maxTicks = 7; break;
        case '1M': maxTicks = 8; break; // e.g., weekly labels
        case '3M': maxTicks = 10; break; // e.g., ~bi-weekly labels
        case 'YTD': maxTicks = 12; break; // e.g., monthly labels
        case 'ALL': maxTicks = n > 365 ? 12 : 8; break; // e.g., quarterly/yearly for multi-year
        default: maxTicks = 10;
    }

    if (n <= maxTicks) {
        interval = 0; // Show all ticks if fewer than max
    } else {
        interval = Math.max(0, Math.floor(n / maxTicks) -1); // Calculate interval to approximate maxTicks
    }

    // Format the name property *before* passing to chart for CustomTooltip label
     const formattedData = data.map(point => ({
        ...point,
        // Pass total points for context-aware formatting
        formattedName: formatDateForAxis(point.date, range, n)
     }));

    return {
      filteredData: formattedData,
      interval: interval,
      // Tick formatter now receives the original date string ('name')
      tickFormatter: (tick) => formatDateForAxis(tick, range, n)
    };
};


// --- Main Component ---
function FinanceDashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('assets');
  const [netWorthTimeRange, setNetWorthTimeRange] = useState('ALL');

  // Initialize userData ensuring defaults are deeply merged
  const [userData, setUserData] = useState(() => {
    const stored = localStorage.getItem(USER_DATA_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Deep merge function
        const mergeWithDefaults = (target, source) => {
           // Ensure target is an object before merging
           if (typeof target !== 'object' || target === null) {
             target = {};
           }
          const sourceCopy = JSON.parse(JSON.stringify(source)); // Deep copy defaults

          for (const key of Object.keys(sourceCopy)) {
             if (sourceCopy[key] instanceof Object && !(sourceCopy[key] instanceof Array) && !(sourceCopy[key] === null)) {
                 // Ensure target key exists and is an object before recursing
                 if (typeof target[key] === 'undefined') {
                     target[key] = {};
                 } else if (typeof target[key] !== 'object' || target[key] === null || Array.isArray(target[key])) {
                     target[key] = {}; // Overwrite if target is not a compatible object
                 }
                 target[key] = mergeWithDefaults(target[key], sourceCopy[key]);
             } else if (!(key in target) || target[key] === undefined || target[key] === null) {
                 // Copy value from defaults only if missing or null/undefined in target
                 target[key] = sourceCopy[key];
            } else if (sourceCopy[key] instanceof Array && !(target[key] instanceof Array)) {
                 // If default is array but target isn't, use default (e.g., initializing empty lists)
                 target[key] = sourceCopy[key];
            }
          }
          return target;
        };
        return mergeWithDefaults(parsed, defaultUserData);
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        return JSON.parse(JSON.stringify(defaultUserData)); // Deep copy default on error
      }
    }
    return JSON.parse(JSON.stringify(defaultUserData)); // Deep copy default initially
  });

  const [username, setUsername] = useState('');

  // --- Plaid Link State ---
  const [linkToken, setLinkToken] = useState(null);
  const [isPlaidOpen, setIsPlaidOpen] = useState(false); // <<< Track Plaid modal state

  // --- Modal States (Entry Form, Breakdown) ---
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryModalMode, setEntryModalMode] = useState('add');
  const [currentEntryCategory, setCurrentEntryCategory] = useState({ type: '', name: '' });
  const [currentItemToEdit, setCurrentItemToEdit] = useState(null);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false); // State for "Coming Soon" modal


  // --- Fetch Link Token ---
  const createLinkToken = useCallback(async () => {
    // Fetch the link_token
    try {
      const response = await fetch(`${API_URL}/api/create_link_token`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create link token');
      }
      console.log("Link token created:", data.link_token);
      setLinkToken(data.link_token);
    } catch (error) {
      console.error("Error creating link token:", error);
      // Handle error appropriately, maybe show a message to the user
    }
  }, []);

  // --- Configure Plaid Link ---
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      console.log('Plaid Link Success:', public_token, metadata);
      // Here you would typically send the public_token to your backend
      // to exchange it for an access_token.
      // Example: sendTokenToBackend(public_token);
      setIsPlaidOpen(false); // Close the security text
    },
    onExit: (err, metadata) => {
      console.log('Plaid Link exited:', err, metadata);
      setIsPlaidOpen(false); // Close the security text
      // Optionally refetch token if needed based on error/metadata
      if (err?.error_code === 'INVALID_LINK_TOKEN') {
          setLinkToken(null); // Reset token if invalid
          createLinkToken(); // Attempt to fetch a new one
      }
    },
    onOpen: () => {
        setIsPlaidOpen(true); // Show the security text
    },
    // Add other event handlers as needed (onEvent, etc.)
  });


   // --- Trigger Plaid Link Open ---
   const handleLinkAccountClick = useCallback(async () => {
      // Ensure token exists before opening
      if (!linkToken) {
          await createLinkToken(); // Fetch token if not available
      }
      // The useEffect below will open Plaid once linkToken is set and ready is true
  }, [linkToken, createLinkToken]);

   // Effect to open Plaid Link when token is ready and button is clicked
   // (This handles the case where token fetch is async)
   useEffect(() => {
        if (linkToken && ready) {
            open(); // Open Plaid Link automatically once token and ready state are true
        }
   }, [linkToken, ready, open]);


  // --- Persist Data ---
  useEffect(() => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }, [userData]);

  // --- Fetch Username ---
  useEffect(() => {
     const storedFullName = localStorage.getItem('fullName');
     const storedUsername = localStorage.getItem('user');
     setUsername(storedFullName?.split(' ')[0] || storedUsername || 'there');
  }, []);

  // --- Calculations ---
  const { assets, liabilities, spending, investments, frequentExpenses } = userData;
  const calculateTotal = (items) => (items || []).reduce((sum, i) => sum + (Number(i.value) || 0), 0);
  const allAssets = Object.values(assets || {}).flat();
  const allLiabilities = Object.values(liabilities || {}).flat();
  const totalAssets = calculateTotal(allAssets);
  const totalLiabilities = calculateTotal(allLiabilities);
  const currentNetWorth = totalAssets - totalLiabilities;
  const hasAnyData = allAssets.length > 0 || allLiabilities.length > 0; // Check if user added any data


  // --- Color Mapping ---
  const colorMap = {
    'Real Estate': '#22c55e', Savings: '#84cc16', Checking: '#eab308',
    Securities: '#38bdf8', Loans: '#ef4444', Default: '#a1a1aa',
  };

  // --- Generate Net Worth Data (Handles No Data Case) ---
  const netWorthChartData = useMemo(() => {
    const now = new Date();
    const data = [];
    let daysToShow;
    let startDate = new Date();

    // Determine date range
    switch (netWorthTimeRange) {
      case '1W': daysToShow = 7; startDate.setDate(now.getDate() - 6); break;
      case '1M': daysToShow = 30; startDate.setMonth(now.getMonth() - 1); break;
      case '3M': daysToShow = 90; startDate.setMonth(now.getMonth() - 3); break;
      case 'YTD': startDate = new Date(now.getFullYear(), 0, 1); daysToShow = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)) + 1; break;
      case 'ALL':
      default: daysToShow = 365; startDate.setFullYear(now.getFullYear() - 1); break;
    }
    if (daysToShow <= 0) daysToShow = 1;

    // If no user data exists, show a flat line at zero
    if (!hasAnyData) {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = now.toISOString().split('T')[0];
       return [
           { date: startStr, name: startStr, value: 0, formattedName: formatDateForAxis(startStr, netWorthTimeRange, 2) },
           { date: endStr, name: endStr, value: 0, formattedName: formatDateForAxis(endStr, netWorthTimeRange, 2) }
       ];
    }

    // Generate synthetic data ONLY if user has data
    const startingMultiplier = 0.8 + Math.random() * 0.15;
    let value = currentNetWorth * startingMultiplier;
    const fluctuationFactor = (0.001 + Math.random() * 0.005) * (Math.abs(currentNetWorth) || 1000);

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      if (i === daysToShow - 1 && date <= now) {
        value = currentNetWorth;
      } else if (date < now) {
        const changeDirection = Math.random() < 0.51 ? 1 : -1;
        const changeAmount = changeDirection * fluctuationFactor * (0.5 + Math.random());
        value += changeAmount;
        if (currentNetWorth >= 0 && value < 0) value = 0;
        if (currentNetWorth < 0 && value > 0) value = 0;
      } else if (date > now) {
           continue;
      }

      data.push({
         date: dateStr,
         name: dateStr, // Pass raw date string for filtering/interval calculation
         value: parseFloat(value.toFixed(2))
       });
    }

    // Ensure the last point is accurate
    const todayStr = now.toISOString().split('T')[0];
    const lastPoint = data[data.length - 1];
    if (lastPoint && lastPoint.date === todayStr) {
        lastPoint.value = parseFloat(currentNetWorth.toFixed(2));
    } else if (!data.find(p => p.date === todayStr) && daysToShow > 0) { // Add today if missing and data exists
        data.push({
           date: todayStr,
            name: todayStr,
            value: parseFloat(currentNetWorth.toFixed(2)),
        });
    }

    // Ensure minimum 2 data points if data exists
    if (data.length === 1) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
         data.unshift({
             date: yesterdayStr,
             name: yesterdayStr,
             value: parseFloat((data[0].value * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)), // Slight variation
         });
    }

    return data;
  }, [netWorthTimeRange, currentNetWorth, hasAnyData]); // Depend on hasAnyData

  // --- Filtered Data and Interval for Net Worth Chart ---
  const { filteredData: filteredNetWorthData, interval: netWorthInterval, tickFormatter: netWorthTickFormatter } = useMemo(() => {
      return getFilteredDataAndInterval(netWorthChartData, netWorthTimeRange);
  }, [netWorthChartData, netWorthTimeRange]);


  // --- Generate Spending Mini-Graph Data ---
  const spendingChartData = useMemo(() => {
     const transactions = spending?.latestTransactions || [];
     if (transactions.length === 0) {
        return [ { name: 'Start', value: 0 }, { name: 'Now', value: 0 }, ]; // Start at zero if no data
    }
     const recentSpending = transactions
         .slice(0, 7)
         .map(tx => ({
             name: formatDateForAxis(tx.date, '1W', transactions.length), // Use short date format
             value: Math.abs(tx.amount || 0)
         }))
         .reverse();

     if(recentSpending.length < 2) {
         recentSpending.unshift({ name: 'Earlier', value: recentSpending[0]?.value * 0.8 || 0 }); // Start near zero
         if(recentSpending.length < 2) recentSpending.push({ name: 'Now', value: recentSpending[0]?.value * 1.1 || 0 });
     }
     return recentSpending;
  }, [spending?.latestTransactions]);


  // --- Generate Investment Mini-Graph Data ---
  const investmentChartData = useMemo(() => {
    const totalValue = investments?.totalValue || 0;
    if (totalValue <= 0) {
      return [ { name: 'Start', value: 0 }, { name: 'Now', value: 0 }, ];
    } else {
      return [ { name: 'Start', value: totalValue * 0.95 }, { name: '', value: totalValue * 0.98 }, { name: 'Now', value: totalValue } ];
    }
  }, [investments?.totalValue]);


  // --- CRUD Handlers ---
  const handleAddEntry = useCallback((categoryType, categoryName, newEntry) => {
    setUserData(prevData => {
      const updatedCategoryItems = [...(prevData[categoryType]?.[categoryName] || []), newEntry];
      return {
        ...prevData,
        [categoryType]: {
          ...prevData[categoryType],
          [categoryName]: updatedCategoryItems,
        },
      };
    });
  }, []);

  const handleUpdateEntry = useCallback((categoryType, categoryName, updatedEntry) => {
      setUserData(prevData => {
          updatedEntry.lastUpdated = new Date().toISOString();
          const updatedCategoryItems = (prevData[categoryType]?.[categoryName] || []).map(item =>
              item.id === updatedEntry.id ? updatedEntry : item
          );
          return {
              ...prevData,
              [categoryType]: {
                  ...prevData[categoryType],
                  [categoryName]: updatedCategoryItems,
              },
          };
      });
  }, []);

  const handleDeleteEntry = useCallback((categoryType, categoryName, entryId) => {
    setUserData(prevData => {
      const updatedCategoryItems = (prevData[categoryType]?.[categoryName] || []).filter(item => item.id !== entryId);
      return {
        ...prevData,
        [categoryType]: {
          ...prevData[categoryType],
          [categoryName]: updatedCategoryItems,
        },
      };
    });
  }, []);

  // --- Modal Control (Entry Form) ---
  const openEntryModal = useCallback((mode, categoryType, categoryName, item = null) => {
    setEntryModalMode(mode);
    setCurrentEntryCategory({ type: categoryType, name: categoryName });
    setCurrentItemToEdit(item);
    setIsEntryModalOpen(true);
  }, []);

  const closeEntryModal = useCallback(() => {
    setIsEntryModalOpen(false);
    setCurrentItemToEdit(null);
  }, []);

  const handleEntryFormSubmit = useCallback((categoryType, categoryName, entryData) => {
    if (entryModalMode === 'add') {
      handleAddEntry(categoryType, categoryName, entryData);
    } else {
      handleUpdateEntry(categoryType, categoryName, entryData);
    }
  }, [entryModalMode, handleAddEntry, handleUpdateEntry]);

  // --- Child Components ---

  // Collapsible Section - Set closed by default
  const CollapsibleSection = ({ title, color, items, categoryType }) => {
    const [isOpen, setIsOpen] = useState(false); // <<< Set to false by default
    const total = calculateTotal(items);
    const hasItems = items && items.length > 0;

    return (
      <div className="mt-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        {/* Header Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-4 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 rounded-xl" // Apply rounding here too if needed when closed
          aria-expanded={isOpen}
          aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
        >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color || colorMap.Default }}></span>
            <h3 className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
             {hasItems && <div className="text-sm font-semibold text-zinc-900 dark:text-white">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div> }
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </button>

        {/* Content Area */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={`section-content-${title.replace(/\s+/g, '-')}`}
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: 'auto' },
                collapsed: { opacity: 0, height: 0 }
              }}
              transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden border-t border-zinc-200 dark:border-zinc-800" // Border appears only when open
            >
              <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Display Items */}
                {(items || []).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openEntryModal('edit', categoryType, title, item)}
                    className="text-left rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-4 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent transition-all duration-150"
                  >
                    <p className="text-sm font-medium truncate text-zinc-800 dark:text-zinc-200">{item.name}</p>
                    <p className="text-xl font-bold mt-1 text-zinc-900 dark:text-white">${(item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-green-500 dark:text-green-400 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {formatTimestamp(item.lastUpdated)}
                    </p>
                  </button>
                ))}

                {/* Add New Item Button */}
                <button
                  onClick={() => openEntryModal('add', categoryType, title)}
                  className="rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-4 flex flex-col items-center justify-center text-zinc-500 hover:border-blue-400 dark:hover:border-sky-600 hover:text-blue-600 dark:hover:text-sky-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent"
                  aria-label={`Add new item to ${title}`}
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-sm font-medium">Add Item</span>
                </button>

                {/* Message when no items */}
                 {items?.length === 0 && ( // Simplified check
                    <div className="md:col-span-2 lg:col-span-3 text-center py-6 px-4">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                        No data yet for {title}.
                      </p>
                     <button
                        onClick={() => openEntryModal('add', categoryType, title)}
                        className="mt-2 text-sm font-medium text-blue-600 dark:text-sky-500 hover:underline"
                    >
                        Add an entry!
                     </button>
                    </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };


   // Breakdown "Coming Soon" Modal
   const BreakdownComingSoonModal = () => {
     if (!showBreakdownModal) return null;
     return (
       <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300">
         <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           transition={{ duration: 0.2 }}
           className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-2xl w-full max-w-sm shadow-xl p-6 border border-zinc-200 dark:border-zinc-800"
         >
           <h2 className="text-lg font-semibold mb-3 text-center">Coming Soon</h2>
           <p className="text-sm text-zinc-600 dark:text-zinc-300 text-center mb-5">
             Full breakdowns available in Beta v1.2 with Plaid Integration.
           </p>
           <button
             onClick={() => setShowBreakdownModal(false)}
             className="w-full py-2 px-4 bg-blue-600 dark:bg-sky-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-sky-700 transition text-sm font-medium"
           >
             OK
           </button>
         </motion.div>
       </div>
     );
   };

  // --- Main Render ---
  return (
    <div className="min-h-screen px-4 sm:px-6 pt-10 pb-20 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            Hello, {username.charAt(0).toUpperCase() + username.slice(1)}
          </h1>
          {/* --- Updated Account Button and Plaid Security Text --- */}
          <div className="flex flex-col items-end">
             <button
               onClick={handleLinkAccountClick}
               disabled={!ready && !linkToken} // Disable button briefly while fetching token first time
               className={`flex items-center gap-1 rounded-full border border-zinc-300 dark:border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-950 ${(!ready && !linkToken) ? 'opacity-70 cursor-wait' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Account
              </button>
              {/* Conditional Plaid Security Text */}
              {isPlaidOpen && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 animate-fade-in">
                      <i>Bank-grade security powered by Plaid</i>
                  </p>
               )}
           </div>
          {/* --- End Updated Account Button --- */}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Net Worth & Assets/Liabilities */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow border border-zinc-200 dark:border-zinc-800">
            {/* Net Worth Section */}
            <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mb-1">Net Worth</h2>
             <p className="text-3xl sm:text-4xl font-bold mb-1 text-zinc-900 dark:text-white">${currentNetWorth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <div className="text-sm text-green-600 dark:text-green-500 mb-4">Dynamic change TBD</div>
            <div className="h-56 sm:h-64 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                  {/* Check if there's actual data to display */}
                  {filteredNetWorthData.length > 1 ? (
                    <LineChart data={filteredNetWorthData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                         <XAxis
                            dataKey="name" // Use original date string for indexing ticks
                            fontSize={10}
                            tick={{ fill: 'currentColor', opacity: 0.6 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            interval={netWorthInterval} // Use calculated interval
                            tickFormatter={netWorthTickFormatter} // Use calculated formatter
                          />
                        <YAxis fontSize={10} tick={{ fill: 'currentColor', opacity: 0.6 }} tickLine={false} axisLine={false} dx={-5} tickFormatter={(val) => `$${val.toLocaleString()}`} domain={['auto', 'auto']}/>
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
                            labelFormatter={(label, payload) => {
                                // Use the formattedName from the payload if available
                                return payload?.[0]?.payload?.formattedName || label;
                            }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#16a34a', stroke: 'var(--background)', strokeWidth: 2 }} />
                         <Area type="monotone" dataKey="value" stroke={false} fill="url(#netWorthGradient)" />
                    </LineChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400 italic">
                        {hasAnyData ? 'Not enough data for history.' : 'Add assets or liabilities to track net worth.'}
                    </div>
                  )}
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center space-x-1 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 w-fit mx-auto mb-6">
              {["1W", "1M", "3M", "YTD", "ALL"].map((label) => (
                <button key={label} onClick={() => setNetWorthTimeRange(label)} className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-150 ${netWorthTimeRange === label ? "bg-white text-zinc-800 dark:bg-black dark:text-white shadow" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Assets/Liabilities Toggle */}
            <div className="flex items-center justify-center space-x-1 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 w-fit mx-auto mb-4">
              <button className={`px-4 py-1 text-sm font-medium rounded-full transition ${selectedTab === 'assets' ? 'bg-white dark:bg-zinc-950 text-black dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`} onClick={() => setSelectedTab('assets')}>
                Assets
              </button>
              <button className={`px-4 py-1 text-sm font-medium rounded-full transition ${selectedTab === 'liabilities' ? 'bg-white dark:bg-zinc-950 text-black dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`} onClick={() => setSelectedTab('liabilities')}>
                Liabilities
              </button>
            </div>

            {/* Collapsible Sections */}
            <div className="mt-4 space-y-4">
              {Object.entries(userData[selectedTab] || {}).map(([categoryName, items]) => (
                <CollapsibleSection
                  key={`${selectedTab}-${categoryName}`}
                  title={categoryName}
                  color={colorMap[categoryName] || colorMap.Default}
                  items={items}
                  categoryType={selectedTab}
                />
              ))}
              {/* Add Category Section Button - Placeholder */}
              <button className="w-full mt-4 py-3 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-150 flex items-center justify-center gap-2 text-sm font-medium opacity-50 cursor-not-allowed" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add Category Section (Soon)
              </button>
            </div>
          </div>

          {/* Right Column: Info Cards */}
          <div className="space-y-6">
             {/* Spending Card - Make clickable */}
             <div
               className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:shadow-lg transition-shadow duration-150"
               onClick={() => navigate('/budget')}
               role="button"
               tabIndex={0}
               onKeyDown={(e) => e.key === 'Enter' && navigate('/budget')} // Accessibility
             >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">Spending</h2>
                  {/* Arrow removed */}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Spent this month</p>
                 <p className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">${(spending?.spentThisMonth || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                 <div className="h-20 w-full mb-5">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={spendingChartData} margin={{ top: 5, right: 0, left: 0, bottom: -10 }}>
                         <defs><linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                        <Tooltip content={<CustomTooltip currency='Spent: $'/>} cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} fill="url(#spendingGradient)" dot={false} />
                       </AreaChart>
                   </ResponsiveContainer>
                 </div>
                <p className="text-sm font-semibold mb-2 text-zinc-800 dark:text-zinc-200">Latest transactions</p>
                <div className="space-y-2 text-sm">
                   {(spending?.latestTransactions || []).length > 0 ? (
                       (spending?.latestTransactions || []).slice(0, 3).map((tx) => (
                         <div key={tx.id || tx.name} className="flex justify-between items-center">
                           <span className="text-zinc-700 dark:text-zinc-300 truncate pr-2">{tx.title || tx.name}</span>
                           <span className={`font-medium ${tx.amount >= 0 ? 'text-green-600 dark:text-green-500' : 'text-zinc-600 dark:text-zinc-400'}`}>
                             {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                           </span>
                         </div>
                       ))
                    ) : (
                       <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">No transactions this month yet.</p>
                    )}
                </div>
                 {(spending?.latestTransactions?.length > 3) && (
                   <button
                     onClick={(e) => { e.stopPropagation(); navigate('/budget'); }} // Prevent card click too, navigate directly
                     className="w-full mt-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                     See all transactions
                   </button>
                 )}
              </div>

             {/* Investments Portfolio - Make clickable */}
             <div
               className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:shadow-lg transition-shadow duration-150"
               onClick={() => navigate('/investments')} // Navigate to /investments
               role="button"
               tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/investments')} // Accessibility
             >
                 <div className="flex items-center justify-between mb-2">
                   <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">Investments</h2>
                    {/* Arrow removed */}
                 </div>
                 <p className="text-xs text-zinc-500 dark:text-zinc-400">Total value</p>
                 <div className="flex items-baseline justify-between mb-1">
                   <p className="text-2xl font-bold text-zinc-900 dark:text-white">${(investments?.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                   {investments?.changePercent !== undefined && (
                      <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${(investments?.changePercent || 0) >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'}`}>
                         {(investments?.changePercent || 0) >= 0 ? '+' : ''}{(investments?.changePercent || 0).toFixed(2)}%
                      </div>
                   )}
                 </div>
                 <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={investmentChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs><linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient></defs>
                          <Tooltip content={<CustomTooltip />} cursor={false} />
                          <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={1.5} fill="url(#investmentGradient)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

             {/* Most Frequent Expenses (Breakdown) - Placeholder */}
             <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mb-1">Breakdown</h2>
                <h3 className="text-base font-bold mb-4 text-zinc-800 dark:text-zinc-200">Most Frequent Expenses</h3>
                {(frequentExpenses || []).length > 0 ? (
                  (frequentExpenses || []).map((e) => (
                    <div key={e.id} className="mb-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                         <div className="flex items-center font-semibold text-sm mb-2 text-zinc-800 dark:text-zinc-200"> <span className="text-base mr-2">{e.icon || '❓'}</span> <span>{e.title || 'Expense'}</span> </div> <div className="text-xs text-zinc-600 dark:text-zinc-400 grid grid-cols-3 gap-2"> <div><p className="text-zinc-500 dark:text-zinc-500">This month</p><p className="font-medium text-zinc-700 dark:text-zinc-300">{e.times || 0}x</p></div> <div><p className="text-zinc-500 dark:text-zinc-500">Avg. spent</p><p className="font-medium text-zinc-700 dark:text-zinc-300">${(e.avg || 0).toFixed(2)}</p></div> <div><p className="text-zinc-500 dark:text-zinc-500">Total</p><p className="font-medium text-zinc-700 dark:text-zinc-300">${(e.total || 0).toFixed(2)}</p></div> </div>
                      </div>
                  ))
                 ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mb-4">No recurring expenses tracked yet.</p>
                 )}
                 {/* Updated Button for Coming Soon Modal */}
                 <button
                    onClick={() => setShowBreakdownModal(true)} // Trigger the new modal
                    className="w-full mt-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                   See full breakdown
                 </button>
             </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      <BreakdownComingSoonModal />

      <AnimatePresence>
        {isEntryModalOpen && (
          <EntryFormModal
            isOpen={isEntryModalOpen}
            onClose={closeEntryModal}
            onSubmit={handleEntryFormSubmit}
            onDelete={handleDeleteEntry}
            mode={entryModalMode}
            categoryType={currentEntryCategory.type}
            categoryName={currentEntryCategory.name}
            itemData={currentItemToEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default FinanceDashboard;