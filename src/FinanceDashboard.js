// src/FinanceDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import EntryFormModal from './EntryFormModal'; // Import the new modal

// --- Constants & Helpers ---
const USER_DATA_KEY = 'userData';
const ACCOUNT_MODAL_KEY = 'showAccountModal'; // Example key for another modal

// Dummy data for charts (replace with real data later)
const netWorthData = [ /* ... keep as is ... */ ];
const spendingData = [ /* ... keep as is ... */ ];
const investmentData = [ /* ... keep as is ... */ ];

const CustomTooltip = ({ active, payload, label, currency = '$' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-1 bg-gray-800 dark:bg-zinc-900 text-white text-xs rounded-md shadow-lg border border-white/10 backdrop-blur-sm">
        <p className="font-semibold">{label}</p>
        <p>{`${currency}${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

// Default structure for sections if they don't exist in localStorage
const defaultSpending = { spentThisMonth: 0, latestTransactions: [] };
const defaultInvestments = { totalValue: 0, changePercent: 0 };
const defaultFrequentExpenses = [];
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
    spending: defaultSpending,
    investments: defaultInvestments,
    frequentExpenses: defaultFrequentExpenses,
};

// Function to format date/time nicely
const formatTimestamp = (isoString) => {
  if (!isoString) return 'Updated recently';
  const date = new Date(isoString);
  const now = new Date();
  const diffSeconds = Math.round((now - date) / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};


function FinanceDashboard() {
  const [selectedTab, setSelectedTab] = useState('assets'); // 'assets' or 'liabilities'
  const [netWorthTimeRange, setNetWorthTimeRange] = useState('ALL');
  const [userData, setUserData] = useState(() => {
    const stored = localStorage.getItem(USER_DATA_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Deep merge stored data with defaults to ensure all keys exist
        const mergeWithDefaults = (target, source) => {
          for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && !(source[key] instanceof Array) && key in target) {
              target[key] = mergeWithDefaults(target[key] || {}, source[key]);
            } else if (!(key in target)) { // Only add if key doesn't exist
                target[key] = source[key];
            }
          }
          // Ensure existing array keys are kept even if default is different
          for(const key of Object.keys(target)){
              if (source[key] instanceof Array && !(target[key] instanceof Array)) {
                  target[key] = source[key];
              }
          }
          return target;
        };
        return mergeWithDefaults(parsed, defaultUserData);
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        return defaultUserData; // Fallback to default if parsing fails
      }
    }
    return defaultUserData; // Return default if nothing in localStorage
  });

  const [username, setUsername] = useState('');

  // --- Modal States ---
  const [showAccountModal, setShowAccountModal] = useState(false); // For the bank connection modal
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryModalMode, setEntryModalMode] = useState('add'); // 'add' or 'edit'
  const [currentEntryCategory, setCurrentEntryCategory] = useState({ type: '', name: '' }); // {type: 'assets', name: 'Savings'}
  const [currentItemToEdit, setCurrentItemToEdit] = useState(null); // Holds the item object for editing

  // --- Persist Data to localStorage ---
  useEffect(() => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }, [userData]);

  // --- Fetch Username ---
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || 'there');
  }, []);

  // --- Calculations (Recalculated whenever userData changes) ---
  const { assets, liabilities, spending, investments, frequentExpenses } = userData;

  const calculateTotal = (items) => (items || []).reduce((sum, i) => sum + (i.value || 0), 0);

  const allAssets = Object.values(assets || {}).flat();
  const allLiabilities = Object.values(liabilities || {}).flat();

  const totalAssets = calculateTotal(allAssets);
  const totalLiabilities = calculateTotal(allLiabilities);
  const netWorth = totalAssets - totalLiabilities;

  // --- Color Mapping ---
  const colorMap = {
    'Real Estate': '#22c55e', Savings: '#84cc16', Checking: '#eab308',
    Securities: '#38bdf8', Loans: '#ef4444', Default: '#a1a1aa',
  };

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
          // Ensure timestamp is updated for the edit
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

  // --- Modal Control ---
  const openEntryModal = useCallback((mode, categoryType, categoryName, item = null) => {
    setEntryModalMode(mode);
    setCurrentEntryCategory({ type: categoryType, name: categoryName });
    setCurrentItemToEdit(item);
    setIsEntryModalOpen(true);
  }, []);

  const closeEntryModal = useCallback(() => {
    setIsEntryModalOpen(false);
    setCurrentItemToEdit(null); // Clear item being edited
  }, []);

  const handleEntryFormSubmit = useCallback((categoryType, categoryName, entryData) => {
    if (entryModalMode === 'add') {
      handleAddEntry(categoryType, categoryName, entryData);
    } else {
      handleUpdateEntry(categoryType, categoryName, entryData);
    }
  }, [entryModalMode, handleAddEntry, handleUpdateEntry]);


  // --- Child Components ---

  const CollapsibleSection = ({ title, color, items, categoryType /* 'assets' or 'liabilities' */ }) => {
    const [isOpen, setIsOpen] = useState(true);
    const total = calculateTotal(items);
    const hasItems = items && items.length > 0;

    return (
      <div className="mt-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        {/* Header Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-4 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 rounded-t-xl"
          aria-expanded={isOpen}
          aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
        >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color || colorMap.Default }}></span>
            <h3 className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
             {hasItems && <div className="text-sm font-semibold text-zinc-900 dark:text-white">${total.toLocaleString()}</div> }
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
              className="overflow-hidden border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Display Items */}
                {(items || []).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openEntryModal('edit', categoryType, title, item)} // Open edit modal on click
                    className="text-left rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-4 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent transition-all duration-150"
                  >
                    <p className="text-sm font-medium truncate text-zinc-800 dark:text-zinc-200">{item.name}</p>
                    <p className="text-xl font-bold mt-1 text-zinc-900 dark:text-white">${(item.value || 0).toLocaleString()}</p>
                    <p className="text-xs text-green-500 dark:text-green-400 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {formatTimestamp(item.lastUpdated)}
                    </p>
                  </button>
                ))}

                {/* Add New Item Button */}
                <button
                  onClick={() => openEntryModal('add', categoryType, title)} // Open add modal
                  className="rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-4 flex flex-col items-center justify-center text-zinc-500 hover:border-blue-400 dark:hover:border-sky-600 hover:text-blue-600 dark:hover:text-sky-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent"
                  aria-label={`Add new item to ${title}`}
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-sm font-medium">Add Item</span>
                </button>

                {/* Message when no items */}
                {!hasItems && items?.length === 0 && (
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


  const AddAccountModal = () => {
    return null;
  };
  // This is a placeholder for the account linking modal  

  // --- Main Render ---
  return (
    <div className="min-h-screen px-4 sm:px-6 pt-10 pb-20 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            Hello, {username.charAt(0).toUpperCase() + username.slice(1)}
          </h1>
          <button
            onClick={() => setShowAccountModal(true)} // This still opens the bank connection modal
            className="flex items-center gap-1 rounded-full border border-zinc-300 dark:border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Account {/* This button is for linking external accounts, not manual entries */}
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Net Worth & Assets/Liabilities */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow border border-zinc-200 dark:border-zinc-800">
            {/* Net Worth Section */}
            <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mb-1">Net Worth</h2>
            <p className="text-3xl sm:text-4xl font-bold mb-1 text-zinc-900 dark:text-white">${netWorth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            {/* TODO: Calculate and display actual change */}
            <div className="text-sm text-green-600 dark:text-green-500 mb-4">Dynamic change TBD</div>
            <div className="h-56 sm:h-64 w-full mb-4">
               {/* Net worth chart display */}
              <ResponsiveContainer width="100%" height="100%">
                  {/* Add actual net worth data binding here later */}
                 <LineChart data={netWorthData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} dx={-5} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#16a34a', stroke: 'var(--background)', strokeWidth: 2 }} />
                  </LineChart>
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

            {/* Collapsible Sections - Pass categoryType */}
            <div className="mt-4 space-y-4">
              {Object.entries(userData[selectedTab] || {}).map(([categoryName, items]) => (
                <CollapsibleSection
                  key={`${selectedTab}-${categoryName}`} // Ensure unique key across tabs
                  title={categoryName}
                  color={colorMap[categoryName] || colorMap.Default}
                  items={items}
                  categoryType={selectedTab} // Pass 'assets' or 'liabilities'
                />
              ))}
              {/* Add Category Section Button - Functionality TBD */}
              <button className="w-full mt-4 py-3 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-150 flex items-center justify-center gap-2 text-sm font-medium opacity-50 cursor-not-allowed" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add Category Section (Soon)
              </button>
            </div>
          </div>

          {/* Right Column: Info Cards (Keep as is, data is placeholder) */}
          <div className="space-y-6">
             {/* Spending Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3"> <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">Spending</h2> <button className="text-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">›</button> </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Spent this month</p>
                <p className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">${(spending?.spentThisMonth || 0).toLocaleString()}</p>
                <div className="h-20 w-full mb-5"> <ResponsiveContainer width="100%" height="100%"> <BarChart data={spendingData} margin={{ top: 5, right: 0, left: 0, bottom: -10 }}> <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} dy={10} /> <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} /> <Bar dataKey="spent" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={15} /> </BarChart> </ResponsiveContainer> </div>
                <p className="text-sm font-semibold mb-2 text-zinc-800 dark:text-zinc-200">Latest transactions</p>
                <div className="space-y-2 text-sm">
                  {(spending?.latestTransactions || []).slice(0, 3).map((tx) => ( <div key={tx.id} className="flex justify-between items-center"> <span className="text-zinc-700 dark:text-zinc-300 truncate pr-2">{tx.name}</span> <span className={`font-medium ${tx.isPositive ? 'text-green-600 dark:text-green-500' : 'text-zinc-600 dark:text-zinc-400'}`}> {tx.isPositive ? '+' : ''}${Math.abs(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span> </div> ))}
                  {(spending?.latestTransactions?.length === 0) && ( <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">No transactions this month yet.</p> )}
                </div>
                {(spending?.latestTransactions?.length > 3) && ( <button className="w-full mt-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"> See all transactions </button> )}
              </div>
             {/* Investments Portfolio */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2"> <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">Investments</h2> <button className="text-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">›</button> </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total value</p>
                <div className="flex items-baseline justify-between mb-1"> <p className="text-2xl font-bold text-zinc-900 dark:text-white">${(investments?.totalValue || 0).toLocaleString()}</p> <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${(investments?.changePercent || 0) >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'}`}> {(investments?.changePercent || 0) >= 0 ? '+' : ''}{(investments?.changePercent || 0)}% </div> </div>
                <div className="h-16 w-full"> <ResponsiveContainer width="100%" height="100%"> <AreaChart data={investmentData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}> <defs><linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient></defs> <Tooltip content={<CustomTooltip />} cursor={false} /> <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={1.5} fill="url(#investmentGradient)" dot={false} /> </AreaChart> </ResponsiveContainer> </div>
              </div>
             {/* Most Frequent Expenses (Breakdown) */}
             <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mb-1">Breakdown</h2>
                <h3 className="text-base font-bold mb-4 text-zinc-800 dark:text-zinc-200">Most Frequent Expenses</h3>
                {(frequentExpenses || []).map((e) => ( <div key={e.id} className="mb-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"> <div className="flex items-center font-semibold text-sm mb-2 text-zinc-800 dark:text-zinc-200"> <span className="text-base mr-2">{e.icon}</span> <span>{e.title}</span> </div> <div className="text-xs text-zinc-600 dark:text-zinc-400 grid grid-cols-3 gap-2"> <div><p className="text-zinc-500 dark:text-zinc-500">This month</p><p className="font-medium text-zinc-700 dark:text-zinc-300">{e.times}x</p></div> <div><p className="text-zinc-500 dark:text-zinc-500">Avg. spent</p><p className="font-medium text-zinc-700 dark:text-zinc-300">${(e.avg || 0).toFixed(2)}</p></div> <div><p className="text-zinc-500 dark:text-zinc-500">Total</p><p className="font-medium text-zinc-700 dark:text-zinc-300">${(e.total || 0).toFixed(2)}</p></div> </div> </div> ))}
                {(frequentExpenses?.length === 0) && ( <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mb-4">No recurring expenses tracked yet.</p> )}
                <button className="w-full mt-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"> See full breakdown </button>
             </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      {/* Bank Connection Modal (Existing) */}
      {showAccountModal && <AddAccountModal />}

      {/* Entry Add/Edit Modal (New) */}
      <AnimatePresence>
        {isEntryModalOpen && (
          <EntryFormModal
            isOpen={isEntryModalOpen}
            onClose={closeEntryModal}
            onSubmit={handleEntryFormSubmit}
            onDelete={handleDeleteEntry} // Pass delete handler
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