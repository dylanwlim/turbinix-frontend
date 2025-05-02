// src/BudgetingTool.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Sector
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, AlertTriangle, Info, Target, DollarSign, Repeat, List, BarChart2, Percent, Lightbulb } from 'lucide-react'; // Added Lightbulb
import TransactionIncomeModal from './TransactionIncomeModal'; // Assume this exists and works

// --- Constants ---
const BUDGET_DATA_KEY = 'budgetData';
const USER_DATA_KEY = 'userData'; // For liabilities
const TABS = ["Overview", "Breakdown & Budget", "Recurring", "Transactions", "Reports"];

// Define category colors (use more distinct colors if needed)
const CATEGORY_COLORS = [
    '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
    '#8B5CF6', '#D946EF', '#06B6D4', '#EF4444', '#84CC16',
    '#71717A', '#F97316', '#14B8A6', '#F43F5E', '#22C55E',
];

const defaultBudgetData = {
    income: [], // { id, title, amount, date }
    transactions: [], // { id, title, amount, date, category } - amount is negative for expense
    recurring: {
        income: [], // { id, title, amount, frequency ('Monthly', 'Weekly', etc.), nextDueDate?, category }
        expenses: [] // { id, title, amount, frequency, nextDueDate?, category }
    },
    budgetGoal: 1000, // Default monthly budget goal
    categoryBudgets: {}, // { 'Groceries': 200, 'Dining Out': 150 } - Future feature
    // Store aggregated history for reports
    monthlySummaryHistory: [] // { month: 'YYYY-MM', income, expenses, savings } - Calculated on load/update
};

const defaultUserData = { // Only needed for liabilities part
    liabilities: { Loans: [] }
};

// --- Helper Functions ---
const formatCurrency = (value, digits = 2) => {
    if (typeof value !== 'number') return '$0.00';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // Add T00:00:00 to ensure parsing in local timezone, avoiding potential off-by-one day errors
        return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) { return 'Invalid Date'; }
};

const formatDateShort = (dateString) => {
     if (!dateString) return 'N/A';
    try {
         // Add T00:00:00 to ensure parsing in local timezone
        return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) { return 'Invalid Date'; }
}

const getMonthYearKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM format

// --- Main Component ---
function BudgetingTool() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [budgetData, setBudgetData] = useState(defaultBudgetData);
  const [userLiabilities, setUserLiabilities] = useState([]); // For debt recommendations
  const [hoveredTab, setHoveredTab] = useState(null); // For tab glow effect

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('transaction'); // 'transaction', 'income', 'recurringExpense', 'recurringIncome'
  const [editingItem, setEditingItem] = useState(null); // Holds item for editing

  // Budget Goal Editing State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudgetGoal, setTempBudgetGoal] = useState(budgetData.budgetGoal);

   // Load data on mount
  useEffect(() => {
    const storedBudgetData = localStorage.getItem(BUDGET_DATA_KEY);
    const storedUserData = localStorage.getItem(USER_DATA_KEY); // Load main user data for liabilities

    let loadedBudgetData = defaultBudgetData;
    if (storedBudgetData) {
      try {
        const parsed = JSON.parse(storedBudgetData);
        // Deep merge with default structure to ensure all keys exist
        loadedBudgetData = {
            ...defaultBudgetData,
            ...parsed,
            recurring: { // Ensure recurring structure exists
                income: Array.isArray(parsed.recurring?.income) ? parsed.recurring.income : [],
                expenses: Array.isArray(parsed.recurring?.expenses) ? parsed.recurring.expenses : [],
            },
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
            income: Array.isArray(parsed.income) ? parsed.income : [],
             // Add more sanity checks if needed
        };
        loadedBudgetData.budgetGoal = parsed.budgetGoal ?? defaultBudgetData.budgetGoal;

      } catch (e) {
        console.error("Failed to parse budget data:", e);
        loadedBudgetData = defaultBudgetData;
      }
    }
     // Calculate/update monthly history on load
     loadedBudgetData.monthlySummaryHistory = calculateMonthlyHistory(loadedBudgetData.transactions, loadedBudgetData.income);
     setBudgetData(loadedBudgetData);
     setTempBudgetGoal(loadedBudgetData.budgetGoal); // Initialize temp budget

    // Load liabilities
    if (storedUserData) {
        try {
            const parsedUser = JSON.parse(storedUserData);
            setUserLiabilities(parsedUser?.liabilities?.Loans || []);
        } catch (e) {
            console.error("Failed to parse user liabilities:", e);
        }
    }

  }, []);

  // Persist Budget Data whenever it changes
  useEffect(() => {
     // Ensure data being saved is valid JSON and has the expected structure
    const dataToSave = {
        ...budgetData,
        budgetGoal: Number(budgetData.budgetGoal) || defaultBudgetData.budgetGoal, // Ensure number
        // Add other validation/sanitization if needed
    };
    localStorage.setItem(BUDGET_DATA_KEY, JSON.stringify(dataToSave));
  }, [budgetData]);

  // --- Data Processing Memos ---

  const { currentMonthStart, currentMonthEnd, currentMonthName } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const name = start.toLocaleString('default', { month: 'long' });
    return {
      currentMonthStart: start.toISOString().split('T')[0],
      currentMonthEnd: end.toISOString().split('T')[0],
      currentMonthName: name
    };
  }, []);

  // --- Current Month Calculations ---
  const currentMonthTransactions = useMemo(() => {
    return budgetData.transactions.filter(t => t.date >= currentMonthStart && t.date <= currentMonthEnd);
  }, [budgetData.transactions, currentMonthStart, currentMonthEnd]);

  const currentMonthIncomeItems = useMemo(() => {
     return budgetData.income.filter(i => i.date >= currentMonthStart && i.date <= currentMonthEnd);
  }, [budgetData.income, currentMonthStart, currentMonthEnd]);

  const totalExpensesMonth = useMemo(() => {
    return currentMonthTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  }, [currentMonthTransactions]);

  const totalIncomeMonth = useMemo(() => {
    return currentMonthIncomeItems.reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [currentMonthIncomeItems]);

   const totalSavingsMonth = useMemo(() => totalIncomeMonth - totalExpensesMonth, [totalIncomeMonth, totalExpensesMonth]);
   const remainingBudget = useMemo(() => (budgetData.budgetGoal || 0) - totalExpensesMonth, [budgetData.budgetGoal, totalExpensesMonth]);


  // --- Chart Data ---
  const spendVsBudgetData = useMemo(() => {
      // Use pre-calculated monthly history if available and sufficient
      if (budgetData.monthlySummaryHistory && budgetData.monthlySummaryHistory.length > 1) {
           return budgetData.monthlySummaryHistory.slice(-6).map(summary => ({ // Show last 6 months
               name: new Date(summary.month + '-02').toLocaleString('default', { month: 'short' }), // Get month abbr
               Expenses: summary.expenses,
               Budget: budgetData.budgetGoal,
               Income: summary.income, // Add income for potential future charts
           }));
       }
      // Fallback: calculate if history is missing (simplified, only current month)
       return [{ name: currentMonthName.substring(0,3), Expenses: totalExpensesMonth, Budget: budgetData.budgetGoal, Income: totalIncomeMonth }];
  }, [budgetData.monthlySummaryHistory, budgetData.budgetGoal, totalExpensesMonth, totalIncomeMonth, currentMonthName]);

  const categoryBreakdownData = useMemo(() => {
    const categoryMap = new Map();
    currentMonthTransactions.forEach(t => {
       if (t.amount < 0) { // Only expenses
          const category = t.category || 'Uncategorized';
         const current = categoryMap.get(category) || 0;
         categoryMap.set(category, current + Math.abs(t.amount));
       }
    });
    return Array.from(categoryMap.entries())
        .map(([name, value], index) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
        }))
        .sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions]);

  // --- Recommendations ---
   const savingsRecommendation = useMemo(() => {
     if (totalIncomeMonth <= 0) return null;
     const targetSavings = totalIncomeMonth * 0.20; // Recommend saving 20%
     return {
       targetAmount: targetSavings,
       message: `Based on this month's income of ${formatCurrency(totalIncomeMonth)}, aiming for a 20% savings rate means trying to save around ${formatCurrency(targetSavings)}.`
     };
   }, [totalIncomeMonth]);

   const hasDebt = useMemo(() => userLiabilities.length > 0, [userLiabilities]);


  // --- Modal Handlers ---
  const handleOpenModal = useCallback((type, item = null) => {
    setModalType(type);
    setEditingItem(item); // Set item to edit or null for adding
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null); // Clear editing item on close
  }, []);

  // --- CRUD Operations ---
  // Function to calculate monthly history from raw data
   const calculateMonthlyHistory = (transactions, income) => {
        const historyMap = new Map();
        const allItems = [
            ...transactions.map(t => ({ ...t, type: 'expense' })),
            ...income.map(i => ({ ...i, type: 'income' }))
        ];

        allItems.forEach(item => {
            if (!item.date || !item.amount) return;
             try {
                const date = new Date(item.date + 'T00:00:00');
                const monthKey = getMonthYearKey(date); // YYYY-MM
                const entry = historyMap.get(monthKey) || { month: monthKey, income: 0, expenses: 0, savings: 0 };

                if (item.type === 'income') {
                    entry.income += item.amount;
                } else if (item.type === 'expense') {
                    entry.expenses += Math.abs(item.amount);
                }
                 entry.savings = entry.income - entry.expenses;
                historyMap.set(monthKey, entry);
             } catch (e) {
                 console.warn("Could not parse date for history calculation:", item.date);
             }
        });

        // Convert map to array and sort chronologically
        return Array.from(historyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
   };

  const updateBudgetData = (newData) => {
      const updatedData = {
          ...newData,
          // Recalculate monthly history whenever income/transactions change
          monthlySummaryHistory: calculateMonthlyHistory(newData.transactions, newData.income)
      };
       setBudgetData(updatedData);
   };


  const handleAddOrUpdateItem = useCallback((itemData) => {
     setBudgetData(prevData => {
         const listName = modalType === 'income' ? 'income' : 'transactions';
         const list = prevData[listName] || [];

         if (editingItem) { // Update existing item
             const updatedList = list.map(item => item.id === editingItem.id ? { ...item, ...itemData } : item);
              return { ...prevData, [listName]: updatedList.sort((a, b) => new Date(b.date) - new Date(a.date)) };
         } else { // Add new item
             const newItem = { ...itemData, id: Date.now() + Math.random() }; // Simple unique ID
             return { ...prevData, [listName]: [...list, newItem].sort((a, b) => new Date(b.date) - new Date(a.date)) };
         }
     });
      // Recalculate and update monthly history after state update
      setBudgetData(currentData => ({
          ...currentData,
          monthlySummaryHistory: calculateMonthlyHistory(currentData.transactions, currentData.income)
      }));
  }, [modalType, editingItem]);

  const handleDeleteItem = useCallback((itemId) => {
      if (!itemId) return;
      setBudgetData(prevData => {
          const updatedTransactions = prevData.transactions.filter(t => t.id !== itemId);
          const updatedIncome = prevData.income.filter(i => i.id !== itemId);
          // Also need to handle deleting recurring items later
          // const updatedRecurringIncome = prevData.recurring.income.filter(i => i.id !== itemId);
          // const updatedRecurringExpenses = prevData.recurring.expenses.filter(e => e.id !== itemId);

          return {
              ...prevData,
              transactions: updatedTransactions,
              income: updatedIncome,
              // recurring: { income: updatedRecurringIncome, expenses: updatedRecurringExpenses }
          };
      });
       // Recalculate and update monthly history after state update
       setBudgetData(currentData => ({
          ...currentData,
          monthlySummaryHistory: calculateMonthlyHistory(currentData.transactions, currentData.income)
       }));
  }, []);

   // Handle Budget Goal Update
   const handleBudgetGoalSave = useCallback(() => {
     const newGoal = parseFloat(tempBudgetGoal);
     if (!isNaN(newGoal) && newGoal >= 0) {
       setBudgetData(prev => ({ ...prev, budgetGoal: newGoal }));
       setIsEditingBudget(false);
     } else {
       alert('Please enter a valid budget amount.');
       setTempBudgetGoal(budgetData.budgetGoal); // Reset temp value
     }
   }, [tempBudgetGoal, budgetData.budgetGoal]);


  // --- Tab Rendering ---
   const renderTabContent = () => {
     switch (activeTab) {
       case "Overview": return <OverviewTab budgetData={budgetData} savingsRecommendation={savingsRecommendation} hasDebt={hasDebt} />;
       case "Breakdown & Budget": return <BreakdownTab budgetData={budgetData} categoryBreakdownData={categoryBreakdownData} isEditingBudget={isEditingBudget} setIsEditingBudget={setIsEditingBudget} tempBudgetGoal={tempBudgetGoal} setTempBudgetGoal={setTempBudgetGoal} handleBudgetGoalSave={handleBudgetGoalSave}/>;
       case "Recurring": return <RecurringTab recurringData={budgetData.recurring} onAddEdit={() => alert("Add/Edit Recurring Item - Modal Needed")} onDelete={() => alert("Delete Recurring Item - Not Implemented")} />;
       case "Transactions": return <TransactionsTab transactions={budgetData.transactions} income={budgetData.income} onEdit={handleOpenModal} onDelete={handleDeleteItem} />;
       case "Reports": return <ReportsTab monthlyHistory={budgetData.monthlySummaryHistory} />;
       default: return (
             <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 text-center">
                <Lightbulb className="mx-auto text-yellow-400 mb-3 w-8 h-8" />
                 <p className="text-sm text-zinc-600 dark:text-zinc-400 opacity-80 italic">
                     💡 Budget insights coming soon
                 </p>
            </div>
        );
     }
   };


  // --- Main Component Render ---
  return (
    // Added relative positioning and glow/blur effect container
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 sm:px-6 pt-10 pb-20 font-sans transition-colors duration-300">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -inset-80 top-[-20%] left-[50%] -translate-x-1/2 -translate-y-1/2 opacity-15 dark:opacity-25 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-blue-400/70 dark:from-sky-600/50 via-transparent to-transparent blur-3xl animate-pulse-glow"></div>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto relative z-10">
             {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                 <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">Budget Center</h1>
                 <div className="flex space-x-3">
                      {/* Expense Button - Modernized */}
                      <button
                        onClick={() => handleOpenModal('transaction')}
                         className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full text-sm font-semibold transition-all duration-150 shadow-md hover:shadow-lg hover:shadow-red-700/30 dark:shadow-red-500/30 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-zinc-950 border border-white/10 dark:border-black/20"
                       >
                        <Plus size={16} /> Expense
                      </button>
                      {/* Income Button - Modernized */}
                      <button
                        onClick={() => handleOpenModal('income')}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full text-sm font-semibold transition-all duration-150 shadow-md hover:shadow-lg hover:shadow-green-700/30 dark:shadow-green-500/30 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-950 border border-white/10 dark:border-black/20"
                      >
                        <Plus size={16} /> Income
                      </button>
                 </div>
            </div>

            {/* Tabs - Retained glow effect, ensured focus styles */}
            <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 relative">
                <nav className="-mb-px flex space-x-6 overflow-x-auto pb-px" aria-label="Tabs">
                     {TABS.map((tab) => (
                         <button
                             key={tab}
                             onClick={() => setActiveTab(tab)}
                             onMouseEnter={() => setHoveredTab(tab)}
                             onMouseLeave={() => setHoveredTab(null)}
                              className={`relative whitespace-nowrap pb-3 px-1 border-b-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 focus:ring-blue-500 dark:focus:ring-sky-500 rounded-t-md ${
                                activeTab === tab
                                     ? 'border-blue-600 dark:border-sky-500 text-blue-600 dark:text-sky-400'
                                     : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600'
                             }`}
                             aria-current={activeTab === tab ? 'page' : undefined}
                         >
                             {tab}
                             {activeTab === tab && (
                                  <motion.div
                                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-sky-500 rounded-full shadow-[0_0_8px_0px] shadow-sky-500/50 dark:shadow-sky-400/40"
                                      layoutId="activeBudgetTabIndicator"
                                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                  />
                              )}
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
       <AnimatePresence>
            {isModalOpen && (
                <TransactionIncomeModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleAddOrUpdateItem}
                    modalType={modalType} // 'transaction' or 'income'
                    initialData={editingItem} // Pass item data for editing
                />
                // Add RecurringItemModal rendering here later
            )}
       </AnimatePresence>
    </div>
  );
}

// ========== TAB COMPONENTS ==========

// --- Overview Tab ---
// (Styling polished within the component definitions below)
const OverviewTab = React.memo(({ budgetData, savingsRecommendation, hasDebt }) => {
  const { budgetGoal } = budgetData;
    const { currentMonthStart, currentMonthEnd } = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        return {
            currentMonthStart: start.toISOString().split('T')[0],
            currentMonthEnd: end.toISOString().split('T')[0]
        };
    }, []);

    const currentMonthTransactions = useMemo(() => {
        return budgetData.transactions.filter(t => t.date >= currentMonthStart && t.date <= currentMonthEnd);
    }, [budgetData.transactions, currentMonthStart, currentMonthEnd]);

    const currentMonthIncomeItems = useMemo(() => {
        return budgetData.income.filter(i => i.date >= currentMonthStart && i.date <= currentMonthEnd);
    }, [budgetData.income, currentMonthStart, currentMonthEnd]);

    const totalExpensesMonth = useMemo(() => {
        return currentMonthTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    }, [currentMonthTransactions]);

    const totalIncomeMonth = useMemo(() => {
        return currentMonthIncomeItems.reduce((sum, i) => sum + (i.amount || 0), 0);
    }, [currentMonthIncomeItems]);

   const totalSavingsMonth = useMemo(() => totalIncomeMonth - totalExpensesMonth, [totalIncomeMonth, totalExpensesMonth]);
   const remainingBudget = useMemo(() => (budgetGoal || 0) - totalExpensesMonth, [budgetGoal, totalExpensesMonth]);

    // Chart data calculation (similar to main component, but scoped)
    const spendVsBudgetData = useMemo(() => {
        if (budgetData.monthlySummaryHistory && budgetData.monthlySummaryHistory.length > 0) {
            return budgetData.monthlySummaryHistory.slice(-6).map(summary => ({
                name: new Date(summary.month + '-02').toLocaleString('default', { month: 'short' }),
                Expenses: summary.expenses,
                Budget: budgetGoal,
                Income: summary.income,
            }));
        }
        return [{ name: new Date().toLocaleString('default', { month: 'short' }), Expenses: totalExpensesMonth, Budget: budgetGoal, Income: totalIncomeMonth }];
    }, [budgetData.monthlySummaryHistory, budgetGoal, totalExpensesMonth, totalIncomeMonth]);


  return (
    <div className="space-y-8">
        {/* Top Row: Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
             <StatCard title="Earned This Month" value={formatCurrency(totalIncomeMonth)} color="text-green-500 dark:text-green-400" />
             <StatCard title="Spent This Month" value={formatCurrency(totalExpensesMonth)} color="text-red-500 dark:text-red-400" />
             <StatCard title="Saved This Month" value={formatCurrency(totalSavingsMonth)} color={totalSavingsMonth >= 0 ? "text-blue-600 dark:text-sky-500" : "text-red-500 dark:text-red-400"} />
             <StatCard title="Budget Remaining" value={formatCurrency(remainingBudget)} color={remainingBudget >= 0 ? "text-zinc-700 dark:text-zinc-300" : "text-red-500 dark:text-red-400"} />
         </div>

      {/* Mid Row: Chart - Use rounded-2xl and consistent padding */}
       <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6">
        <h2 className="text-lg font-semibold mb-1 text-zinc-800 dark:text-zinc-100">Spending vs Budget</h2>
         <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Last 6 months trend</p>
        <ResponsiveContainer width="100%" height={250}>
           {spendVsBudgetData.length > 0 ? (
               <AreaChart data={spendVsBudgetData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                        <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6B7280" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.6 }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.6 }} tickLine={false} axisLine={false} dx={-5} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} domain={['auto', 'auto']}/>
                     <RechartsTooltip
                         contentStyle={{
                             backgroundColor: 'rgba(30, 41, 59, 0.85)', // Slightly less transparent dark bg
                             border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
                             borderRadius: '0.75rem', // Rounded-xl
                             fontSize: '12px',
                             boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                             backdropFilter: 'blur(4px)'
                         }}
                         labelStyle={{ color: '#E5E7EB', fontWeight: '600', marginBottom: '4px', display: 'block' }} // Adjusted label style
                         itemStyle={{ color: '#F3F4F6' }} // Lighter item text
                         formatter={(value, name) => [formatCurrency(value), name]}
                         cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.6 }} // Use primary color for cursor
                     />
                    <Legend verticalAlign="top" height={30} iconSize={10} wrapperStyle={{ fontSize: '12px', color: 'currentColor', opacity: 0.8 }} />
                    <Area type="monotone" dataKey="Expenses" stroke="#6366F1" fill="url(#expensesGradient)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1, fill: '#fff', stroke: '#6366F1' }} name="Monthly Expenses" />
                    <Area type="monotone" dataKey="Budget" stroke="#9CA3AF" fill="url(#budgetGradient)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Monthly Budget" />
               </AreaChart>
           ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 italic">No data available for chart.</div>
           )}
        </ResponsiveContainer>
      </div>

        {/* Bottom Row: Recommendations - Updated card styling */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Savings Recommendation */}
             {savingsRecommendation && (
                 <RecommendationCard
                    icon={<TrendingUp />}
                    title="Savings Goal"
                    color="yellow"
                 >
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{savingsRecommendation.message}</p>
                 </RecommendationCard>
             )}
             {/* Debt Payoff Recommendation */}
             {hasDebt && (
                 <RecommendationCard
                     icon={<AlertTriangle />}
                     title="Debt Payoff Strategies"
                     color="orange"
                 >
                     <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">Consider these methods to tackle debt:</p>
                      <ul className="list-disc list-inside text-sm space-y-1.5 text-zinc-600 dark:text-zinc-400"> {/* Slightly increased spacing */}
                         <li><strong className="font-medium text-zinc-800 dark:text-zinc-200">Avalanche:</strong> Prioritize paying off loans with the highest interest rates first to save money over time.</li>
                         <li><strong className="font-medium text-zinc-800 dark:text-zinc-200">Snowball:</strong> Pay off the smallest loan balances first for quick wins and motivation.</li>
                     </ul>
                 </RecommendationCard>
             )}
             {!hasDebt && (
                  <RecommendationCard
                     icon={<Info />}
                     title="Debt Management"
                     color="blue"
                 >
                     <p className="text-sm text-zinc-700 dark:text-zinc-300">No loans detected in your financial profile. Keep up the great work!</p>
                 </RecommendationCard>
             )}
         </div>
    </div>
  );
});

// Updated StatCard styling
const StatCard = ({ title, value, color }) => (
  <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 transition hover:shadow-xl dark:hover:border-zinc-700">
    <h4 className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1 truncate">{title}</h4>
    <p className={`text-xl sm:text-2xl font-bold ${color || 'text-zinc-900 dark:text-white'}`}>{value}</p>
  </div>
);

// Updated RecommendationCard styling
const RecommendationCard = ({ icon, title, color = 'yellow', children }) => {
  const colorClasses = {
      yellow: 'border-yellow-400/40 dark:border-yellow-500/40 text-yellow-700 dark:text-yellow-400 bg-yellow-500/5 dark:bg-yellow-900/10',
      orange: 'border-orange-400/40 dark:border-orange-500/40 text-orange-700 dark:text-orange-400 bg-orange-500/5 dark:bg-orange-900/10',
      blue: 'border-blue-400/40 dark:border-sky-500/40 text-blue-700 dark:text-sky-400 bg-blue-500/5 dark:bg-sky-900/10',
  };
   // Extract base bg, border color, text color for icon wrapper and icon itself
   const selectedColorParts = colorClasses[color] || colorClasses.yellow;
   const [borderColorClass, , textColorClass, bgColorClass] = selectedColorParts.split(' ');


  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-5 border ${borderColorClass} transition hover:shadow-xl dark:hover:border-zinc-700`}>
       <div className="flex items-start space-x-3">
           <div className={`p-1.5 rounded-full ${bgColorClass}`}>
             {React.cloneElement(icon, { size: 20, className: textColorClass })}
           </div>
           <div>
             <h3 className="text-base font-semibold mb-1 text-zinc-800 dark:text-zinc-100">{title}</h3>
             <div className="text-sm text-zinc-600 dark:text-zinc-300">{children}</div>
           </div>
       </div>
    </div>
  );
};


// --- Breakdown & Budget Tab ---
// (Polished inputs, buttons, chart styling)
const BreakdownTab = React.memo(({ budgetData, categoryBreakdownData, isEditingBudget, setIsEditingBudget, tempBudgetGoal, setTempBudgetGoal, handleBudgetGoalSave }) => {
  const [activePieIndex, setActivePieIndex] = useState(null);

   const onPieEnter = useCallback((_, index) => {
      setActivePieIndex(index);
   }, [setActivePieIndex]);

   const onPieLeave = useCallback(() => {
       setActivePieIndex(null);
   }, [setActivePieIndex]);

    const renderActiveShape = (props) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 5) * cos;
        const sy = cy + (outerRadius + 5) * sin;
        const mx = cx + (outerRadius + 15) * cos;
        const my = cy + (outerRadius + 15) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 11;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
          <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-base font-semibold dark:fill-white fill-zinc-800">
              {payload.name}
            </text>
             {/* Increased outer radius on hover */}
             <Sector
                cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 4}
                startAngle={startAngle} endAngle={endAngle} fill={fill} stroke="#fff" strokeWidth={1} className="dark:stroke-zinc-900"/>
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
             <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
             <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill="currentColor" className="text-sm font-medium dark:fill-zinc-100 fill-zinc-700">
                 {`${formatCurrency(value)}`}
             </text>
             <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} dy={14} textAnchor={textAnchor} fill="currentColor" className="text-xs dark:fill-zinc-400 fill-zinc-500">
                {`(${(percent * 100).toFixed(1)}%)`}
            </text>
          </g>
        );
    };

  return (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Goal Setting */}
         <div className="md:col-span-1 space-y-6">
             <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 transition hover:shadow-xl dark:hover:border-zinc-700">
                 <div className="flex justify-between items-center mb-3">
                     <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Monthly Budget</h3>
                     {!isEditingBudget && (
                         <button onClick={() => setIsEditingBudget(true)} className="text-xs font-medium text-blue-600 dark:text-sky-500 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded">
                             Edit
                         </button>
                     )}
                 </div>
                 {isEditingBudget ? (
                     <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold text-zinc-500 dark:text-zinc-400">$</span>
                         <input
                             type="number"
                             value={tempBudgetGoal}
                             onChange={(e) => setTempBudgetGoal(e.target.value)}
                             onBlur={handleBudgetGoalSave} // Save on blur
                             onKeyDown={(e) => e.key === 'Enter' && handleBudgetGoalSave()}
                              className="flex-grow px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xl font-bold focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none transition duration-150 ease-in-out" // Standardized input
                             autoFocus
                             min="0"
                             step="10"
                         />
                          {/* Standardized buttons */}
                          <button onClick={handleBudgetGoalSave} className="px-3 py-1 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Save</button>
                          <button onClick={() => { setIsEditingBudget(false); setTempBudgetGoal(budgetData.budgetGoal); }} className="px-3 py-1 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500">Cancel</button>
                     </div>
                 ) : (
                     <p className="text-3xl font-bold text-zinc-900 dark:text-white">{formatCurrency(budgetData.budgetGoal, 0)}</p>
                 )}
                 <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Your target spending limit per month.</p>
             </div>
              {/* Category Budgets Placeholder - styled as card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 opacity-70 transition hover:shadow-xl dark:hover:border-zinc-700">
                 <h3 className="text-lg font-semibold mb-3 text-zinc-800 dark:text-zinc-100">Category Budgets</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 italic text-center py-4">
                     Set spending limits per category (coming soon).
                  </p>
              </div>
         </div>

        {/* Pie Chart Breakdown */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 transition hover:shadow-xl dark:hover:border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Expense Breakdown ({new Date().toLocaleString('default', { month: 'long' })})</h3>
            {categoryBreakdownData.length > 0 ? (
                 <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                         <Pie
                             activeIndex={activePieIndex}
                             activeShape={renderActiveShape}
                             data={categoryBreakdownData}
                             cx="50%"
                             cy="50%"
                             innerRadius={70} // Slightly larger inner radius
                             outerRadius={100} // Slightly larger outer radius
                             fill="#8884d8"
                             dataKey="value"
                             onMouseEnter={onPieEnter}
                             onMouseLeave={onPieLeave}
                             paddingAngle={2}
                             stroke="none" // Remove default stroke between segments
                         >
                             {categoryBreakdownData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1} className="dark:stroke-zinc-900" /> // Add white/dark border between cells
                             ))}
                         </Pie>
                         <RechartsTooltip content={<div className="hidden"></div>} /> {/* Hide default tooltip, use activeShape */}
                     </PieChart>
                 </ResponsiveContainer>
             ) : (
                 <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500 italic">
                    <BarChart2 size={32} className="mb-2 opacity-50" />
                    No expenses this month to break down.
                </div>
             )}
        </div>
     </div>
  );
});

// --- Recurring Tab ---
// (Polished list items, buttons)
const RecurringTab = React.memo(({ recurringData, onAddEdit, onDelete }) => {
  const { income = [], expenses = [] } = recurringData || {};

  const renderList = (items, type) => (
     <ul className="space-y-3">
       {items.length > 0 ? items.map(item => (
          <li key={item.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition duration-150"> {/* Use rounded-xl */}
           <div className="flex-grow min-w-0 mr-3">
             <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{item.title}</p>
             <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.frequency} &middot; Next: TBD</p> {/* Calculate next date later */}
           </div>
           <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`text-sm font-semibold ${type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-400'}`}>
                {type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
              </span>
              {/* Polished Edit/Delete buttons */}
              <button onClick={() => onAddEdit(type, item)} className="p-1.5 text-zinc-500 hover:text-blue-600 dark:hover:text-sky-500 transition-colors rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"><Edit2 size={14} /></button>
              <button onClick={() => onDelete(item.id, type)} className="p-1.5 text-zinc-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-1 focus:ring-red-500"><Trash2 size={14} /></button>
           </div>
         </li>
       )) : (
         <p className="text-sm text-zinc-500 dark:text-zinc-400 italic text-center py-6">No recurring {type} items found.</p>
       )}
     </ul>
   );


  return (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Recurring Income - use rounded-2xl */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 transition hover:shadow-xl dark:hover:border-zinc-700">
         <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Recurring Income</h3>
            {/* Polished Add button */}
            <button onClick={() => onAddEdit('recurringIncome')} className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition focus:outline-none focus:ring-1 focus:ring-green-500">
             <Plus size={12} /> Add
           </button>
         </div>
         {renderList(income, 'income')}
       </div>

       {/* Recurring Expenses - use rounded-2xl */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 transition hover:shadow-xl dark:hover:border-zinc-700">
         <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Recurring Expenses</h3>
            {/* Polished Add button */}
            <button onClick={() => onAddEdit('recurringExpense')} className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition focus:outline-none focus:ring-1 focus:ring-red-500">
             <Plus size={12} /> Add
           </button>
         </div>
         {renderList(expenses, 'expense')}
       </div>
     </div>
   );
});

// --- Transactions Tab ---
// (Polished list items)
const TransactionsTab = React.memo(({ transactions, income, onEdit, onDelete }) => {
  const allItems = useMemo(() => {
    const combined = [
      ...transactions.map(t => ({ ...t, type: 'expense', amount: t.amount || 0 })),
      ...income.map(i => ({ ...i, type: 'income', amount: i.amount || 0 }))
    ];
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, income]);

  return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 transition hover:shadow-xl dark:hover:border-zinc-700">
       <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Transaction History</h3>
       {allItems.length === 0 ? (
         <p className="text-sm text-zinc-500 dark:text-zinc-400 italic text-center py-8">No transactions or income recorded yet.</p>
       ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
           {allItems.map(item => (
              <li key={item.id} className="flex items-center justify-between py-3.5 gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 -mx-2 rounded-lg transition duration-150"> {/* Added hover bg and padding */}
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{item.title}</p>
                 <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                     {formatDate(item.date)} {item.category ? `· ${item.category}` : ''}
                 </p>
               </div>
                <div className={`text-sm font-semibold flex-shrink-0 w-24 text-right ${item.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-400'}`}> {/* Fixed width for alignment */}
                     {item.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
                 </div>
               <div className="flex-shrink-0 flex gap-2 ml-2">
                  {/* Polished Edit/Delete buttons */}
                  <button onClick={() => onEdit(item.type === 'income' ? 'income' : 'transaction', item)} className="p-1.5 text-zinc-500 hover:text-blue-600 dark:hover:text-sky-500 transition-colors rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"><Edit2 size={14} /></button>
                  <button onClick={() => window.confirm(`Delete "${item.title}"?`) && onDelete(item.id)} className="p-1.5 text-zinc-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-1 focus:ring-red-500"><Trash2 size={14} /></button>
               </div>
             </li>
           ))}
         </ul>
       )}
     </div>
   );
});

// --- Reports Tab ---
// (Polished card styling)
const ReportsTab = React.memo(({ monthlyHistory }) => {
   const chartData = useMemo(() => {
        return monthlyHistory.slice(-12).map(m => ({ // Last 12 months
            name: new Date(m.month + '-02').toLocaleString('default', { month: 'short', year: '2-digit'}),
            Income: m.income,
            Expenses: m.expenses,
            Savings: m.savings,
            'Savings Rate': m.income > 0 ? parseFloat(((m.savings / m.income) * 100).toFixed(1)) : 0,
        }));
   }, [monthlyHistory]);

   const avgSavingsRate = useMemo(() => {
       const validRates = chartData.filter(d => d.Income > 0).map(d => d['Savings Rate']);
       if (validRates.length === 0) return 0;
       return validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length;
   }, [chartData]);

   return (
      <div className="space-y-8">
           <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 transition hover:shadow-xl dark:hover:border-zinc-700">
              <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Monthly Trends (Last 12 Months)</h3>
             {chartData.length >= 2 ? (
                 <ResponsiveContainer width="100%" height={250}>
                     <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.6 }} tickLine={false} axisLine={false} dy={10} />
                          <YAxis yAxisId="left" tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.6 }} tickLine={false} axisLine={false} dx={-5} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.6 }} tickLine={false} axisLine={false} dx={5} tickFormatter={(val) => `${val}%`} domain={[0, 'auto']}/>
                          <RechartsTooltip
                              contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}
                              labelStyle={{ color: '#E5E7EB', fontWeight: '600', marginBottom: '4px', display: 'block' }}
                              itemStyle={{ color: '#F3F4F6' }}
                              formatter={(value, name) => [name === 'Savings Rate' ? `${value.toFixed(1)}%` : formatCurrency(value), name]}
                              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.6 }}
                          />
                          <Legend verticalAlign="top" height={30} iconSize={10} wrapperStyle={{ fontSize: '12px', color: 'currentColor', opacity: 0.8 }} />
                          <Line yAxisId="left" type="monotone" dataKey="Income" stroke="#22C55E" strokeWidth={2} dot={false} activeDot={{ r: 4 }}/>
                          <Line yAxisId="left" type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }}/>
                         <Line yAxisId="right" type="monotone" dataKey="Savings Rate" stroke="#3B82F6" strokeWidth={2} strokeDasharray="3 3" dot={false} activeDot={{ r: 4 }} />
                      </LineChart>
                 </ResponsiveContainer>
             ) : (
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 italic text-center py-8">Not enough data for reports yet.</p>
             )}
         </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 transition hover:shadow-xl dark:hover:border-zinc-700">
              <h3 className="text-lg font-semibold mb-2 text-zinc-800 dark:text-zinc-100">Average Savings Rate</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-sky-500">{avgSavingsRate.toFixed(1)}%</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Based on the last 12 months of data.</p>
         </div>

           {/* Placeholder for more insights */}
           <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 text-center opacity-70 transition hover:shadow-xl dark:hover:border-zinc-700">
               <Lightbulb className="mx-auto text-yellow-400 mb-3 w-8 h-8" />
               <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
                   More reports and budget insights coming soon.
               </p>
           </div>

      </div>
   );
});


export default BudgetingTool;