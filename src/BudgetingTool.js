// src/BudgetingTool.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Sector } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionIncomeModal from './TransactionIncomeModal'; // Import the modal

// --- Constants ---
const BUDGET_DATA_KEY = 'budgetData';
const TABS = ["Overview", "Breakdown & Budget", "Recurring", "Transactions", "Reports"];
// Define category colors (use more distinct colors if needed)
const CATEGORY_COLORS = [
    '#6366F1', // indigo-500
    '#EC4899', // pink-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#3B82F6', // blue-500
    '#8B5CF6', // violet-500
    '#D946EF', // fuchsia-500
    '#06B6D4', // cyan-500
    '#EF4444', // red-500
    '#84CC16', // lime-500
];

const defaultBudgetData = {
  income: [], // { id, title, amount, date }
  transactions: [], // { id, title, amount, date, category, isRecurring? } - amount is negative for expense
  recurring: [], // { id, title, amount, frequency, nextDate, category } - derived/managed separately later
  budgetGoal: 500, // Default monthly budget goal
};

// --- Helper Functions ---
const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0.00';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Simple function to get month name abbreviation (adjust for locale if needed)
const getMonthAbbreviation = (dateString) => {
    const date = new Date(dateString + 'T00:00:00'); // Ensure parsing as local date
    return date.toLocaleString('default', { month: 'short' });
};

// --- Main Component ---
function BudgetingTool() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [budgetData, setBudgetData] = useState(() => {
    const stored = localStorage.getItem(BUDGET_DATA_KEY);
    try {
      return stored ? { ...defaultBudgetData, ...JSON.parse(stored) } : defaultBudgetData;
    } catch (e) {
      console.error("Failed to parse budget data:", e);
      return defaultBudgetData;
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('transaction'); // 'transaction' or 'income'
  const [comparePast, setComparePast] = useState(true); // For the chart comparison toggle

  // --- Persist Data ---
  useEffect(() => {
    localStorage.setItem(BUDGET_DATA_KEY, JSON.stringify(budgetData));
  }, [budgetData]);

  // --- Data Processing Memos ---

  // Get current month start/end dates (e.g., Apr 1 - Apr 30, 2025)
  const { currentMonthStart, currentMonthEnd, currentMonthName } = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-indexed
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0); // Last day of current month
        const name = start.toLocaleString('default', { month: 'long' });
        return {
            currentMonthStart: start.toISOString().split('T')[0],
            currentMonthEnd: end.toISOString().split('T')[0],
            currentMonthName: name
        };
    }, []);

    

  // Filter transactions/income for the current month
  const currentMonthTransactions = useMemo(() => {
    return budgetData.transactions.filter(t => t.date >= currentMonthStart && t.date <= currentMonthEnd);
  }, [budgetData.transactions, currentMonthStart, currentMonthEnd]);

  const currentMonthIncome = useMemo(() => {
    return budgetData.income.filter(i => i.date >= currentMonthStart && i.date <= currentMonthEnd);
  }, [budgetData.income, currentMonthStart, currentMonthEnd]);

  // Calculate totals for the current month
  const totalExpensesMonth = useMemo(() => {
    return currentMonthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [currentMonthTransactions]);

  const totalIncomeMonth = useMemo(() => {
    return currentMonthIncome.reduce((sum, i) => sum + i.amount, 0);
  }, [currentMonthIncome]);


  // Prepare data for Expenses vs Budget Line Chart (last 6 months + current)
    const spendVsBudgetData = useMemo(() => {
        const data = [];
        const monthMap = new Map(); // Store aggregated expenses per month

        // Initialize map for the last 6 months (relative to current)
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            const monthName = date.toLocaleString('default', { month: 'short' });
            monthMap.set(monthKey, { name: monthName, Expenses: 0, Budget: budgetData.budgetGoal });
        }

        // Aggregate expenses from all transactions
        budgetData.transactions.forEach(t => {
            if (t.amount < 0) { // Only expenses
                const date = new Date(t.date + 'T00:00:00');
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (monthMap.has(monthKey)) {
                    monthMap.get(monthKey).Expenses += Math.abs(t.amount);
                }
                 // Optional: Add logic here if you need to include months outside the last 6
                 // else if (date > lastDateInMap) { // Or similar logic
                 //    const monthName = date.toLocaleString('default', { month: 'short' });
                 //    monthMap.set(monthKey, { name: monthName, Expenses: Math.abs(t.amount), Budget: budgetData.budgetGoal });
                 // }
            }
        });

        // Convert map to array, sorted chronologically
        const sortedKeys = Array.from(monthMap.keys()).sort();
        sortedKeys.forEach(key => data.push(monthMap.get(key)));

        // Ensure at least one entry exists for the chart
        if(data.length === 0) {
            const now = new Date();
             const monthName = now.toLocaleString('default', { month: 'short' });
             data.push({ name: monthName, Expenses: 0, Budget: budgetData.budgetGoal });
        }

        return data;
    }, [budgetData.transactions, budgetData.budgetGoal]);


  // Prepare data for Category Breakdown Pie Chart (current month expenses)
  const categoryBreakdownData = useMemo(() => {
    const categoryMap = new Map();
    currentMonthTransactions.forEach(t => {
      if (t.amount < 0) { // Only expenses
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + Math.abs(t.amount));
      }
    });
    return Array.from(categoryMap.entries())
        .map(([name, value], index) => ({
            name,
            value,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
        }))
        .sort((a, b) => b.value - a.value); // Sort descending by value
  }, [currentMonthTransactions]);


  // --- Modal Handlers ---
  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = useCallback((newData, type) => {
    setBudgetData(prevData => {
      if (type === 'income') {
        return { ...prevData, income: [...prevData.income, newData].sort((a, b) => new Date(b.date) - new Date(a.date)) };
      } else { // transaction (expense)
        // TODO: Handle recurring logic - maybe move to recurring array?
        return { ...prevData, transactions: [...prevData.transactions, newData].sort((a, b) => new Date(b.date) - new Date(a.date)) };
      }
    });
  }, []);


  // --- Placeholder Tab Content ---
  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return <OverviewTabContent />;
      case "Breakdown & Budget":
         return <div className="text-center p-10 bg-gray-900 rounded-2xl shadow-xl"><p>Breakdown & Budget view coming soon!</p></div>;
      case "Recurring":
         return <div className="text-center p-10 bg-gray-900 rounded-2xl shadow-xl"><p>Recurring transactions view coming soon!</p></div>;
      case "Transactions":
         return <div className="text-center p-10 bg-gray-900 rounded-2xl shadow-xl"><p>Full transactions list coming soon!</p></div>;
      case "Reports":
         return <div className="text-center p-10 bg-gray-900 rounded-2xl shadow-xl"><p>Reports view coming soon!</p></div>;
      default:
        return null;
    }
  };

  // --- Overview Tab Sub-Component ---
  const OverviewTabContent = () => (
    <div className="space-y-8">
      {/* Top Row: Chart + Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses Chart */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-lg font-semibold text-white">Spend vs Budget</h2>
            <div className="flex items-center space-x-3 text-xs sm:text-sm flex-wrap gap-y-1">
              <div className="font-semibold text-blue-400 whitespace-nowrap">Expenses {formatCurrency(totalExpensesMonth)}</div>
              <label className="flex items-center space-x-1.5 cursor-pointer select-none text-gray-400">
                <input
                  type="checkbox"
                  checked={comparePast}
                  onChange={() => setComparePast(!comparePast)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1"
                />
                <span>Show Budget</span>
              </label>
              <div className="font-semibold text-gray-400 whitespace-nowrap">{formatCurrency(budgetData.budgetGoal)} Budget</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
             {spendVsBudgetData.length > 0 ? (
                <LineChart data={spendVsBudgetData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} tickLine={false} axisLine={false} dx={-5} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4B5563', borderRadius: '8px' }} // bg-gray-800/80 border-gray-600
                        labelStyle={{ color: '#D1D5DB', fontWeight: '600' }} // text-gray-300
                        itemStyle={{ color: '#E5E7EB' }} // text-gray-200
                        formatter={(value, name) => [formatCurrency(value), name]}
                    />
                    <Legend verticalAlign="top" height={30} iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="Expenses" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5, strokeWidth: 1, fill: '#fff', stroke: '#6366F1' }} name="Monthly Expenses" />
                    {comparePast && (
                    <Line type="monotone" dataKey="Budget" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Monthly Budget" />
                    )}
                </LineChart>
             ) : (
                <div className="flex items-center justify-center h-full text-gray-500 italic">No expense data yet</div>
             )}
          </ResponsiveContainer>
        </div>

        {/* Small Summary Cards */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-2xl shadow-xl p-5 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase mb-1">Earned This Month</h3>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalIncomeMonth)}</p>
            {/* <p className="text-xs text-gray-500 mt-1">Based on {currentMonthIncome.length} income entries</p> */}
          </div>
          <div className="bg-gray-900 rounded-2xl shadow-xl p-5 border border-gray-700">
             <h3 className="text-sm font-medium text-gray-400 uppercase mb-1">Question of the Day</h3>
            <p className="text-sm text-gray-300 mt-2 mb-3">What was my cash flow in 2024?</p> {/* Keep static for now */}
            <button className="px-4 py-1.5 bg-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-700 transition">
              Ask Sidekick
            </button>
          </div>
        </div>
      </div>

      {/* Mid Row: Transactions + Recurring + Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Latest Transactions */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700 flex flex-col">
          <h3 className="text-base font-semibold mb-3 border-b border-gray-700 pb-2 text-white">Latest Transactions</h3>
          <ul className="space-y-3 flex-grow overflow-y-auto max-h-60 pr-1">
            {budgetData.transactions.length > 0 ? (
              budgetData.transactions.slice(0, 5).map(tx => ( // Show latest 5
                <li key={tx.id} className="flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium text-gray-200">{tx.title}</div>
                    <div className="text-xs text-gray-500">{tx.category} &middot; {formatDateRelative(tx.date)}</div>
                  </div>
                  <div className={`font-semibold ${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                  </div>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic text-center mt-4">No transactions added yet.</p>
            )}
          </ul>
          {budgetData.transactions.length > 5 && (
             <button className="text-center text-xs font-medium text-blue-400 hover:text-blue-300 mt-3 pt-2 border-t border-gray-700">
                View All Transactions
             </button>
          )}
        </div>

        {/* Recurring Transactions */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700 flex flex-col">
          <h3 className="text-base font-semibold mb-3 border-b border-gray-700 pb-2 text-white">Recurring</h3>
          <ul className="space-y-3 flex-grow overflow-y-auto max-h-60 pr-1">
            {/* Replace with dynamic data from budgetData.recurring when implemented */}
            {[
                { id: 1, name: 'Interest Deposit', amount: 15.00, frequency: 'Monthly' },
                { id: 3, name: 'Spotify', amount: -9.99, frequency: 'Monthly' },
                { id: 4, name: 'Gym Membership', amount: -45.00, frequency: 'Monthly' },
            ].map(tx => (
              <li key={tx.id} className="flex justify-between items-center text-sm">
                <div>
                    <div className="font-medium text-gray-200">{tx.name}</div>
                     {/* Add next date calculation later */}
                     <div className="text-xs text-gray-500">{tx.frequency} &middot; Next: TBD</div>
                </div>
                <div className={`font-semibold ${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                </div>
              </li>
            ))}
             {budgetData.recurring.length === 0 && ( // Placeholder logic
                <p className="text-sm text-gray-500 italic text-center mt-4">No recurring items set up.</p>
             )}
          </ul>
           {budgetData.recurring.length > 4 && ( // Placeholder logic
             <button className="text-center text-xs font-medium text-blue-400 hover:text-blue-300 mt-3 pt-2 border-t border-gray-700">
                View All Recurring
             </button>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700 flex flex-col">
          <h3 className="text-base font-semibold mb-3 border-b border-gray-700 pb-2 text-white">Category Breakdown ({currentMonthName})</h3>
           {categoryBreakdownData.length > 0 ? (
            <div className="flex flex-col items-center">
                 <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                    <Pie
                        data={categoryBreakdownData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        innerRadius={35}
                        paddingAngle={2}
                        label={false}
                    >
                        {categoryBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="focus:outline-none" />
                        ))}
                    </Pie>
                    <Tooltip formatter={(val) => formatCurrency(val)} />
                    </PieChart>
                 </ResponsiveContainer>
                 <ul className="mt-4 w-full space-y-1 text-xs overflow-y-auto max-h-24 pr-1">
                    {categoryBreakdownData.map(cat => (
                    <li key={cat.name} className="flex items-center justify-between text-gray-300">
                        <div className="flex items-center space-x-2 truncate">
                         <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                         <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="font-medium flex-shrink-0 ml-2">{formatCurrency(cat.value)}</span>
                    </li>
                    ))}
                </ul>
            </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-sm text-gray-500 italic text-center">No expenses this month to break down.</p>
                </div>
            )}
        </div>
      </div>

      {/* Bottom Row: "For You" Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl shadow-xl p-5 border border-yellow-400/30 flex items-center space-x-4">
          <div className="text-yellow-400 p-2 bg-yellow-400/10 rounded-full">
            {/* Placeholder Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /> </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Savings Recommendation Placeholder</p>
            <p className="text-xs text-gray-400">Save X% based on your income/goals.</p>
          </div>
        </div>
        <div className="bg-gray-900 rounded-2xl shadow-xl p-5 border border-yellow-400/30 flex items-center space-x-4">
           <div className="text-yellow-400 p-2 bg-yellow-400/10 rounded-full">
             {/* Placeholder Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m-7 10a9 9 0 1118 0 9 9 0 01-18 0z" /> </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Debt Payoff Placeholder</p>
            <p className="text-xs text-gray-400">Consider Snowball vs. Avalanche method.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper to format date relative to today
    const formatDateRelative = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.getTime() === today.getTime()) return 'Today';
        if (date.getTime() === yesterday.getTime()) return 'Yesterday';
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };


  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 sm:px-6 pt-10 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Budget Center</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => handleOpenModal('transaction')}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-colors shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /> </svg>
              Add Expense
            </button>
            <button
              onClick={() => handleOpenModal('income')}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /> </svg>
              Add Income
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap pb-3 px-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500'
                }`}
                aria-current={activeTab === tab ? 'page' : undefined}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

       {/* Modal Rendering */}
       <TransactionIncomeModal
         isOpen={isModalOpen}
         onClose={handleCloseModal}
         onSubmit={handleFormSubmit}
         modalType={modalType}
         // Pass initialData here for editing later
       />
    </div>
  );
}

export default BudgetingTool;
