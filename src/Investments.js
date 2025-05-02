// src/Investments.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Percent, Wallet, Landmark } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

// --- Constants & Helpers ---
const USER_DATA_KEY = 'userData';

// Default Investment Data Structure (if none in localStorage)
const defaultInvestmentData = {
  totalValue: 0,
  changePercent: 0,
  history: [],
  holdings: [],
  accounts: [],
};

// --- Synthetic Data Generation ---
const generatePriceHistory = (currentValue, days = 7, volatility = 0.03) => {
  const history = [];
  let value = currentValue * (1 - (Math.random() - 0.5) * volatility * days * 0.2); // Start somewhere plausible
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    if (i === 0) {
      value = currentValue; // Ensure last point is current value
    } else {
       const changePercent = (Math.random() - 0.49) * volatility * 2; // Slightly biased upward trend
       value *= (1 + changePercent);
       if (value < 0) value = 0; // Prevent negative values
    }

    history.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(2)),
    });
  }
  return history;
};

const generatePortfolioHistory = (currentValue, range) => {
    const now = new Date();
    const data = [];
    let daysToShow;
    let startDate = new Date();

    switch (range) {
        case '1W': daysToShow = 7; startDate.setDate(now.getDate() - 6); break;
        case '1M': daysToShow = 30; startDate.setMonth(now.getMonth() - 1); break;
        case '3M': daysToShow = 90; startDate.setMonth(now.getMonth() - 3); break;
        case 'YTD': startDate = new Date(now.getFullYear(), 0, 1); daysToShow = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)) + 1; break;
        case 'ALL':
        default: daysToShow = 365; startDate.setFullYear(now.getFullYear() - 1); break;
    }
     if (daysToShow <= 0) daysToShow = 1;

     const startingMultiplier = 0.8 + Math.random() * 0.15;
     let value = currentValue * startingMultiplier;
     const fluctuationFactor = (0.001 + Math.random() * 0.005) * (Math.abs(currentValue) || 1000);

     for (let i = 0; i < daysToShow; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
         if (date > now) continue;

        const isLastPoint = i === daysToShow -1 || date.toDateString() === now.toDateString();

        if (isLastPoint) {
             value = currentValue;
         } else {
             const changeDirection = Math.random() < 0.51 ? 1 : -1;
             const changeAmount = changeDirection * fluctuationFactor * (0.5 + Math.random());
             value += changeAmount;
             if (currentValue >= 0 && value < 0) value = 0;
             if (currentValue < 0 && value > 0) value = 0;
         }

        data.push({
             date: date.toISOString().split('T')[0],
             value: parseFloat(value.toFixed(2))
        });
    }

     // Ensure final point exists if needed
     const todayStr = now.toISOString().split('T')[0];
     if (!data.length || data[data.length - 1].date !== todayStr) {
        data.push({ date: todayStr, value: parseFloat(currentValue.toFixed(2)) });
     }

     // Ensure minimum data points for the chart
     if (data.length < 2) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        data.unshift({
            date: yesterday.toISOString().split('T')[0],
            value: parseFloat((currentValue * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)),
        });
     }

     return data.map(p => ({ ...p, name: p.date })); // Use date as name for XAxis dataKey
};


// --- Custom Tooltips ---
const PortfolioTooltip = ({ active, payload, label, currency = '$' }) => {
  if (active && payload && payload.length) {
    const date = new Date(label + 'T00:00:00'); // Interpret label as date string
    const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    return (
      <div className="px-3 py-1.5 bg-gray-800 dark:bg-zinc-950/80 text-white text-xs rounded-lg shadow-lg border border-white/10 backdrop-blur-sm">
        <p className="font-semibold mb-0.5">{formattedDate}</p>
        <p className="text-base font-medium">{`${currency}${payload[0].value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
      </div>
    );
  }
  return null;
};

// Format date for XAxis based on the selected time range
const formatDateForAxis = (dateString, range) => {
    const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone
    if (isNaN(date.getTime())) return '';

    switch (range) {
        case '1W': return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        case '1M': return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        case '3M': return date.toLocaleDateString(undefined, { month: 'short' });
        case 'YTD': return date.toLocaleDateString(undefined, { month: 'short' });
        case 'ALL':
        default: return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    }
};


// --- Main Investments Component ---
function Investments() {
  const navigate = useNavigate();
  const [investmentData, setInvestmentData] = useState(defaultInvestmentData);
  const [portfolioTimeRange, setPortfolioTimeRange] = useState('ALL');
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem(USER_DATA_KEY);
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        // Ensure investments object and holdings/accounts arrays exist
        const data = {
            ...defaultInvestmentData,
            ...(parsedData.investments || {}),
            holdings: Array.isArray(parsedData.investments?.holdings) ? parsedData.investments.holdings : [],
            accounts: Array.isArray(parsedData.investments?.accounts) ? parsedData.investments.accounts : [],
        };
         // Generate synthetic price history for holdings if missing
         data.holdings = data.holdings.map(h => ({
             ...h,
             value: (h.quantity || 0) * (h.currentPrice || 0), // Calculate value if missing
             priceHistory7d: h.priceHistory7d && h.priceHistory7d.length > 1 ? h.priceHistory7d : generatePriceHistory(h.currentPrice || 0, 7)
         }));
         // Sort holdings by value descending
         data.holdings.sort((a, b) => (b.value || 0) - (a.value || 0));

         // Generate overall portfolio history if missing
          if(!data.history || data.history.length < 2) {
              data.history = generatePortfolioHistory(data.totalValue || 0, 'ALL'); // Generate full history by default
          }

        setInvestmentData(data);
      } catch (e) {
        console.error("Failed to parse investment data:", e);
        setInvestmentData(defaultInvestmentData);
      }
    }
  }, []);

  // Filtered portfolio history based on time range
  const filteredPortfolioHistory = useMemo(() => {
    const history = investmentData.history || [];
    if (!history.length) return generatePortfolioHistory(investmentData.totalValue || 0, portfolioTimeRange); // Generate if completely missing

    const now = new Date();
    let startDate = new Date();

    switch (portfolioTimeRange) {
        case '1W': startDate.setDate(now.getDate() - 7); break;
        case '1M': startDate.setMonth(now.getMonth() - 1); break;
        case '3M': startDate.setMonth(now.getMonth() - 3); break;
        case 'YTD': startDate = new Date(now.getFullYear(), 0, 1); break;
        case 'ALL': return history; // Use all available historical data
        default: return history;
    }

    const startDateString = startDate.toISOString().split('T')[0];
    const filtered = history.filter(p => p.date >= startDateString);

     // Ensure at least two points for the chart to render
     if (filtered.length < 2 && history.length > 0) {
        // Add the point just before the start date if available
        const pointBeforeStart = history.slice().reverse().find(p => p.date < startDateString);
        if (pointBeforeStart) {
            filtered.unshift(pointBeforeStart);
        }
         // If still less than 2 points, add a synthetic start point
         if(filtered.length < 2){
             const firstPointValue = filtered[0]?.value || investmentData.totalValue || 0;
            filtered.unshift({
                date: startDate.toISOString().split('T')[0],
                 value: firstPointValue * 0.98 // Slightly different value
            })
         }
    }
     return filtered.length >= 2 ? filtered : generatePortfolioHistory(investmentData.totalValue || 0, portfolioTimeRange); // Fallback if filtering results in < 2 points

  }, [investmentData.history, investmentData.totalValue, portfolioTimeRange]);

  // Modal handlers
  const openModal = useCallback((holding) => {
    setSelectedHolding(holding);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedHolding(null);
  }, []);

  // Separate holdings into stocks/etfs and crypto
  const stockHoldings = useMemo(() => investmentData.holdings.filter(h => h.type === 'stock' || h.type === 'etf'), [investmentData.holdings]);
  const cryptoHoldings = useMemo(() => investmentData.holdings.filter(h => h.type === 'crypto'), [investmentData.holdings]);

  const hasInvestments = investmentData.holdings && investmentData.holdings.length > 0;
  const hasCrypto = cryptoHoldings && cryptoHoldings.length > 0;

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-10 pb-20 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-150">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/finance')} // Navigate back to main finance dashboard
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors mr-3"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
             <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                Investment Portfolio
             </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Track your investments and assets all in one place.</p>
          </div>
        </div>

        {/* Main Content Area */}
        {!hasInvestments ? (
            // Empty State
             <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl shadow border border-zinc-200 dark:border-zinc-800">
                 <Wallet size={48} className="mx-auto text-zinc-400 dark:text-zinc-600 mb-4" />
                 <h2 className="text-xl font-semibold mb-2 text-zinc-800 dark:text-zinc-200">No Investments Linked Yet</h2>
                 <p className="text-zinc-600 dark:text-zinc-400 mb-6">Add your brokerage or crypto accounts to start tracking.</p>
                 {/* --- Updated Button Text --- */}
                 <button className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition opacity-50 cursor-not-allowed" disabled>
                   Link Account (Available in future update)
                 </button>
             </div>
        ) : (
            <div className="space-y-8">
                {/* Portfolio Overview Chart */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow border border-zinc-200 dark:border-zinc-800">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                        <div>
                            <h2 className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mb-1">Portfolio Value</h2>
                            <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">${(investmentData.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                         </div>
                         <div className="mt-2 sm:mt-0">
                            {/* Time Range Selector */}
                             <div className="flex items-center justify-center space-x-1 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 w-fit">
                                {["1M", "3M", "YTD", "ALL"].map((label) => (
                                 <button key={label} onClick={() => setPortfolioTimeRange(label)} className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-150 ${portfolioTimeRange === label ? "bg-white text-zinc-800 dark:bg-black dark:text-white shadow" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"}`}>
                                     {label}
                                 </button>
                                ))}
                             </div>
                         </div>
                     </div>
                     {/* Add overall change indicator */}
                    <div className={`text-sm font-medium mb-4 ${(investmentData.changePercent || 0) >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                        {(investmentData.changePercent || 0) >= 0 ? '+' : ''}{(investmentData.changePercent || 0).toFixed(2)}% Today
                    </div>

                     <div className="h-64 sm:h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredPortfolioHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                                <XAxis dataKey="name" fontSize={10} tick={{ fill: 'currentColor', opacity: 0.6 }} tickLine={false} axisLine={false} dy={10} tickFormatter={(tick) => formatDateForAxis(tick, portfolioTimeRange)} interval="preserveStartEnd" />
                                <YAxis fontSize={10} tick={{ fill: 'currentColor', opacity: 0.6 }} tickLine={false} axisLine={false} dx={-5} tickFormatter={(val) => `$${val.toLocaleString()}`} domain={['auto', 'auto']} />
                                <Tooltip content={<PortfolioTooltip />} cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Area type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} fill="url(#portfolioGradient)" dot={false} activeDot={{ r: 4, fill: '#34d399', stroke: 'var(--background)', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Holdings Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {/* Stocks & ETFs Holdings */}
                    <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl shadow border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6">
                        <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Holdings</h3>
                         <div className="space-y-3">
                            {stockHoldings.map(holding => (
                                <HoldingRow key={holding.id} holding={holding} onClick={() => openModal(holding)} />
                             ))}
                             {stockHoldings.length === 0 && !hasCrypto && (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic py-4 text-center">No stock or ETF holdings found.</p>
                             )}
                         </div>
                         {/* Crypto Holdings (if any) */}
                         {hasCrypto && (
                            <>
                                <h3 className="text-lg font-semibold mt-8 mb-4 text-zinc-800 dark:text-zinc-200 border-t border-zinc-200 dark:border-zinc-700 pt-6">Cryptocurrency</h3>
                                 <div className="space-y-3">
                                    {cryptoHoldings.map(holding => (
                                        <HoldingRow key={holding.id} holding={holding} onClick={() => openModal(holding)} />
                                     ))}
                                 </div>
                            </>
                         )}
                    </div>

                     {/* Accounts & Insights Column */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6">
                            <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Accounts</h3>
                             {investmentData.accounts.length > 0 ? (
                                <ul className="space-y-3">
                                    {investmentData.accounts.map(account => (
                                        <li key={account.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                            <div className="flex items-center gap-3">
                                                <Landmark size={18} className="text-zinc-500" />
                                                 <div>
                                                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{account.name}</p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{account.type}</p>
                                                 </div>
                                             </div>
                                            {/* Add sync status/action later */}
                                            <button className="text-xs font-medium text-blue-600 dark:text-sky-500 hover:underline opacity-50 cursor-not-allowed" disabled>Manage</button>
                                         </li>
                                    ))}
                                </ul>
                             ) : (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic text-center py-4">No accounts linked yet.</p>
                             )}
                             {/* --- Updated Button Text --- */}
                             <button className="w-full mt-4 py-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:border-blue-400 dark:hover:border-sky-600 hover:text-blue-600 dark:hover:text-sky-400 transition-colors opacity-50 cursor-not-allowed" disabled>
                                Add Account (Available in Beta 1.2)
                             </button>
                        </div>

                        {/* Placeholder for Insights/News */}
                         <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6">
                             <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Insights</h3>
                             <p className="text-sm text-zinc-500 dark:text-zinc-400 italic text-center py-4">Market insights coming soon.</p>
                         </div>
                    </div>
                 </div>
            </div>
        )}
      </div>

      {/* Holding Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedHolding && (
          <HoldingDetailModal holding={selectedHolding} onClose={closeModal} />
        )}
      </AnimatePresence>
    </div>
  );
}


// --- Sub Components ---

const HoldingRow = React.memo(({ holding, onClick }) => {
  const changeColor = (holding.changePercentToday || 0) >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';
  const TrendIcon = (holding.changePercentToday || 0) >= 0 ? TrendingUp : TrendingDown;
  const sparklineData = holding.priceHistory7d || [];
  // Determine the stroke color for the sparkline based on changeColor
  const sparklineStrokeColor = changeColor.includes('green') ? '#10B981' : '#EF4444'; // emerald-500 or red-500


  return (
     <button
       onClick={onClick}
       className="flex items-center w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500"
     >
        {/* Icon/Ticker */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center mr-3">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{holding.ticker?.[0] || '?'}</span>
        </div>
        {/* Name & Ticker */}
        <div className="flex-grow mr-4 overflow-hidden">
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{holding.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">{holding.ticker}</p>
        </div>
         {/* Sparkline */}
         <div className="w-20 h-8 mx-4 hidden sm:block">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={sparklineData}>
                 <defs>
                     <linearGradient id={`sparklineGradient-${holding.id}`} x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor={sparklineStrokeColor} stopOpacity={0.1}/>
                         <stop offset="95%" stopColor={sparklineStrokeColor} stopOpacity={0}/>
                     </linearGradient>
                 </defs>
                 <Line type="monotone" dataKey="value" stroke={sparklineStrokeColor} strokeWidth={1.5} dot={false} />
                 {/* Optional Area under sparkline - uncomment if desired */}
                 {/* <Area type="monotone" dataKey="value" stroke={false} fill={`url(#sparklineGradient-${holding.id})`} /> */}
             </LineChart>
           </ResponsiveContainer>
         </div>
        {/* Change % */}
        <div className={`w-16 text-sm font-medium text-right mr-4 hidden md:block ${changeColor}`}>
             {(holding.changePercentToday || 0).toFixed(2)}%
         </div>
        {/* Value */}
        <div className="w-24 text-sm font-semibold text-right text-zinc-900 dark:text-white">
            ${(holding.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
     </button>
  );
});

// --- Holding Detail Modal ---
const HoldingDetailModal = ({ holding, onClose }) => {
  const changeColor = (holding.changePercentToday || 0) >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';
  const chartData = holding.priceHistory7d || []; // Use 7d history for the modal chart
  // Determine the stroke color for the modal chart
  const modalChartStrokeColor = changeColor.includes('green') ? '#10B981' : '#EF4444'; // emerald-500 or red-500

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-xl border border-zinc-200 dark:border-zinc-700 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 dark:bg-zinc-800 bg-zinc-100 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
             {/* Header */}
            <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center mr-3">
                    <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">{holding.ticker?.[0] || '?'}</span>
                 </div>
                 <div>
                     <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{holding.name}</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 uppercase">{holding.ticker}</p>
                 </div>
             </div>

             {/* Current Value & Change */}
            <div className="mb-5">
                 <p className="text-3xl font-bold text-zinc-900 dark:text-white">${(holding.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                 <p className={`text-sm font-medium ${changeColor}`}>
                    {(holding.changePercentToday || 0) >= 0 ? '+' : ''}
                    ${((holding.currentPrice * (holding.changePercentToday / 100)) || 0).toFixed(2)}
                    ({(holding.changePercentToday || 0).toFixed(2)}%) Today
                 </p>
             </div>

             {/* Chart */}
             <div className="h-48 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                         <defs>
                             <linearGradient id={`modalGradient-${holding.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={modalChartStrokeColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={modalChartStrokeColor} stopOpacity={0}/>
                             </linearGradient>
                         </defs>
                         <Tooltip
                           content={<PortfolioTooltip currency='$' />}
                           cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeOpacity: 0.5, strokeDasharray: '3 3' }}
                         />
                         <Area
                           type="monotone"
                           dataKey="value"
                           stroke={modalChartStrokeColor}
                           strokeWidth={2}
                           fill={`url(#modalGradient-${holding.id})`}
                           dot={false}
                         />
                     </AreaChart>
                 </ResponsiveContainer>
             </div>

             {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                     <p className="text-zinc-500 dark:text-zinc-400">Quantity</p>
                     <p className="font-medium text-zinc-800 dark:text-zinc-100">{holding.quantity?.toLocaleString() || 'N/A'}</p>
                 </div>
                 <div>
                     <p className="text-zinc-500 dark:text-zinc-400">Current Price</p>
                     <p className="font-medium text-zinc-800 dark:text-zinc-100">${(holding.currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                 </div>
                 {/* Add more details like Avg Cost, Market Cap etc. later */}
            </div>

             {/* Actions (Placeholder) */}
             <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex gap-3">
                 <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition opacity-50 cursor-not-allowed" disabled>Trade (Soon)</button>
                 <button className="flex-1 py-2 px-4 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-lg text-sm font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition opacity-50 cursor-not-allowed" disabled>View Details (Soon)</button>
             </div>
        </div>
      </motion.div>
    </div>
  );
};


export default Investments;