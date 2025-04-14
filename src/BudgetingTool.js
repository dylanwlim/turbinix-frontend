import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function BudgetingTool() {
  const [incomeData, setIncomeData] = useState({
    amount: '',
    frequency: 'monthly'
  });
  
  const [expenses, setExpenses] = useState([
    { category: 'Housing', amount: '', frequency: 'monthly' },
    { category: 'Food', amount: '', frequency: 'monthly' },
    { category: 'Transportation', amount: '', frequency: 'monthly' }
  ]);
  
  const [savingGoal, setSavingGoal] = useState('moderate'); // light, moderate, aggressive
  
  const [forecasts, setForecasts] = useState({
    calculated: false,
    dailySpendable: 0,
    weeklySpendable: 0,
    monthlySpendable: 0,
    yearlySavings: 0,
    monthlySavings: 0
  });
  
  const [newPurchase, setNewPurchase] = useState({
    name: '',
    cost: '',
    category: 'Electronics'
  });

  const [futurePurchases, setFuturePurchases] = useState([]);
  
  const [chartData, setChartData] = useState([]);
  
  // Frequencies and how they relate to monthly values
  const frequencyMultipliers = {
    daily: 30,
    weekly: 4.345,
    biweekly: 2.1725,
    monthly: 1,
    yearly: 1/12
  };
  
  const savingRates = {
    light: 0.1, // 10% savings
    moderate: 0.2, // 20% savings
    aggressive: 0.3 // 30% savings
  };
  
  const expenseCategories = [
    'Housing', 'Food', 'Transportation', 'Utilities', 
    'Entertainment', 'Insurance', 'Healthcare', 'Debt Payments',
    'Education', 'Personal Care', 'Clothing', 'Gifts/Donations',
    'Savings', 'Other'
  ];
  
  const purchaseCategories = [
    'Electronics', 'Furniture', 'Vehicle', 'Travel',
    'Clothing', 'Education', 'Housing', 'Entertainment'
  ];

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF',
    '#FF6B6B', '#54A0FF', '#5AEACF', '#FFDA83', '#FF9F43'
  ];
  
  useEffect(() => {
    if (forecasts.calculated) {
      prepareChartData();
    }
  }, [forecasts]);

  const prepareChartData = () => {
    const validExpenses = expenses.filter(exp => exp.amount && parseFloat(exp.amount) > 0);
    
    const data = validExpenses.map((expense, index) => {
      const monthlyAmount = parseFloat(expense.amount) * frequencyMultipliers[expense.frequency];
      return {
        name: expense.category,
        value: monthlyAmount,
        color: COLORS[index % COLORS.length]
      };
    });

    // Add savings as a category
    data.push({
      name: 'Savings',
      value: forecasts.monthlySavings,
      color: '#4CAF50' // Green for savings
    });

    // Add discretionary spending
    if (forecasts.monthlySpendable > 0) {
      data.push({
        name: 'Discretionary',
        value: forecasts.monthlySpendable,
        color: '#9C27B0' // Purple for discretionary
      });
    }

    setChartData(data);
  };
  
  const handleIncomeChange = (e) => {
    const { name, value } = e.target;
    setIncomeData({
      ...incomeData,
      [name]: value
    });
  };
  
  const handleExpenseChange = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = value;
    setExpenses(newExpenses);
  };
  
  const addExpenseCategory = () => {
    setExpenses([
      ...expenses,
      { category: 'Other', amount: '', frequency: 'monthly' }
    ]);
  };
  
  const removeExpenseCategory = (index) => {
    const newExpenses = [...expenses];
    newExpenses.splice(index, 1);
    setExpenses(newExpenses);
  };
  
  const handleNewPurchaseChange = (e) => {
    const { name, value } = e.target;
    setNewPurchase({
      ...newPurchase,
      [name]: value
    });
  };
  
  const calculateBudget = () => {
    if (!incomeData.amount || parseFloat(incomeData.amount) <= 0) {
      alert('Please enter a valid income amount');
      return;
    }
    
    // Convert all values to monthly
    const monthlyIncome = parseFloat(incomeData.amount) * frequencyMultipliers[incomeData.frequency];
    
    const monthlyExpenses = expenses.reduce((total, expense) => {
      if (expense.amount && parseFloat(expense.amount) > 0) {
        return total + (parseFloat(expense.amount) * frequencyMultipliers[expense.frequency]);
      }
      return total;
    }, 0);
    
    // Calculate savings based on goal
    const savingRate = savingRates[savingGoal];
    const monthlySavings = monthlyIncome * savingRate;
    
    // Calculate spendable amounts
    const monthlySpendable = monthlyIncome - monthlyExpenses - monthlySavings;
    const weeklySpendable = monthlySpendable / 4.345;
    const dailySpendable = monthlySpendable / 30;
    
    setForecasts({
      calculated: true,
      dailySpendable,
      weeklySpendable,
      monthlySpendable,
      yearlySavings: monthlySavings * 12,
      monthlySavings
    });
  };
  
  const addNewPurchase = () => {
    if (!newPurchase.name || !newPurchase.cost || parseFloat(newPurchase.cost) <= 0) {
      alert('Please enter a valid name and cost for the purchase');
      return;
    }
    
    // Add to future purchases list
    setFuturePurchases([
      ...futurePurchases, 
      {
        ...newPurchase,
        id: Date.now(), // Simple unique ID
        date: new Date().toISOString().split('T')[0] // Today's date
      }
    ]);
    
    // Clear form
    setNewPurchase({ name: '', cost: '', category: 'Electronics' });
  };

  const removePurchase = (id) => {
    setFuturePurchases(futurePurchases.filter(purchase => purchase.id !== id));
  };
  
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const estimateSavingTime = (cost) => {
    if (!forecasts.calculated || forecasts.monthlySavings <= 0) return 'N/A';
    
    const months = cost / forecasts.monthlySavings;
    if (months < 1) {
      return 'Less than a month';
    } else if (months < 12) {
      return `~${Math.ceil(months)} months`;
    } else {
      const years = months / 12;
      return `~${Math.floor(years)} year${years >= 2 ? 's' : ''} ${Math.ceil(months % 12)} month${months % 12 > 1 ? 's' : ''}`;
    }
  };
  
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">Budget Center</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Income & Expenses */}
          <div className="space-y-6">
            {/* Income Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
              <h2 className="text-xl font-bold mb-4">Income</h2>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-grow">
                  <label htmlFor="income-amount" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      id="income-amount"
                      type="number"
                      name="amount"
                      min="0"
                      step="0.01"
                      value={incomeData.amount}
                      onChange={handleIncomeChange}
                      className="w-full pl-7 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="income-frequency" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Frequency
                  </label>
                  <select
                    id="income-frequency"
                    name="frequency"
                    value={incomeData.frequency}
                    onChange={handleIncomeChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Expenses Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
              <h2 className="text-xl font-bold mb-4">Expenses</h2>
              
              <div className="space-y-4">
                {expenses.map((expense, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-end gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-grow">
                      <label htmlFor={`expense-category-${index}`} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Category
                      </label>
                      <select
                        id={`expense-category-${index}`}
                        value={expense.category}
                        onChange={(e) => handleExpenseChange(index, 'category', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      >
                        {expenseCategories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-28">
                      <label htmlFor={`expense-amount-${index}`} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          id={`expense-amount-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={expense.amount}
                          onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                          className="w-full pl-7 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor={`expense-frequency-${index}`} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Frequency
                      </label>
                      <select
                        id={`expense-frequency-${index}`}
                        value={expense.frequency}
                        onChange={(e) => handleExpenseChange(index, 'frequency', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => removeExpenseCategory(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                      aria-label="Remove expense"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={addExpenseCategory}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center"
                >
                  <span className="mr-1">+</span> Add Expense Category
                </button>
              </div>
            </div>
            
            {/* Saving Goal */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
              <h2 className="text-xl font-bold mb-4">Saving Goal</h2>
              
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="savingGoal"
                    value="light"
                    checked={savingGoal === 'light'}
                    onChange={() => setSavingGoal('light')}
                    className="mr-2"
                  />
                  <span>Light (10% of income)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="savingGoal"
                    value="moderate"
                    checked={savingGoal === 'moderate'}
                    onChange={() => setSavingGoal('moderate')}
                    className="mr-2"
                  />
                  <span>Moderate (20% of income)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="savingGoal"
                    value="aggressive"
                    checked={savingGoal === 'aggressive'}
                    onChange={() => setSavingGoal('aggressive')}
                    className="mr-2"
                  />
                  <span>Aggressive (30% of income)</span>
                </label>
              </div>
            </div>
            
            <button
              onClick={calculateBudget}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition"
            >
              Calculate Budget
            </button>
          </div>
          
          {/* Right Column - Results & Future Purchases */}
          <div className="space-y-6">
            {/* Budget Results */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
              <h2 className="text-xl font-bold mb-4">Budget Results</h2>
              
              {forecasts.calculated ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Daily</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(forecasts.dailySpendable)}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Weekly</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(forecasts.weeklySpendable)}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(forecasts.monthlySpendable)}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(forecasts.monthlySavings)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Yearly Savings</p>
                        <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{formatCurrency(forecasts.yearlySavings)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Budget Breakdown Chart */}
                  <div className="mt-6 h-64">
                    <h3 className="text-lg font-semibold mb-2">Budget Breakdown</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Fill out your information and calculate your budget to see results.</p>
                </div>
              )}
            </div>
            
            {/* Future Purchases */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
              <h2 className="text-xl font-bold mb-4">Future Purchases</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label htmlFor="purchase-name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Purchase Name
                    </label>
                    <input
                      id="purchase-name"
                      type="text"
                      name="name"
                      value={newPurchase.name}
                      onChange={handleNewPurchaseChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      placeholder="New car, Vacation, etc."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="purchase-cost" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        id="purchase-cost"
                        type="number"
                        name="cost"
                        min="0"
                        step="0.01"
                        value={newPurchase.cost}
                        onChange={handleNewPurchaseChange}
                        className="w-full pl-7 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="purchase-category" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    id="purchase-category"
                    name="category"
                    value={newPurchase.category}
                    onChange={handleNewPurchaseChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  >
                    {purchaseCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={addNewPurchase}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg font-medium transition"
                >
                  Add to Future Purchases
                </button>
              </div>
              
              {/* Future Purchases List */}
              {futurePurchases.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Your Future Purchases</h3>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {futurePurchases.map((purchase) => (
                      <div key={purchase.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{purchase.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {purchase.category} · {formatCurrency(purchase.cost)}
                          </p>
                          {forecasts.calculated && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Est. saving time: {estimateSavingTime(purchase.cost)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removePurchase(purchase.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          aria-label="Remove purchase"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetingTool;
